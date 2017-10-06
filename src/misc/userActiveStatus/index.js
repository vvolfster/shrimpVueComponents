import lodash from 'lodash'

const watchers = {}

function InactivityWatcher(duration) {
    const listeners = [];
    let timeoutID;
    let active = true;
    let isDestroyed = false;

    function notifyListeners(val) {
        lodash.eachRight(listeners, (fn, idx) => {
            try {
                fn(val)
            } catch (e) {
                console.warn('a listener gave me some problems. removing it!')
                listeners.splice(idx, 1);
            }
        })
    }

    function goInactive() {
        if(active)
            notifyListeners(false);

        active = false;
    }

    function goActive() {
        if(!active)
            notifyListeners(true);

        active = true;
    }

    function startTimer() {
        timeoutID = setTimeout(goInactive, duration);
    }

    function resetTimer() {
        clearTimeout(timeoutID);
        if (!isDestroyed) {
            goActive();
            startTimer();
        }
    }

    function addListener(fn) {
        if (typeof fn !== 'function')
            return false;
        listeners.push(fn);
        // just call it!
        fn(active);
        return true;
    }

    function removeListener(fn) {
        const idx = listeners.indexOf(fn)
        if (idx !== -1) {
            listeners.splice(idx, 1);
            return true;
        }
        return false;
    }

    function removeAllListeners() {
        lodash.eachRight(listeners, (v, idx) => {
            listeners.splice(idx, 1);
        })
    }

    function destroy() {
        isDestroyed = true;
        removeAllListeners();
        resetTimer();
    }

    function numListeners() {
        return listeners.length;
    }

    this.addListener = addListener;
    this.removeListener = removeListener;
    this.removeAllListeners = removeAllListeners;
    this.destroy = destroy;
    this.numListeners = numListeners;

    document.addEventListener("mousemove", resetTimer, false);
    document.addEventListener("mousedown", resetTimer, false);
    document.addEventListener("keypress", resetTimer, false);
    document.addEventListener("DOMMouseScroll", resetTimer, false);
    document.addEventListener("mousewheel", resetTimer, false);
    document.addEventListener("touchmove", resetTimer, false);
    document.addEventListener("MSPointerMove", resetTimer, false);
    startTimer();
}

export default {
    /**
     * @function addListener
     * @param  {type} fn       {The listening function}
     * @param  {type} duration {Defaults to 5000. Idle time before user can be deemed inactive }
     */
    addListener(fn, duration) {
        const d = typeof duration === 'number' && duration > 0 ? duration : 5000;
        const existingInactivityWatcher = watchers[d];
        if (existingInactivityWatcher) {
            return existingInactivityWatcher.addListener(fn);
        }

        watchers[d] = new InactivityWatcher(d);
        return watchers[d].addListener(fn);
    },
    /**
     * @function removeListener
     * @param  {type} fn       {The listening function to remove}
     * @param  {type} duration {Defaults to undefined. If not provided, fn is removed everywhere it is found}
     */
    removeListener(fn, duration) {
        if (typeof duration !== 'number' || duration <= 0) {
            lodash.each(watchers, (watcher, key) => {
                watcher.removeListener(fn);
                if(!watcher.numListeners()){
                    // console.warn(`2removed watcher @ ${key}`)
                    watcher.destroy();
                    delete watchers[key]
                }
            })
        }
        else {
            const watcher = watchers[duration];
            if (watcher){
                watchers.removeListener(fn);
                if(!watcher.numListeners()){
                    // console.warn(`1removed watcher @ ${duration}`)
                    watcher.destroy();
                    delete watchers[duration]
                }
            }
        }
    }
}
