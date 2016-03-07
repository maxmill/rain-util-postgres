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