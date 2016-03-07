'use strict';

const pg = require('postgres-gen');
const dao = require('postgres-gen-dao');

function Database(connection) {
    /**
     * https://github.com/evs-chris/node-postgres-gen/blob/master/README.md
     * this.db
     * @methods
     * query | nonQuery | transaction
     */
    this.db = pg(connection);

    /**
     * https://github.com/evs-chris/postgres-gen-dao
     * this.table.objectName
     * @methods
     * find | findOne( [ conditions ], [ parameters ], [ options ] )
     * insert | update | upsert | delete( object, [ options ] )
     */
    this.tables = {};
}

Database.prototype.table = function (name) {
    this.tables[name] = dao({ db: this.db, table: name }); // load table data access object
};

Database.prototype.schema = function* () {
    let namespace = arguments.length <= 0 || arguments[0] === undefined ? 'public' : arguments[0];

    return yield require('./schema')(this.db, namespace);
};

module.exports = Database;