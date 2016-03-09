# rain-util-postgres #

[![Build Status](https://travis-ci.org/maxmill/rain-util-postgres.svg?style=flat-square)](https://travis-ci.org/maxmill/rain-util-postgres)
[![npm](https://img.shields.io/npm/v/rain-util-postgres.svg?style=flat-square)]()
[![npm](https://img.shields.io/npm/dt/rain-util-postgres.svg)]()


Generator based, co/koa compatible utility for accessing postgres

```
npm i rain-util-postgres
const $Postgres = require('rain-util-postgres');
```

### data access ###
queries, data access objects, transactions
```
const conn = { host: 'localhost', db: 'postgres', user: 'postgres', password: 'postgres' };
const $postgres =  new $Postgres(conn); // connection string also acceptable

if($postgres) {
    
// create a test table
        const tableName = 'testers';
        const testTable = `DROP TABLE IF EXISTS ${tableName}; CREATE TABLE ${tableName}(id CHARACTER VARYING(40))WITH(OIDS=FALSE);ALTER TABLE ${tableName} OWNER TO postgres;`;
        yield $postgres.db.query(testTable);

// load created table into $postgres object
        $postgres.table(tableName);

// add a record
        const recordId = '4a2b';
        yield $postgres.tables[`${tableName}`].upsert({id: recordId});
        
// find created record using dao
        const daoRecord = yield  $postgres.tables[`${tableName}`].findOne('id = ?', recordId);
        
// find created record using sql
        const findRecordSQL = `SELECT * FROM ${tableName} WHERE id = '${recordId}'`;
        const sqlRecord = (yield $postgres.db.query(findRecordSQL)).rows[0];
}
```

### schema info ###
```
// for each table, provide info on columns, indexes, and constraints
    const schemaInfo = yield $postgres.schema();
```



### credits ###

- https://github.com/evs-chris/node-postgres-gen

