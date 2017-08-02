### [ZCmsSystem]/[Usage]/activatedBy **string**

The property name that tells the plugin whether or not to show the Cms for a component and embedded vue components there in. This **IS** auto injected into components as a **boolean**. The user should **NOT** define this.

##### Default:
```javascript
	"cmsInfest"
```
##### Relevant Example
```javascript
// inside some component's methods.
methods: {
    toggleCms() {
        this.cmsInfest = !this.cmsInfest; // where cmsInfest is the value of activatedBy
    }
}
```

[ZCmsSystem]: ../readme.md
[Usage]: ../usage.md