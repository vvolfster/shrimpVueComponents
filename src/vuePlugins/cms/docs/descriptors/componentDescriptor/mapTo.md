## [ZCmsSystem]/[Descriptors]/[componentDescriptor]/mapTo **object or function**

#### Object
When this is an object, the cms will read its properties to populate the edit form. The properties read will be the ones provided in [types].

```javascript
const someObject = {
	a: "A",
	b: "B"
}

//in some vue component now
computed: {
    cmsDescriptor() {
        return {
            mapTo: someObject	
            // more descriptor properties
        }
    }
}
```


#### Function
When this is a function, it must either return a value or a promise. The cms will call it with a key name provided in [types].

Standard Function
```javascript
//some vue component
computed:{
    cmsDescriptor() {
        return {
            mapTo(k) => {
                return someObject[k];
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
            mapTo(k) => {
                return new Promise((resolve) => {
                    setTimeout(resolve, 1000, someObject[k])
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