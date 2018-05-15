<template>
    <div class="row">
        <tree :value="norseModel" ref="tree">
            <template slot-scope="node">
                <s-btn
                    @click.stop="selected = node.value"
                    :customStyle="selected === node.value ? 'background: orange;' : ''"
                >
                    {{node.value}}
                </s-btn>
            </template>
        </tree>
        <div>
            <button 
                v-for="(value, idx) in flatNorseModel" :key="idx"
                @click="$refs.tree.toggle(value)"
            >
                {{value}}
            </button>
        </div>
    </div>
</template>

<script>
import tree from "@/layout/tree"
import sBtn from "@/components/sBtn"

const loki = {
    value: "Loki",
    children: [
        { value: "Jormungandr" },
        { value: "Fenrir" }
    ]
}

const norseModel = [{
    value: "Odin",
    children: [
        { value: "Thor" },
        { value: "Baldur" },
        loki
    ]
}]

const flatNorseModel = ["Odin", "Thor", "Baldur", "Loki", "Jormungandr", "Fenrir"]

export default {
    components: { tree, sBtn },
    methods: {
        log(e) {
            console.log(e)
        }
    },
    data() {
        return { norseModel, flatNorseModel, selected: null }
    }
}
</script>

<style scoped>
</style>
