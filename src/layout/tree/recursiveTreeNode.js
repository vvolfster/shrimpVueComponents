import Vue from "vue"

const template = `
    <div class="s-tree-node">
        <div class="row items-center">
            <slot :value="value"/>
            <div 
                v-if="children && children.length"
                @click.stop="$emit('toggle', path)"
                class="s-tree-node-expander fa" :class="open ? 'fa-angle-up' : 'fa-angle-down'"
            />
        </div>
        <recursiveTreeNode 
            v-if="children && children.length && open" 
            v-for="(child, idx) in children" :key="idx"
            :value="child.value"
            :children="child.children"
            :open="child.open"
            :path="[...path, idx]"
            @toggle="$emit('toggle', $event)"
        >
            <template slot-scope="value">
                <slot :value="value.value"/>
            </template>
        </recursiveTreeNode>
    </div>
`

const recursiveTreeNode = Vue.component("recursiveTreeNode", {
    name: "recursiveTreeNode",
    props: ["value", "children", "open", "path"],
    template
})

export default recursiveTreeNode;
