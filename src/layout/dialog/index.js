/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable max-len */
// import lodash from 'lodash'
import Vue from 'vue'
import lodash from 'lodash'
import shared from '../shared'
import instance from './instance'
import '../modal/modal.css'

function createContainer(attributes, style, className) {
    const frag = document.createDocumentFragment();
    const containerNode = document.createElement("div");
    const wrapperNode = document.createElement("div");

    const containerId = `dialogContainer_${shared.dialogs.newKey}`
    const instanceId = `dialogObject_${shared.dialogs.newKey}`

    containerNode.id = containerId;
    containerNode.className = className ? `modalContainer ${className}` : "modalContainer";
    containerNode.style.display = "flex";
    containerNode.style.alignItems = "center";
    containerNode.style.justifyContent = "center";

    if(toString.call(attributes) === '[object Object]')
        lodash.each(attributes, (v, k) => { containerNode.setAttribute(k, v); })

    if(toString.call(style) === '[object Object]')
        lodash.each(style, (v, k) => { containerNode.style[k] = v })
    else if(typeof style === 'string')
        containerNode.style = style;

    wrapperNode.className = "modalObjectWrapper";
    wrapperNode.innerHTML = `<instance id="${instanceId}" :params="params" :position="position" :animation="animation" :duration="duration" @close="dismiss" ref="instance"/>`

    containerNode.appendChild(wrapperNode);
    frag.appendChild(containerNode);
    document.body.appendChild(frag);
    return {
        container: containerNode,
        instanceId,
        containerId
    }
}

function getPositionAndAnimationInfo(params) {
    const posAnim = {
        position: "center",
        animation: "up",
        animationDuration: 300
    }

    const position = lodash.get(params, "position");
    if(position && ["up", "down", "left", "right", "center", ""].indexOf(position) !== -1)
        posAnim.position = position;

    const animation = lodash.get(params, "animation");
    if(animation && ["up", "down", "left", "right", "none", ""].indexOf(animation) !== -1)
        posAnim.animation = animation;

    const animationDuration = lodash.get(params, "animationDuration")
    if(animationDuration && typeof animationDuration === 'number' && animationDuration >= 0)
        posAnim.animationDuration = animationDuration;

    return posAnim;
}

function create(params) {
    const attributes = params.attributes;
    const style = params.style;
    const className = params.className || params.class;

    const retObj = createContainer(attributes, style, className);
    const container = retObj.container;
    const onDismiss = params.onDismiss;
    const busyCanBeDismissed = params.dismissBusy;
    const posAnim = getPositionAndAnimationInfo(params);
    const instanceId = retObj.instanceId;

    container.style.cursor = params.noDismiss ? 'not-allowed' : 'pointer';
    const dialog = new Vue({
        el: `#${instanceId}`,
        methods: {
            dismiss() {
                if(this.isBusy() && !busyCanBeDismissed)
                    return;

                this.isDismissed = true;
                lodash.each(this.dismissFns, (fn) => {
                    if(typeof fn === 'function')
                        fn();
                })

                if(typeof onDismiss === 'function')
                    onDismiss();

                this.$destroy();
            },
            isBusy() {
                if(this.$refs && this.$refs.instance)
                    return this.$refs.instance.isBusy();
                return false;
            },
            onDismiss(fn) {
                if(typeof fn === 'function')
                    this.dismissFns.push(fn);
            }
        },
        destroyed() {
            container.parentNode.removeChild(container);
        },
        data() {
            return {
                params,
                isDismissed: false,
                dismissFns: [],
                position: posAnim.position,
                animation: posAnim.animation,
                duration: posAnim.animationDuration
            }
        },
        components: { instance }
    })

    shared.dialogs.push(dialog);

    if(!params.noDismiss)
        container.addEventListener('click', dialog.dismiss);

    return dialog;
}

const Dialog = {
    create,
    dismissAll() {
        shared.dialogs.dismissAll();
        // also delete remove any dangling diaogs that may be left from last reload
        const remainingDialogs = document.querySelectorAll('*[id^="dialogContainer_"]');
        lodash.each(remainingDialogs, dialog => dialog.parentNode.removeChild(dialog))
    }
};

Dialog.dismissAll();
export default Dialog;
