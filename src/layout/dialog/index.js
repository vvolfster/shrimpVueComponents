/* eslint-disable import/no-webpack-loader-syntax */
// import lodash from 'lodash'
import Vue from 'vue'
import shared from '../shared'
import instance from './instance'
import '../modal/modal.css'

function createContainer() {
    const frag = document.createDocumentFragment();
    const containerNode = document.createElement("div");
    const containerId = `dialogContainer_${shared.dialogs.newKey}`
    const instanceId = `dialogObject_${shared.dialogs.newKey}`

    containerNode.id = containerId;
    containerNode.className = "modalContainer";
    containerNode.innerHTML = `<instance id="${instanceId}" :params="params"/>`
    containerNode.style.display = "flex";
    containerNode.style.alignItems = "center";
    containerNode.style.justifyContent = "center";

    frag.appendChild(containerNode);
    document.body.appendChild(frag);
    return {
        container: containerNode,
        instanceId,
        containerId
    }
}

function create(params) {
    const retObj = createContainer();
    const container = retObj.container;
    const instanceId = retObj.instanceId;
    const dialog = new Vue({
        el: `#${instanceId}`,
        methods: {
            open() {
                if(this.$refs.instance)
                    this.$refs.instance.open();
            },
            close() {
                if(this.$refs.instance)
                    this.$refs.instance.close();
            }
        },
        destroyed() {
            console.log('aaah i die')
            container.parentNode.removeChild(container);
        },
        data() {
            return {
                params
            }
        },
        mounted() {
            this.open();
        },
        components: { instance }
    })

    container.addEventListener('click', () => {
        console.log(dialog.methods);
        dialog.$destroy();
    })

    // console.log(dialog);
    // dialog.open();
}

export default {
    create
};
