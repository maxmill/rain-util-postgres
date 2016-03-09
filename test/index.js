const test = require('tape-catch');
const Postgres = require('../bin');
const coTape = require('co-tape');
const conn = {host: 'localhost', db: 'rain_dev', user: 'postgres'};
const $postgres = new Postgres(conn);
const testTable = 'DROP TABLE IF EXISTS testers; CREATE TABLE testers(id CHARACTER VARYING(40))WITH(OIDS=FALSE);ALTER TABLE testers OWNER TO postgres;';

test('database schema', coTape(function* (t) {
    yield $postgres.db.query(testTable);

    const results = yield $postgres.schema();
    const passed = results && Object.getOwnPropertyNames(results).length > 0;

    t[passed === true ? 'pass' : 'fail']('found database schema info');
    t.end();
}));

test('database query rows using SQL', coTape(function* (t) {
    const results = (yield $postgres.db.query('SELECT 1')).rows;
    const passed = results && Object.keys(results).length > 0;

    t[passed === true ? 'pass' : 'fail']('queried using SQL');
    t.end();
}));

test('database findOne/insert row using DAO', coTape(function* (t) {
    yield $postgres.db.query(testTable);

    $postgres.table('testers');

    const testerId = '4a2b';
    yield $postgres.tables.testers.insert({id: testerId});

    const tester = yield  $postgres.tables.testers.findOne('id = ?', testerId);
    const passed = tester && tester.id === testerId;

    t[passed === true ? 'pass' : 'fail']('queried using DAO');
    t.end();
}));

test('id in dao record matches id in sql record', coTape(function* (t) {

    const conn = {host: 'localhost', db: 'rain_dev', user: 'postgres'};
    const $postgres = new Postgres(conn); // connection string also acceptable

    if ($postgres) {

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

        const passed = daoRecord && sqlRecord && daoRecord.id === sqlRecord.id;

        t[passed === true ? 'pass' : 'fail']('id in dao record matches id in sql record');
        t.end();
    }
}));