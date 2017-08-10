/* eslint-disable no-plusplus */
import lodash from 'lodash'
import Velocity from 'velocity-animate'

const state = {
    container: null,
    toastStack: [],
    duration: 2000,
    showingAToast: false,
    id: 0,
    style: {
        default: {
            backgroundColor: 'rgba(128, 128, 128, 0.7)',
            color: 'white',
            width: '90vw',
            left: '5vw',
            bottom: '-6.7vh',
            textAlign: 'center',
            borderRadius: '5px',
            position: 'absolute',
            display: 'table',
        },
        success: {
            backgroundColor: 'rgba(0, 128, 64, 0.7)',
        },
        info: {
            backgroundColor: 'rgba(0, 255, 128, 0.7)',
        },
        warn: {
            backgroundColor: 'rgba(255, 128, 0, 0.7)',
        },
        danger: {
            backgroundColor: 'rgba(128, 0, 0, 0.7)',
        },
    }
}

// create aliases for styles.
state.style.warning = state.style.warn;
state.style.positive = state.style.success;
state.style.negative = state.style.danger;
state.style.alert = state.style.danger;


const functions = {
    createToastContainer() {
        const frag = document.createDocumentFragment();
        const newNode = document.createElement("div");
        newNode.id = "toastContainer";
        newNode.style.position = "fixed";
        newNode.style.width = "100%";
        newNode.style.height = "100%";
        newNode.style[`pointer-events`] = `none`;

        frag.appendChild(newNode);
        document.body.appendChild(newNode);
        return newNode;
    },
    dismissToast(elementOrId, index) {
        const idx = index !== undefined ? index : lodash.findIndex(state.toastStack, (v) => {
            return v.element === elementOrId || v.intervalId === v.elementOrId || v.id === elementOrId
        })

        if(idx === -1) {
            console.error("Toasts:: unable to find", elementOrId)
            return;
        }

        const stackItem = state.toastStack[idx];
        if(stackItem.element) { // if the toast was shown!
            stackItem.element.parentNode.removeChild(stackItem.element); // destroy elem
        }

        if(stackItem.intervalId) { // if the toast's timer was made
            clearInterval(stackItem.intervalId); // clear timer
        }

        // remove this from the stack
        state.toastStack.splice(idx, 1); // remove from array

        // see if there are others left in the queue
        if(idx === 0 && state.toastStack.length > 0) { // as long as we are dismissing from the front
            // show next toast if there
            functions.startToast(state.toastStack[0]);
        }
        else {
            state.showingAToast = false;
        }
    },
    startToast(stackItem) {
        // extract params
        const style = stackItem.style;
        const duration = stackItem.duration;
        const id = stackItem.id;
        const msg = stackItem.msg;

        const frag     = document.createDocumentFragment();
        const fillNode = document.createElement("div");
        const textNode = document.createElement("span");

        // assign fillnode style
        lodash.each(style, (v, k) => {
            lodash.set(fillNode.style, k, v);
        })

        // assign textNode style & text
        textNode.innerText = msg;
        textNode.style.display = "table-cell";
        textNode.style.verticalAlign = "middle";
        textNode.style[`pointer-events`] = `auto`;
        textNode.style.cursor = "pointer";
        textNode.style.padding = "1vh";

        // add to the document
        fillNode.appendChild(textNode);
        frag.appendChild(fillNode);
        state.container.appendChild(frag);
        stackItem.element = fillNode;  // add the fillnode to the array

        Velocity(fillNode, { bottom: "1vh" }, { duration: 200 })

        // create a dismiss function
        const dismissFn = () => {
            Velocity(fillNode, { bottom: "-6.7vh" }, { duration: 200 }).then(() => {
                functions.dismissToast(id)
            });
        }
        stackItem.intervalId = setInterval(dismissFn, duration);

        // create a click handler to remove it as well
        fillNode.addEventListener('click', dismissFn);

        // turn the shared state of showing a toast to true
        state.showingAToast = true;
    }
}

// this function is the one that is exported.
const publicToastFn = (msg, params) => {
    if(!state.container)
        state.container = functions.createToastContainer();

    const p = {
        style: lodash.assign(lodash.cloneDeep(state.style.default), lodash.get(params, "style", {})),
        duration: lodash.get(params, "duration", state.duration),
        id: state.id++,
        msg
    }

    state.toastStack.push(p);
    if(!state.showingAToast)
        functions.startToast(p);
}

// create functions for each style
lodash.each(state.style, (v, k) => {
    if(k === 'default')
        return;

    publicToastFn[k] = (msg, params) => {
        const p = {
            duration: lodash.get(params, "duration", state.duration),
            style: lodash.assign(lodash.cloneDeep(state.style.default), v, lodash.get(params, "style", {})),
            id: state.id++,
            msg
        }

        state.toastStack.push(p);
        if(!state.showingAToast)
            functions.startToast(p);
    }
})

// create a dismissAll function
publicToastFn.dismissAll = () => {
    lodash.eachRight(state.toastStack, (v, k) => {
        functions.dismissToast(null, k);
    })
}

publicToastFn.install = (VuePtr, opts) => {
    // window.Vue = VuePtr;
    // unpack args
    const containerId = lodash.get(opts, "containerId");
    const duration = lodash.get(opts, "duration");
    const style = lodash.get(opts, "style");

    // figure out if we need to create a container or if one was provided
    state.container = document.getElementById(containerId) || functions.createToastContainer();
    if(duration && typeof duration === 'number')
        state.duration = duration;

    if(style && typeof style === 'object')
        state.style.default = style;

    VuePtr.toast = publicToastFn;
}

export default publicToastFn;
// export default {
//     Toast(...args) {
//         publicToastFn.apply(this, args);
//     },
// }
