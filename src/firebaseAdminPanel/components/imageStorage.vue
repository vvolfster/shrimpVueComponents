<template>
    <div style="position=relative;">
        <imageGrid :collection="storage" cellSize="10em" :addFn="add" :removeFn="remove" />
    </div>
</template>

<script>
    import lodash from 'lodash'
    import imageGrid from './imageStorage/imageGrid'
    import fbase from '../fbase'

    export default {
        data() {
            return {
                storage: {},
                unsubFn: null,

                // passed in thru init Function
                name: null,
                id: null,
                storageKey: null,
            }
        },
        beforeDestroy() {
            this.removeSubscriptions();
        },
        methods: {
            add(files) {
                const vm = this;
                let dbStorageObject = null;
                return new Promise((resolve) => {
                    if(!files)
                        return resolve("no files");

                    function getTableRef() {
                        return new Promise((resolve, reject) => {
                            fbase.getTableRef(vm.name).then((ref) => {
                                dbStorageObject = ref.child(vm.id).child(vm.storageKey);
                                resolve();
                            }).catch(reject);
                        })
                    }

                    function addSingleFile(file) {
                        return new Promise((resolve, reject) => {
                            function getUniqueKey() {
                                return new Promise((resolve, reject) => {
                                    dbStorageObject.push().then(resolve).catch(reject);
                                })
                            }

                            function uploadToStorage({ key }) { // snap is passed here
                                return new Promise((resolve, reject) => {
                                    const path = `${vm.name}/${vm.id}/${key}`;
                                    fbase.getStorageRef(path).then((storageRef) => {
                                        storageRef.put(file).then(() => {
                                            resolve({ key, path })
                                        }).catch(reject);
                                    }).catch(reject);
                                })
                            }

                            function updateDbStorageRecord({ key, path }) {
                                return new Promise((resolve, reject) => {
                                    dbStorageObject.child(key).set(path).then(resolve).catch(reject);
                                })
                            }

                            getUniqueKey()
                            .then(uploadToStorage)
                            .then(updateDbStorageRecord)
                            .then(resolve)
                            .catch(reject);
                        })
                    }

                    return getTableRef().then(() => {
                        const promises = lodash.reduce(files, (a, file) => {
                            a.push(addSingleFile(file));
                            return a;
                        }, []);

                        return Promise.all(promises).then(resolve).catch(resolve);
                    }).catch(resolve);
                })
            },

            // { url, key, index }
            remove({ key }) {
                const vm = this;
                return new Promise((resolve, reject) => {
                    function removeFromDb() {
                        return new Promise((resolve, reject) => {
                            fbase.getTableRef(vm.name).then((ref) => {
                                const dbStorageObject = ref.child(vm.id).child(vm.storageKey).child(key);
                                dbStorageObject.remove().then(resolve).catch(reject);
                            }).catch(reject);
                        })
                    }

                    function removeFromStorage() {
                        const path = `${vm.name}/${vm.id}/${key}`;
                        return new Promise((resolve, reject) => {
                            fbase.getStorageRef(path).then((storageRef) => {
                                storageRef.delete().then(resolve).catch(reject);
                            }).catch(reject);
                        })
                    }

                    Promise.all([removeFromDb(), removeFromStorage()]).then(resolve).catch(reject);
                })
            },

            init({ name, id, storageKey }) {
                this.name = name;
                this.id = id;
                this.storageKey = storageKey;

                this.clearStorageData().then(this.removeSubscriptions).then(this.createSubscriptions);
            },

            clearStorageData() {
                const self = this;
                return new Promise((resolve) => {
                    self.storage = {};
                    resolve();
                })
            },
            removeSubscriptions() {
                const self = this;
                return new Promise((resolve) => {
                    if(typeof self.unsubFn === 'function') {
                        self.unsubFn();
                        self.unsubFn = null;
                    }
                    resolve();
                })
            },
            createSubscriptions() {
                const self = this;
                return new Promise((resolve, reject) => {
                    if(!self.name)
                        return reject("property: name missing. The table name is required to create subscriptions on storage");

                    if(self.id === undefined || self.id === null)
                        return reject("property: id missing. The id of a child is required to create subscriptions on storage");

                    if(!self.storageKey)
                        return reject("property: storageKey missing. The storageKey is required to create subscriptions on storage. THIS IS NOT CONSIDERED A FAILURE. We assume the table has no storage.");

                    // console.log(`fbase storage subscription @ ${self.name}/${self.id}/${self.storageKey}`)
                    return fbase.getTableRef(self.name).then((ref) => {
                        const poi = ref.child(self.id).child(self.storageKey);  // this is the path we are interested at!

                        const subscriptions = {
                            addOrChange(snap) {
                                // console.log("ADD", snap.key, snap.val());
                                const path = snap.val();
                                fbase.getStorageUrl(path).then(url => self.$set(self.storage, snap.key, url))
                            },
                            remove(snap) {
                                if(self.storage[snap.key])
                                    self.$delete(self.storage, snap.key);
                            },
                        }

                        poi.on("child_added", subscriptions.addOrChange);
                        poi.on("child_changed", subscriptions.addOrChange);
                        poi.on("child_removed", subscriptions.remove);

                        self.unsubFn = () => {
                            poi.off("child_added", subscriptions.addOrChange);
                            poi.off("child_changed", subscriptions.addOrChange);
                            poi.off("child_removed", subscriptions.remove);
                        }
                    }).catch(reject);
                })
            },
        },
        components: {
            imageGrid
        }
    }
</script>

<style scoped>
.cell {
    margin: 5px;
    border: solid 1px gray;
    border-radius: 5%;
    object-fit: contain;
    background-color: lightgray;
    width: 10em;
    height: 10em;
    display: inline-block;
}

.dropzoneModal {
    min-width: 50vw;
    background: white;
    padding-bottom: 4vh;
}

.dropzone {
    border: 2px dashed #ccc;
    background-color: #fafafa;
    width: 50vw;
    min-height: 50vh;
    margin: 1vh 1vw 1vh 1vw;
    padding: 1vh 1vw 1vh 1vw;
    cursor: pointer;
}

.dropzone:hover {
    border-color: orange;
    background-color: lightyellow;
}

.dz-message {
    color: #666;
}

.dz-message span {
    line-height: 1.8;
    font-size: 13px;
    letter-spacing: 0.4px;
}

.dz-message span .dropzone-title {
    display: block;
    color: #888;
    font-size: 1.25em;
}

.dz-message span .dropzone-info {
    display: block;
    color: #a8a8a8;
}
    
    


.dropzoneModal__submitArea {
    height: 10vh;
    color: black;
    width: 100%;
    text-align: center;
}

.dropzoneModal__title {
    width: 100%;
    height: 10vh;
    background: white;
    font-size: 20pt;
    color: gray;
    cursor: default;
}
</style>
