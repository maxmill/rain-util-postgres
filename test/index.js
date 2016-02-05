const test = require('tape-catch');
const Postgres = require('../bin');
const coTape = require('co-tape');

// need postgres installed for this test to pass
test('database query', coTape(function* (t) {
    var conn = {host: 'localhost', db: 'rain_dev', user: 'postgres'};
    var $postgres = new Postgres(conn);

    var schema = (yield $postgres.db.query('SELECT 1')).rows;
    var passed = schema && Object.keys(schema).length > 0;

    t[passed === true ? 'pass' : 'fail']('database query');

    t.end();
}));