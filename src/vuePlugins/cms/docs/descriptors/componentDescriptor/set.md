## [ZCmsSystem]/[Descriptors]/[componentDescriptor]/set **function**

The function that changes the component. Can be a standard function or one that returns a promise. The cms will pass in its completed value to this.

Standard Function
```javascript
//some vue component
computed:{
    cmsDescriptor() {
        return {
            mapTo: someObject,
            set(value) => {
                lodash.assign(someObject, value);
            }
            // more descriptor properties ...
        }
    }
}
```

Promise
```javascript
//some vue component
computed:{
    cmsDescriptor() {
        return {
            mapTo: someObject,
            set(value) => {
                return new Promise((resolve)=>{
                    lodash.assign(someObject, value);
                    setTimeout(resolve, 1000);
                })
            }
            // more descriptor properties ...
        }
    }
}
```

[ZCmsSystem]: ../../readme.md
[Descriptors]: ../../descriptors.md
[componentDescriptor]: ../componentDescriptor.md
[types]: ./types.md