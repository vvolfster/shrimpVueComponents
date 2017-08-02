## [ZCmsSystem]/[Descriptors]/componentDescriptorInline **Object**

A descriptor object that tells the plugin how to change the component. Think **set** on an individual item. This is identified by **inline:true** on the descriptor. This is almost identical to the **[componentDescriptor]**. There are only 2 differences. 
1) **inline** must be true;
2) Every **property** in the descriptor must have a matching **html** attribute tag in the template.

----------
properties

 - **inline(*boolean*)** : Must be set to **TRUE**.
 - **[mapTo]** : The object or function that the cmsDescriptor will derive it's data from.
 - **[types]** : The object that describes all the fields that can be set using the cms.
 - **[set]** : The function that handles submitted data from the cms to change this component.
 - [title] (optional) : This is the text that is displayed in the titlebar when a component is being edited.
 -  [drop] (optional) : The string or object that describes what happens when this item is dropped onto something that accepts drops (lists). **If this property is not present in the descriptor, the component will not support drag/drop.**
 - style ***(string | optional)*** : A css style string that will be applied to the cms inline overlay.

----------
##### Example of a descriptor:
Note how all the divs have attributes that match with the types in the descriptor. This is currently the only way for the inline cms to know where to inject itself. Also note that the div with the **photoUrl** tag is not an img even though the content is an image. This is because , in HTML, you cannot inject anything under an img component. So keep that in mind for videos and images. You will have to wrap them in a div.
``` html
<!-- template of some component -->
<template>
	<div>
		<div firstName>{{ params.firstName }}</div>
		<div lastName>{{ params.lastName }}</div>
		<div email>{{ params.email }}</div>
		<div photoUrl>
			<img :src="params.photoUrl"/>
		</div>
		<span aboutMe>{{ params.aboutMe }}</span>
	</div>
</template>
```

```javascript
// script of some vue component
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
[componentDescriptor]: ./componentDescriptor.md
[title]: ./componentDescriptor/title.md
[mapTo]: ./componentDescriptor/mapTo.md
[types]: ./componentDescriptor/types.md
[drop]: ./componentDescriptor/drop.md
[set]: ./componentDescriptor/set.md
