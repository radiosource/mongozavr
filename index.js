const MongoClient = require("mongodb");
const ObjectID = require("mongodb").ObjectID;
const AVAILABLE_OPTIONS = ["limit", "skip", "sort", "project"];

class Mongozavr {

    static getRandomId() {
        return new ObjectID();
    }

    constructor(config = {}) {
        this.url = config.url;
        this.db = config.db;

        if (!(this.url && this.db)) throw new Error("You must specified config - mongo connect url and db");

        config.collection && this._bindCollection(config.collection);
        this.connection = this._connect();
    }

    async find(collection, searchParams = {}, options = {}) {
        return this.connection.then(db => {
            let _collection = db.collection(collection),
                result = _collection.find(searchParams);

            searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});
            AVAILABLE_OPTIONS.forEach(optionName => {
                optionName in options && (result = result[optionName](options[optionName]))
            });
            return new Promise((resolve, reject) => result.toArray(this._handleResult(resolve, reject)));
        });
    }

    async findOne(collection, searchParams = {}, options = {}) {
        return this.find(...arguments).then(data => data && data[0]);
    }

    async count(collection, searchParams = {}, options = {}) {
        return this.connection.then(db => {
            let _collection = db.collection(collection);
            searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});

            return _collection.countDocuments(searchParams, options)
        });
    }


    insert(collection, documents) {
        !(documents instanceof Array) && (documents = [documents]);

        return this.connection
            .then(db => {
                return new Promise((resolve, reject) => {
                    return db.collection(collection).insertMany(documents, this._handleResult(resolve, reject));
                })
            });
    }

    update(collection, searchParams, updateParams, options = {}) {
        searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});
        const payload = updateParams.$set ? updateParams : {$set: updateParams};
        return this.connection.then(db => {
            return new Promise((resolve, reject) => {
                return db.collection(collection)
                    .update(searchParams, payload, options, this._handleResult(resolve, reject));
            });
        });
    }

    replace(collection, searchParams, updateParams, options = {}) {
        searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});

        return this.connection.then(db => {
            return new Promise((resolve, reject) => {
                return db.collection(collection)
                    .update(searchParams, updateParams, options, this._handleResult(resolve, reject));
            });
        });
    }

    updateOne(collection, searchParams, updateParams, options = {}) {
        searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});
        const payload = updateParams.$set ? updateParams : {$set: updateParams};
        return this.connection.then(db => {
            return new Promise((resolve, reject) => {
                return db.collection(collection)
                    .updateOne(searchParams, payload, options, this._handleResult(resolve, reject));
            });
        });
    }

    replaceOne(collection, searchParams, updateParams, options = {}) {
        searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});

        return this.connection.then(db => {
            return new Promise((resolve, reject) => {
                return db.collection(collection)
                    .updateOne(searchParams, updateParams, options, this._handleResult(resolve, reject));
            });
        });
    }

    removeOne(collection, searchParams, options = {}) {
        searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});

        return this.connection.then(db => {
            return new Promise((resolve, reject) => {
                return db.collection(collection).deleteOne(searchParams, options, this._handleResult(resolve, reject));
            })
        });
    }

    remove(collection, searchParams, options = {}) {
        searchParams._id && Object.assign(searchParams, {_id: new ObjectID(searchParams._id)});

        return this.connection.then(db => {
            return new Promise((resolve, reject) => {
                return db.collection(collection).removeMany(searchParams, options, this._handleResult(resolve, reject));
            })
        });
    }

    bulkInsert(collection, documents) {
        if (!documents) throw Error('Empty documents list for inserting!')
        return this.connection.then(db => {
            const bulk = db.collection(collection).initializeUnorderedBulkOp();
            documents.forEach(doc => bulk.insert(doc));
            return bulk.execute();
        });
    }

    _handleResult(resolve, reject) {
        return (err, result) => err ? reject(err) : resolve(result);
    }

    _connect() {
        return new Promise((resolve, reject) => {
            return MongoClient.connect(
                this.url,
                {useNewUrlParser: true, useUnifiedTopology: true},
                (err, _client) => {
                    if (err) return reject(err);
                    this.client = _client;
                    return this.db ? resolve(_client.db(this.db)) : _client;
                }
            );
        })
    }

    _bindCollection(collectionName) {
        this.find = this.find.bind(this, collectionName);
        this.count = this.count.bind(this, collectionName);
        this.insert = this.insert.bind(this, collectionName);
        this.update = this.update.bind(this, collectionName);
        this.updateOne = this.updateOne.bind(this, collectionName);
        this.replace = this.replace.bind(this, collectionName);
        this.replaceOne = this.replaceOne.bind(this, collectionName);
        this.remove = this.remove.bind(this, collectionName);
        this.removeOne = this.removeOne.bind(this, collectionName);
        this.bulkInsert = this.bulkInsert.bind(this, collectionName);
    }

}

module.exports = Mongozavr;
module.exports.default = Mongozavr;
