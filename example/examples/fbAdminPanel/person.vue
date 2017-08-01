<template>
    <div class="openHousePosting">
        <div v-if="value">
            <div v-for="entry in renderKeys" :key="entry" @click="randomize(entry)">
                <div class="field">
                    {{ entry }} : {{ value[entry] }}
                </div>
            </div>
        </div>
        <div v-else>
            no value...
        </div>
    </div>
</template>

<script>
    import Chance from 'chance'
    // import lodash from 'lodash'

    export default {
        props: ["id", "value", "fbRef"],
        data() {
            return {
                renderKeys: ["first", "last", "age", "gender", "address", "city", "state", "zip"]
            }
        },
        methods: {
            init({ id, value, storage }) {
                this.id = id;
                this.value = value;
                this.storage = storage || {};
                console.warn("openHousePosting.vue", this.id, this.value, this.storage);
            },
            randomize(field) {
                const chance = new Chance();
                const ref = this.fbRef;
                if(typeof chance[field] === 'function') {
                    ref.update({ [field]: chance[field]() })
                }
            }
        }
    }
</script>

<style>
    .openHousePosting {
        border: solid 1px;
        padding: 5px;
    }

    .field {
        cursor: pointer;
    }
</style>

