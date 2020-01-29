# mongozavr
Simple client for mongodb
## Installing

```bash
$ npm install mongozavr
```

## Example
##### Basic usage
```js
const Mongo = require("mongozavr");
const mongo = new Mongo({url: "mongodb://127.0.0.1:27017", db: "someDbName"});
const _id = Mongo.getRandomId();
await mongo.insert('someCollectionName', {_id, "foo": "bar"});
await mongo.find('someCollectionName', {}, {"limit":10, "skip":10, "sort":{"_id":-1}});
```
##### With collection binding
```js
const Mongo = require("mongozavr");
const mongo = new Mongo({url: "mongodb://127.0.0.1:27017", db: "someDbName", collections: "someCollectionName"});
const _id = Mongo.getRandomId();
await mongo.insert({_id, "foo": "bar"});
await mongo.find({}, {"limit":10, "skip":10, "sort":{"_id":-1}});
```
##### Finding by _id without using ObjectId
```js
const Mongo = require("mongozavr");
await mongo.find('someCollectionName', {_id, "5e318aa8473d790943408095"});
await mongo.update('someCollectionName', {_id, "5e318aa8473d790943408095"}, {"foo": "bar"});
```

## API

##### static getRandomId() - returns random mongodb ObjectId
##### insert(collection, documents)
##### find(collection, [searchParams], [options])
##### count(collection, [searchParams], [options])
##### remove(collection, searchParams, [options])
##### removeOne(collection, searchParams, [options])
##### update(collection, searchParams, updateParams, [options])
##### updateOne(collection, searchParams, updateParams, [options])

