## [ZCmsSystem]/[Descriptors]/componentDescriptor **Object**

A descriptor object that tells the plugin how to change the component. Think **set** on an individual item.

 - **[mapTo]** : The object or function that the cmsDescriptor will derive it's data from.
 - **[types]** : The object that describes all the fields that can be set using the cms.
 - **[set]** : The function that handles submitted data from the cms to change this component.
 - [title] (optional) : This is the text that is displayed in the titlebar when a component is being edited.
 -  [drop] (optional) : The string or object that describes what happens when this item is dropped onto something that accepts drops (lists). **If this property is not present in the descriptor, the component will not support drag/drop.**
 - style ***(string | optional)*** : A css style string that will be applied to the cms overlay.

##### Example of a descriptor:
```javascript
// in some vue component
computed: {
	cmsDescriptor() {
       const self = this;
       return {
           title: self.ui.name,
           mapTo: self.params,
           types: {
               firstName: `string`,
               lastName: `string`,
               email: {
                   type: `email`,
                   mapTo: (k) => {
	                   return new Promise((resolve) => {
	                       setTimeout(resolve, 1000, this.params.email)
	                   })
                   },
                   validator(v) {
                       if(!v)
                           return "missing e-mail";

                       if(v.indexOf("@") === -1)
                           return "e-mails contain @";
                       return true;
                   }
               },
               photoUrl: `string`,
               rating: `float`,
               rating_count: `int`,
               aboutMe: `paragraph`
           },
           drop: `person`,
           set(v) {
               lodash.assign(self.params, v);
           }
       }
   }
}
```

[ZCmsSystem]: ../readme.md
[Descriptors]: ../descriptors.md
[title]: ./componentDescriptor/title.md
[mapTo]: ./componentDescriptor/mapTo.md
[types]: ./componentDescriptor/types.md
[drop]: ./componentDescriptor/drop.md
[set]: ./componentDescriptor/set.md
