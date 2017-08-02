## [ZCmsSystem]/[Descriptors]/[componentDescriptor]/types **object**

This object's properties describes all the fields that are editable by the cms. Each entry within this object can be either a **string** or an **object**. There is a lot of customization that can be defined here. Please remember to provide a **[set]** function to make these work.

#### Simple Example:
Where all the component types are specified in line.
```javascript
// some vue component
computed : {
	cmsDescriptor() {
		return {
			mapTo: someObject,
			types: {
				firstName: `string`, // use string component to edit this
				lastName: `string, // use string component to edit this
				mad: `hatter`, // use hatter component to edit this
			}
			// more cms properties
		}
	}
}

//In this case, the cms will use the values of someObject.firstName & someObject.lastName & someObject.mad to populate the edit form.
```

#### Using Validators:
The cms edit form has support for validators. **A validator must return a string on error so it can be displayed and true on pass:** 
```javascript
// some vue component
computed : {
	cmsDescriptor() {
		return {
			mapTo: someObject,
			types: {
				firstName: {
					type: `string`,
					validator(v) {
						if(!v || v.length < 3)
							return "name too short or empty";
						return true;
					}
				}
			}
			// more cms properties
		}
	}
}
```

#### Defining Custom Getters for individual properties:
This can be useful if all the editable data is not easily available in one object (and thus, can't be cleanly mapped using the root level [mapTo]). Made possible by using [mapTo] property inside type specification. Behaves very much like [mapTo]
```javascript
// some vue component
computed : {
	cmsDescriptor() {
		return {
			mapTo: someObject,
			types: {
				firstName: `string`,
				role: {
					type: `string`,
					mapTo(k) {
						return someOtherObject[someObject.firstName].role;
					}
				}
			}
			// more cms properties here		
		}
	}
}
```

#### Passing Options to components:
The Cms also has a way of passing options to components used by the cmsForm. You can see them under [cmsPluginDirectory]/helpers. The default one provided is calling **string.vue** .

```javascript
// some vue component
computed: {
	cmsDescriptor() {
		return {
			mapTo: someObject,
			types: {
				rating: {
					type: `float`,
					options: {
						min: 0,
						max: 1
					}
				}
			}
		}
	}
}
```

In the example above, whatever component ends up handling **rating**, will also get passed an options object with min = 0 & max = 1.


[ZCmsSystem]: ../../readme.md
[Descriptors]: ../../descriptors.md
[componentDescriptor]: ../componentDescriptor.md
[mapTo]: ./mapTo.md
[set]: ./set.md