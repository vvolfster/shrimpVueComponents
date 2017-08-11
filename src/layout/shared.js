import lodash from 'lodash'

const shared = {
    modals: {
        newKey: 0,
        stack: {
        },
        dismissAll() {
            lodash.each(shared.modals.stack, (modal, modalId) => {
                modal.dismiss();
                if(modalId in self.stack)
                    delete shared.modals.stack[modalId]
            })
        },
        push(modal) {
            const self = shared.modals;
            const modalId = self.newKey;

            self.stack[modalId] = modal;
            modal.onDismiss(() => {
                if(modalId in self.stack)
                    delete self.stack[modalId]
            })

            self.newKey += 1;
        },
    }
}

export default shared;
