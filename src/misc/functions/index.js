export default {
    genericResolver(fn, ...params) {
        return new Promise((resolve, reject) => {
            if(typeof fn !== 'function')
                return fn ? resolve() : reject();

            const returnVal = fn(...params);
            if(returnVal instanceof Promise){
                return returnVal.then(resolve).catch(reject);
            }
            return returnVal ? resolve() : reject();
        })
    }
}
