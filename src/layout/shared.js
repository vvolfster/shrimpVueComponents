import lodash from 'lodash'

const shared = {
    dialogListeners: {
        listeners: {

        },
        unsubAll() {
            lodash.each(this.listeners, (arr, key) => {
                lodash.eachRight(arr, (d, idx) => {
                    window.removeEventListener(d.event, d.fn)
                    arr.splice(idx, 1);
                })
                delete this.listeners[key];
            })
            // console.log(JSON.stringify(this.listeners, null, 2));
        },
        sub(dialog, event, fn) {
            if(!this.listeners[dialog.$el.id]) {
                this.listeners[dialog.$el.id] = [];
            }

            window.addEventListener(event, fn);
            this.listeners[dialog.$el.id].push({ event, fn })
            // console.log(this.listeners);
        },
        unsub(dialog) {
            const d = lodash.get(this.listeners, dialog.$el.id);
            if(!d)
                return;

            lodash.eachRight(d, (entry, idx) => {
                window.removeEventListener(entry.event, entry.fn);
                d.splice(idx, 1);
            })
            delete this.listeners[dialog.$el.id];
            // console.log(JSON.stringify(this.listeners, null, 2));
        }
    }
}

function generator(key) {
    return {
        newKey: 0,
        stack: {},
        dismissAll() {
            lodash.each(shared[key].stack, (obj, id) => {
                obj.dismiss();
                if(id in shared[key].stack)
                    delete shared[key].stack[id]
            })
        },
        push(obj) {
            const self = shared[key];
            const id = self.newKey;

            self.stack[id] = obj;
            obj.onDismiss(() => {
                if(id in self.stack)
                    delete self.stack[id]
            })

            self.newKey += 1;
        },
    }
}

shared.modals = generator('modals')
shared.dialogs = generator('dialogs')
shared.popovers = generator('popovers')

export default shared;
