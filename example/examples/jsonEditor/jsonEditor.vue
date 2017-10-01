<template>
    <div>
        <div class="row margin-bottom">
            <button @click='mode = "tree"'>Tree</button>
            <button @click='mode = "view"'>View</button>
            <button @click='mode = "form"'>Form</button>
            <button @click='mode = "code"'>Code</button>
        </div>

        <json
            :value="obj"
            :options="{ mode }"
            
        />

        <pre>
            {{ JSON.stringify(obj, null, 2) }}
        </pre>
    </div>
</template>

<script>
import json from '@/input/json'

export default {
    components: { json },
    data() {
        return {
            mode: 'tree',
            obj: {
                first: "Shahan",
                last: "Kazi"
            }
        }
    },
    methods: {
        log(...p) {
            console.log(...p);
        }
    }
}
</script>

<style scoped>
</style>
