import Vue from "vue"
import lodash from "lodash"
import recursiveTreeNode from "./recursiveTreeNode"

const template = `
    <div class='s-tree'>
        <recursiveTreeNode 
            v-for="(value, idx) in d_value"
            :key="idx"
            :value="value.value"
            :children="value.children"
            :open="value.open"
            :path="[idx]"
            @toggle="toggle(null, $event)"
        >
            <template slot-scope="value">
                <slot :value="value.value">
                    <!-- fallback -->
                    <div @click.stop="$emit('click', value.value)" class="s-tree-node-content">
                        {{value}}
                    </div>
                </slot>
            </template>
        </recursiveTreeNode>
    </div>
`

function nodeMapper(node) {
    return {
        value: node.value,
        children: node.children ? node.children.map(nodeMapper) : null,
        open: node.open || false
    }
}

function flatMaps(arr, identityFn){
    const idxMap = {}
    const valueMap = new Map()
    const identity = lodash.isFunction(identityFn) ? identityFn : lodash.identity

    const flattener = (v, idx, prefix) => {
        const key = prefix ? `${prefix}/${idx}` : idx.toString()
        idxMap[key] = v
        valueMap[identity(v.value)] = key
        if(v.children && v.children.length)
            lodash.each(v.children, (child, childIdx) => flattener(child, childIdx, key))
    }

    lodash.each(arr, (v, k) => flattener(v, k))
    return { idxMap, valueMap }
}

const sTree = Vue.component("s-tree", {
    components: { recursiveTreeNode },
    props: {
        value: {
            type: Array,
            default() { return [] }
        },
        identityFn: {
            type: Function,
            default: lodash.identity
        }
    },
    data() {
        return {
            d_value: [],
            idxMap: {},
            valueMap: new Map(),
        }
    },
    mounted() {
        this.d_value = lodash.cloneDeep(this.value).map(nodeMapper)
        const maps = flatMaps(this.d_value)
        this.idxMap = maps.idxMap
        this.valueMap = maps.valueMap
    },
    watch: {
        value(v) {
            this.d_value = lodash.cloneDeep(v).map(nodeMapper)
            const maps = flatMaps(this.d_value)
            this.idxMap = maps.idxMap
            this.valueMap = maps.valueMap
        }
    },
    computed: {
        openState() {
            const out = {}
            Object.keys(this.idxMap).forEach((key) => {
                out[key] = this.idxMap[key].open
            })
            return out
        }
    },
    methods: {
        toggle(value, arr) {
            const idxString = lodash.isArray(arr) ? arr.join('/') : this.valueMap[value]
            const node = this.idxMap[idxString]
            if(!node)
                return false

            const idxArr = idxString.split('/')
            return node.open ? this.m_close(idxArr) : this.m_open(idxArr)
        },
        m_open(idxArr) {
            const arr = lodash.cloneDeep(idxArr)
            const idxMap = this.idxMap
            lodash.times(arr.length, () => {
                const key = arr.join("/")
                idxMap[key].open = true
                arr.pop()
            })
        },
        m_close(idxArr) {
            const idxMap = this.idxMap
            idxMap[idxArr.join("/")].open = false
        }
    },
    template
})

export default sTree;
