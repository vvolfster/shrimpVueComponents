## [ZCmsSystem]/[Descriptors]/[listDescriptor]/individualListDescriptor **object**

This is the object that defines the operations on a list. A [listDescriptor] may have multiple of these. They must be of the following format:

 - listName
	 - [mapTo](***object***): Very similar to the [componentDescriptor]'s mapTo but this **MUST** be an object only!
	 - add(***function***|***object***)(optional): If missing, this list will not have a ***add button***.
		 - **function** : This function is invoked when the *add button* is clicked. It can return a promise.
         
         ```javascript
         // some component
         computed: {
             cmsDescriptor() {
                 return {
                     list: true,
                     person: {
                         mapTo: somePersonArray,
                         add(v) {
                            somePersonArray.push(v);
                         }
                     }
                 }
             }
         }
         ```

		 - **object**: This object's properties are enumerated over and a popup is displayed upon clicking the *add button*, allowing the user to pick what type of object they want to add. The values of this object must always be functions.

         ```javascript
         // some component
         computed: {
             cmsDescriptor() {
                 return {
                     list: true,
                     person: {
                         mapTo: somePersonArray,
                         add: {
                             male(v) {
                                somePersonArray.push(someMaleObject);
                             },
                             female(v) {
                                somePersonArray.push(someFemaleObject);
                             }
                         }
                     }
                 }
             }
         }
         ```

	 - remove(***function***)(optional): If missing, this list will not have *remove buttons*. This function is invoked when a *remove button* is clicked with the data item wanting to be removed passed in as the first argument.

     ```javascript
     // some component
     computed: {
        cmsDescriptor() {
            return {
                list: true,
                person: {
                    mapTo: somePersonArray,
                    remove(v) {
                        const idx = somePersonArray.indexOf(v);
                        if(idx !== -1)
                            somePersonArray.splice(idx,1);
                    }
                }
            }
        }
     }
     ```

	 - move(***function***)(optional): If missing, this list will not accept items being dropped on it. This function is invoked with an object containing the following keys:
		 - value: The item's data that is dropped on this list.
		 - idx: The index where the item was dropped.
		 - type: The type of item that was dropped.
		 - droppedOn: The element in the list onto which an item was dropped.

     ```javascript
     // some component
     computed: {
        cmsDescriptor() {
            return {
                list: true,
                person: {
                    mapTo: somePersonArray,
                    move({ value, idx, type, droppedOn }) {
                        if(!value || type !== 'person')
                            return;
                        
                        const sourceIdx = somePersonArray.indexOf(v);
                        if(sourceIdx !== -1)
                            somePersonArray.splice(sourceIdx,1);
                        somePersonArray.splice(idx, 0, value);
                    }
                }
            }
        }
     }
     ```

	 - drop(***string*** | ***object***)(optional): Provide this **ONLY** when the items being iterated over do not have this property in their [componentDescriptor]. This acts the exact same way as [drop] in the [componentDescriptor]. Please look at the [description] in there if you want to know more about it.
 
[ZCmsSystem]: ../../readme.md
[Descriptors]: ../../descriptors.md
[listDescriptor]: ../listDescriptor.md
[componentDescriptor]: ../componentDescriptor.md
[mapTo]: ../componentDescriptor/mapTo.md
[drop]: ../componentDescriptor/drop.md
[description]: ../componentDescriptor/drop.md