import lodash from 'lodash'

const shared = {}

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
