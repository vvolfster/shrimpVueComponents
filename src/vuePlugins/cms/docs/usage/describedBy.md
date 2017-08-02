### [ZCmsSystem]/[Usage]/describedBy **string**

The property name of the cmsDescriptor. This property **IS NOT** auto injected into components. The user must define this property for all components that are editable by the Cms.
##### Default:
```javascript
	"cmsDescriptor"
```
##### Relevant Example
```javascript
// inside some component
computed: {
	cmsDescriptor() {
        const self = this;
        return {
            title: "some title",
            mapTo: self.params,
            types:{
                someProperty:"string"
            },
            set(v) {
                lodash.assign(self.params,v);
            }
        }
	}
}
```

[ZCmsSystem]: ../readme.md
[Usage]: ../usage.md