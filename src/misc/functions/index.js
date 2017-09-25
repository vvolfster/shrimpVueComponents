export default {
    /**
     * @function genericResolver Resolves a promise or function. If the returned value is truthy for a non-promise, the promise will resolve. Else, it will reject. The only exception to this rule is undefined. Undefined is resolved, not rejected.
     * @param  {(function | Promise)} fn The promise or function to resolve.
     * @param  {Object} ...params arguments to fn
     * @return {Promise}
     */
    genericResolver(fn, ...params) {
        return new Promise((resolve, reject) => {
            if(typeof fn !== 'function')
                return fn ? resolve() : reject();

            const returnVal = fn(...params);
            if(returnVal instanceof Promise){
                return returnVal.then(resolve).catch(reject);
            }
            if(returnVal === undefined) // undefined is ok because most functions are going to return this. But other falsy values arent!!
                return resolve();

            return returnVal ? resolve() : reject();
        })
    }
}
