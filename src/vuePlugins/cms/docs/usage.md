## [ZCmsSystem]/Usage for Vue

Using the system is quite simple. You must first import the plugin.


----------


#### Import
```javascript
import Vue from 'vue'
import cms from './vuePlugins/cms/cms'
```
----------
#### Install
Then simply use the Vue.use command to use it.
```javascript
Vue.use(cms)
```

Or if you want to be more explicit about what the plugin does, you can pass in a configurator object. All keys are optional.
``` javascript
Vue.use(cms, {
  livesIn: `body`,
  livesAs: `#wolf-cms-overlay`,
  describedBy: `cmsDescriptor`,
  activatedBy: `cmsInfest`,
  components: formExtendingComponentsObject,
  componentsInline: inlineExtendingComponentsObject,
  toastFn(title, msg, type) {
      if(type === `success`)
        console.log(title + msg)
      else
        console.error(title + msg)
  }
})
```
Configurator properites:

 - [livesIn]
 - [livesAs]
 - [describedBy]
 - [activatedBy]
 - [toastFn]
 - [components]
 - [componentsInline]

----------
#### Use
As described above, the activatedBy (**cmsInfest** by default) property is injected. Simply turn this on to show the Cms overlays for a component and all its children that also have cmsDescriptors.
Inside some vue component's methods:
```javascript
methods: {
    toggleCms() {
        this.cmsInfest = !this.cmsInfest; // where cmsInfest is the value of activatedBy
    }
}
```
#### Use with more control / stopping propagation
Another property called activatedByAllowed (**cmsInfestAllowed** by default) is also injected. This is a control variable & it is **true** by default. Simply, turn this off to stop the propagation chain downwards. 
```javascript
    // In Parent component that uses inner vue components A & B
    // ---------------------------------------------------------
    // In this example, the Parent's cmsInfest gets turned to true from mounted().
    // This will turn on cmsInfest for both A & B. 
    // However, the cms will only be shown for A. 
    // B will not show its cmsOverlays & neither will any of it's children.
    // You can use this control variable for permissions.
    <template>
        <div>
            <SomeComponentA/>
            <SomeComponentB :cmsInfestAllowed="false"/>
        </div>
    </template>

    <script>
        export default {
            mounted() {
                this.cmsInfest = true;
            }
        }
    </script>
```



[ZCmsSystem]: ./readme.md
[livesIn]: ./usage/livesIn.md
[livesAs]: ./usage/livesAs.md
[describedBy]: ./usage/describedBy.md
[activatedBy]: ./usage/activatedBy.md
[toastFn]: ./usage/toastFn.md
[components]: ./extending.md
[componentsInline]: ./extending.md
