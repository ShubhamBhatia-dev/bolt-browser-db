// Bolt: IndexedDB Library with MongoDB-like Features and Database-Based Store Management
class Bolt {
    constructor(storeName) {
        this.dbName = storeName;
        this.storeName = storeName;
        this.db = null;

        // Automatically initialize the database
        this.init().catch((err) => {
            console.error(`Failed to initialize database '${this.dbName}':`, err);
        });
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(this.storeName, { keyPath: '_id', autoIncrement: true });
                console.log(`Database '${this.dbName}' and store '${this.storeName}' created.`);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log(`Database '${this.dbName}' initialized successfully.`);
                resolve(this);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    async _ensureDatabaseExists() {
        if (!this.db) {
            console.warn('Database is not initialized. Reinitializing.');
            await this.init();
        }
    }

    async _getTransaction(storeMode = 'readonly') {
        await this._ensureDatabaseExists();
        return this.db.transaction(this.storeName, storeMode).objectStore(this.storeName);
    }

    async insertOne(doc) {
        const store = await this._getTransaction('readwrite');
        return new Promise((resolve, reject) => {
            const request = store.add(doc);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async insertMany(docs) {
        return Promise.all(docs.map(doc => this.insertOne(doc)));
    }

    async findOne(query = {}) {
        const store = await this._getTransaction('readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                const result = request.result.find(doc =>
                    Object.keys(query).every(key => doc[key] === query[key])
                );
                resolve(result || null);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async find(query = {}) {
        const store = await this._getTransaction('readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                const result = request.result.filter(doc =>
                    Object.keys(query).every(key => doc[key] === query[key])
                );
                resolve(result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async update(filter, update) {
        const store = await this._getTransaction('readwrite');
        const docs = await this.find(filter);

        return Promise.all(
            docs.map(doc => {
                const updatedDoc = { ...doc, ...update };
                return new Promise((resolve, reject) => {
                    const request = store.put(updatedDoc);

                    request.onsuccess = () => resolve(updatedDoc);
                    request.onerror = () => reject(request.error);
                });
            })
        );
    }

    async delete(query) {
        const store = await this._getTransaction('readwrite');
        const docs = await this.find(query);

        return Promise.all(
            docs.map(doc => {
                return new Promise((resolve, reject) => {
                    const request = store.delete(doc._id);

                    request.onsuccess = () => resolve(doc._id);
                    request.onerror = () => reject(request.error);
                });
            })
        ).then(results => results.length);
    }

    async sum(field, condition = {}) {
        const store = await this._getTransaction('readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                const result = request.result
                    .filter(doc => Object.keys(condition).every(key => doc[key] === condition[key]))
                    .reduce((acc, doc) => acc + (doc[field] || 0), 0);
                resolve(result);
            };

            request.onerror = () => reject(request.error);
        });
    }

    async aggregate(pipeline) {
        const store = await this._getTransaction('readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                let result = request.result;

                pipeline.forEach((stage) => {
                    if (stage.$match) {
                        result = result.filter(doc =>
                            Object.keys(stage.$match).every(key => doc[key] === stage.$match[key])
                        );
                    } else if (stage.$group) {
                        const grouped = {};
                        result.forEach(doc => {
                            const key = doc[stage.$group._id];
                            if (!grouped[key]) grouped[key] = { _id: key, ...stage.$group.initial };
                            Object.keys(stage.$group).forEach(field => {
                                if (field !== '_id' && field !== 'initial') {
                                    grouped[key][field] = (grouped[key][field] || 0) + doc[field];
                                }
                            });
                        });
                        result = Object.values(grouped);
                    }
                });

                resolve(result);
            };

            request.onerror = () => reject(request.error);
        });
    }
}

export default Bolt;