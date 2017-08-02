## [ZCmsSystem]/Descriptors for Vue

There are **3** types of descriptors in the cms system.  A component can only use **one** of the three. Two of them behave very similarly. It should be present inside vue components that wish to make use of the system and must be defined by the **[describedBy]** property of the configurator object when the plugin was initialized. By default, this property is **cmsDescriptor**. 

 - [componentDescriptor] - A descriptor object that tells the plugin how to change the component. Think **set** on an individual item. 
	
	``` javascript
	// inside some vue component
	computed: {
		cmsDescriptor() {
			const descriptorObj = { 
				// component descriptor object body
			}
			return descriptorObj
		}
	}
	```
 - [componentDescriptorInline] A descriptor object that tells the plugin how to change the component. Think **set** on an individual item. Identified by **inline:true** on the 
 descriptor.

	``` javascript
	// inside some vue component
	computed: {
		cmsDescriptor() {
			const descriptorObj = { 
				inline: true,
				// remainder component descriptor object body
			}
			return descriptorObj
		}
	}
	```

 - [listDescriptor] - A descriptor object that tells the plugin how to change a list. This can only be used in tandem with a relevant html attribute in the template section of the vue component. Identified by **list:true** on the descriptor.

	``` javascript
	// inside some vue component
	computed: {
		cmsDescriptor() {
			const descriptorObj = { 
				list: true,
				// remainder list descriptor object body
			}
			return descriptorObj
		}
	}
	```


[ZCmsSystem]: ./readme.md
[componentDescriptor]: ./descriptors/componentDescriptor.md
[componentDescriptorInline]: ./descriptors/componentDescriptorInline.md
[listDescriptor]: ./descriptors/listDescriptor.md
[describedBy]: ./usage/describedBy.md