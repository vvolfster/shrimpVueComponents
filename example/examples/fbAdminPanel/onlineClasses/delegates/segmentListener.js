import lodash from 'lodash'
import fbase from '@/bigTools/firebaseAdminPanel/fbase'

let newKey = 0;
let segments = null;
const subscribedFns = {}
subscribedFns.push = (v) => {
    subscribedFns[newKey] = v;
    newKey += 1;
}

function startListening() {
    fbase.getTableRef('segments').then((ref) => {
        ref.on('value', (snap) => {
            segments = snap.val();
            lodash.each(subscribedFns, (fn, k) => {
                if(typeof fn === 'function')
                    fn(segments)
                else
                    console.warn(`segmentListener::${k} is not a function`)
            });
        })
    })
}

const intervalId = setInterval(() => {
    // console.log('...waiting for app to initialize')
    const state = fbase.getState();
    if(!state.appVars)
        return;

    startListening();
    clearInterval(intervalId);
}, 100);

export default {
    subscribe(fn) {
        subscribedFns.push(fn);
        if(segments)
            fn(segments);
    },
    unsubscribe(fn) {
        lodash.some(subscribedFns, (v, k) => {
            if(v === fn){
                delete subscribedFns[k]
                return true;
            }
            return false;
        })
    }
}
