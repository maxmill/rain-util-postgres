# rain-util #

[![Build Status](https://travis-ci.org/maxmill/rain-util-postgres.svg?style=flat-square)](https://travis-ci.org/maxmill/rain-util-postgres)
[![npm](https://img.shields.io/npm/v/rain-util-postgres.svg?style=flat-square)]()
[![npm](https://img.shields.io/npm/dt/rain-util-postgres.svg)]()


Generator based, co/koa compatible utility for accessing postgres

```
npm i rain-util-postgres
var $util = require('rain-util-postgres');
```

### postgres ###
queries, data access objects, transactions
```
var conn = { host: 'localhost', db: 'postgres', user: 'postgres', password: 'postgres' };
var $postgres =  new $util.postgres(conn); // connection string also acceptable

if($postgres) {
  postgres.db.query('SELECT test');

  $postgres.table('books');

  var b = { author: 'Johnny test', title: 'I Like Books'};

  $postgres.tables.books.upsert(b).then(function() {
    console.log(b.id + ' - ' + b.createdAt + ' - ' + b.updatedAt); // values are loaded back :)
  });

  $postgres.db.transaction(function*() {
    var b = yield $postgres.tables.books.findOne('id = ?', 1);  // b is book with id 1
    yield $postgres.dao.delete(b); // delete by model throws if more than one row is affected
    yield $postgres.dao.delete('published > 1967'); // delete by query, returns count
  });

}
```



### credits ###

- https://github.com/evs-chris/node-postgres-gen

