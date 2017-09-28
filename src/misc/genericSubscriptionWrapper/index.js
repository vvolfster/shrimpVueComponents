import lodash from 'lodash'
/*
Wrapper around subscriptions.
Makes it so we don't have to keep track of our functions & manually unsub.
This does it for us by provided a unsubscribe function.

This can be easily used with firebase & html event handling as well actually.
e.g.,
----
HTML
----
const subWrapper = new GenericSubscriptionWrapper({ listen: "addEventListener", unlisten: "removeEventListener" });
subWrapper.subscribe(myHTMLElement, "click", someFn); // creates the click listener on myHTMLElement
subWrapper.subscribe(myHTMLElement, "hover", someFn2); // creates the hover listener on myHTMLElement

// later
subWrapper.unsubscribe();   // unsubscribes all: both click & hover.

--------
FIREBASE
--------
const subWrapper = new GenericSubscriptionWrapper({ listen: 'on', unlisten: 'off' });
subWrapper.subscribe(myFirebaseRef, "child_added", someFn); // creates the child_added listener on myFirebaseRef
subWrapper.subscribe(myFirebaseRef, "value", someFn2); // creates the value changed listener on myFirebaseRef

// later
subWrapper.unsubscribe();   // unsubscribes all: both child_added & value
*/

/**
 * @typedef {Object} GenericSubscriptionWrapperInstance
 * @property {function} unsubscribe
 * @property {function} subscribe
*/


/**
 * @name GenericSubscriptionWrapper
 * @param  {Object} params
 * @param  {string} params.listen The function name of start listening. e.g., "on", "addEventListener"
 * @param  {string} params.unlisten The function name of stop listening. e.g, "off", "removEventListener"
 * @returns {GenericSubscriptionWrapperInstance}
*/
function GenericSubscriptionWrapper(params) {
    const self = this;
    self.subscriptions = [];
    const listen = lodash.get(params, 'listen', 'on');
    const unlisten = lodash.get(params, 'unlisten', 'off');

    self.unsubscribe = (opts) => {
        const optId = lodash.get(opts, 'id')
        const optIdx = Number(lodash.get(opts, 'idx'))

        if(optId !== undefined && optId !== null){
            const foundIndex = lodash.findIndex(self.subscriptions, s => s && s.id === optId)
            if(foundIndex === -1)
                return Promise.reject("No such id");

            const entry = self.subscriptions[foundIndex];
            entry.element[unlisten](entry.eventType, entry.fn);

            self.subscriptions.splice(foundIndex, 1);
            return Promise.resolve('Removed');
        }
        else if(optIdx !== undefined && optIdx !== null && !isNaN(optIdx)) {
            const entry = self.subscriptions[optIdx];
            if(!entry)
                return Promise.reject('Cannot unsub a non-existent idx');

            entry.element[unlisten](entry.eventType, entry.fn);
            self.subscriptions.splice(optIdx, 1);
            return Promise.resolve('Removed');
        }

        return new Promise((resolve) => {
            lodash.eachRight(self.subscriptions, ({ element, eventType, fn }, idx) => {
                element[unlisten](eventType, fn);
                self.subscriptions.splice(idx, 1);
            })
            resolve();
        })
    }

    /**
     * @function {function name}
     * @param  {Object} element            {The object that will emit the event}
     * @param  {String} eventType          {The name of the event}
     * @param  {Function} fn               {Function to run on event}
     * @param  {type} identifierOptional {Optional identifier for the sake of efficiency. Will stop from listening to the same event if you pass in the same identifier}
     * @return {type} {Promise}
     */
    self.subscribe = (element, eventType, fn, identifierOptional) => {
        return new Promise((resolve, reject) => {
            if(identifierOptional) {
                const subObj = lodash.find(self.subscriptions, s => s.id === identifierOptional);
                if(subObj) {
                    if(subObj.element !== element)
                        return reject(`re-using an existing identifier and the element does not match`)
                    if(subObj.eventType !== eventType)
                        return reject(`re-using an exisitng identifier and the eventType does not match`)
                    if(subObj.fn !== fn)
                        return reject(`re-using an existing identifier and the fn does not match`)

                    return resolve(`nothing to be done. we already have this subscribed`)
                }
            }

            if(!element)
                return reject({ element, msg: "GenericSubscriptionWrapper failure:: bad element. Null / Undefined / False / 0. Not an object" })

            if(typeof element[listen] !== 'function')
                return reject({ element, msg: `GenericSubscriptionWrapper failure:: bad element passed. No ${listen} function` })

            if(typeof element[unlisten] !== 'function')
                return reject({ element, msg: `GenericSubscriptionWrapper failure:: bad element passed. No ${unlisten} function` })

            element[listen](eventType, fn);
            self.subscriptions.push({ element, eventType, fn, id: identifierOptional })
            // if(identifierOptional) console.log(`created ${identifierOptional}`)
            return resolve();
        })
    }

    self.get = (identifier) => {
        if(identifier !== undefined && identifier !== null)
            return null;
        return lodash.find(self.subscriptions, s => s && s.id && s.id === identifier)
    }

    self.has = (identifier) => {
        return !!self.get(identifier)
    }

    self.sub = self.subscribe;
    self.unsub = self.unsubscribe;
}

export default GenericSubscriptionWrapper;
