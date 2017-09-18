export default {
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
