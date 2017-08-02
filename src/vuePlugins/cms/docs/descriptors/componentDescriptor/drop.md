## [ZCmsSystem]/[Descriptors]/[componentDescriptor]/drop **string or object**

This property describes what happens when the vue component is dropped onto something that accepts drops (lists). 


#### 1. string
If this is a string, this will be considered the dropType of the object. This is passed in to [list move] function as **type**.
The **value** of the object is inferred to be [mapTo] provided in the descriptor. If the [mapTo] is a promise, the cms will instead try to figure out the value itself. *Drag and drop currently **does not wait!***

```javascript
    // some vue component
    computed: {
        cmsDescriptor() {
            return {
                drop: `person`,
                // more cms properties here
            }
        }
    }
```

#### 2. object
If this is an object, it must be of the following format:

 - drop
	 - type(***string***): that identifies this item's type when it is dropped. Same as above basically.
	 - data(***object*** | ***function***)(optional): 
		 - **object** : This will be considered the **value** when this component is dropped. Passed to [list move] as *value*.

        ```javascript
        // some vue component
        computed: {
            cmsDescriptor() {
                return {
                    drop: {
                        type: `person`,
                        data: myDropDataObject
                    }
                    // more cms properties here
                }
            }
        }
        ```

		 - **function**: This will be called to determine the **value** of this component on drop. Once again, this must not return a promise because Drag and drop *does not wait.*

        ```javascript
        // some vue component
        computed: {
            cmsDescriptor() {
                return {
                    drop: {
                        type: `person`,
                        data() {
                            return myDropDataObject
                        }
                    }
                    // more cms properties here
                }
            }
        }
        ```
	
		 - **undefined**:  The drop will act as if only a string was provided to it.

        ```javascript
            // some vue component
            computed: {
                cmsDescriptor() {
                    return {
                        drop: {
                            type: `person`
                        }
                        // more cms properties here
                    }
                }
            }
        ```

[ZCmsSystem]: ../../readme.md
[Descriptors]: ../../descriptors.md
[componentDescriptor]: ../componentDescriptor.md
[list move]: ../listDescriptor/individualDescriptor/move.md
[mapTo]: ./mapTo.md