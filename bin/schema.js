'use strict';

const withoutTableName = c => {
    delete c.table_name;
    return c;
};

const excludeTables = function excludeTables() {
    let tables = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    let omittedPrefixes = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    if (typeof omittedPrefixes === 'string') {
        omittedPrefixes = [omittedPrefixes];
    }
    omittedPrefixes = ['seed', 'migrate', 'pg', 'schema'].concat(omittedPrefixes);
    return tables.map(t => t.table_name).filter(name => omittedPrefixes.indexOf((name.split('_')[0] || name) < 0));
};

const field = column => ({
    name: column.column_name,
    type: column.udt_name,
    nullable: column.is_nullable && column.is_nullable === 'YES',
    maxLength: column.character_maximum_length,
    updatable: column.is_updatable && column.is_updatable === 'YES'
});

const constraint = c => ({ name: c.constraint_name, type: c.constraint_type });

const filterMatches = (rows, tableName) => rows.filter(entity => entity.table_name === tableName);

const updateEntitiesWithTable = results => (entities, table) => {
    entities[table] = {
        columns: filterMatches(results.columns, table).map(field),
        indexes: filterMatches(results.indexes, table).map(withoutTableName),
        constraints: filterMatches(results.constraints, table).map(withoutTableName).map(constraint)
    };
    return entities;
};

module.exports = function (db, namespace, omittedPrefixes) {
    const sql = {
        tables: `SELECT table_name FROM information_schema.tables  WHERE table_schema='${ namespace }';`,
        columns: `SELECT * FROM information_schema.columns WHERE table_schema = '${ namespace }'`,
        indexes: `SELECT U.usename AS user_name, ns.nspname AS schema_name, idx.indrelid::REGCLASS AS table_name, i.relname AS index_name, idx.indisunique AS is_unique, idx.indisprimary AS is_primary, am.amname AS index_type, idx.indkey, ARRAY( SELECT pg_get_indexdef(idx.indexrelid, k + 1, TRUE) FROM generate_subscripts(idx.indkey, 1) AS k ORDER BY k) AS index_keys,(idx.indexprs IS NOT NULL) OR (idx.indkey::int[] @> array[0]) AS is_functional, idx.indpred IS NOT NULL AS is_partial FROM pg_index AS idx JOIN pg_class AS i ON i.oid = idx.indexrelid JOIN pg_am AS am ON i.relam = am.oid JOIN pg_namespace AS NS ON i.relnamespace = NS.OID JOIN pg_user AS U ON i.relowner = U.usesysid WHERE nspname='${ namespace }';`,
        constraints: `SELECT constraint_name, constraint_type, table_name FROM information_schema.table_constraints  WHERE table_schema = '${ namespace }'`
    };
    return function* () {
        var results = {
            tables: (yield db.query(sql.tables)).rows,
            columns: (yield db.query(sql.columns)).rows,
            indexes: (yield db.query(sql.indexes)).rows,
            constraints: (yield db.query(sql.constraints)).rows
        };
        return excludeTables(results.tables, omittedPrefixes).reduce(updateEntitiesWithTable(results), {});
    };
};