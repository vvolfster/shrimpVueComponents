## [ZCmsSystem]/Extending for Vue
Extending the components of the cms is quite simple. There's two ways to go about doing it. You could either:

#### A) Add Components directly in the cms root folder

1. Navigate to the cms root folder (vuePlugins/cms by default)
2. Its structure should be as following.

    ```
    cms (root folder)
        cms.css
        cms.js
        cmsAddChooser.vue
        cmsForm.vue
        cmsInlineLoader.vue
        settings.png
        components (folder) // components for componentDescriptor live here
            string.vue
        componentsInline (folder) // components for componentDescriptorInline live here
            string.vue
            paragraph.vue
    ```

3. Create vue files under components or componentsInline
    - Import files under components in ***cmsForm.vue*** **OR**
    - Import files under componentsInline in ***cmsInlineLoader.vue***
4. Make sure that the components can have these properties:
    - **name(*string*)** - This is the name of the property this component is editing.
    - **value(*any*)** - This is the current value of the property the component is editing.
    - **options(*optional*)** - User specified value / object that informs the behavior of this component. Think sliders with min and max values.
5. Make sure that they emit these events with the value:
    - **submit** - emit this when the user is ready to submit a change.
    - **data-change(*optional*)** - emit this when the user is still fiddling with the value, like typing etc.
6. After you have followed all these steps, your component will load every time you specify it's **filename** as the type in a [componentDescriptor] or [componentDescriptorInline].


#### B) Include components in the [Vue.use configurator].
    
1. In the file **(main.js by default)** where you call Vue.use(cms, {cmsOptions}) , also include these properties in the configurator:
    - components ***(object)*** - This object contains all the components you wish to use in the standard editing mode (the form). The object's key values should be **{cmpName} : {importedCmp}**.
    - componentsInline ***(object)*** - This object contains all the components you wish to use in the inline editing mode. The object's key values should be **{cmpName} : {importedCmp}**.

    ``` javascript
    // main.js 
    import Vue from 'vue'
    import cms from './vuePlugins/cms/cms'
    import dropdown from './someFolder/componentsInline/dropdown' // vue component
    import photo from './someFolder/components/photo' // vue component

    const componentsInline = { 
        dropdown
    }

    const components = {
        photo
    }

    Vue.use(cms, {
        components,
        componentsInline 
    })
    /* This will allow the cms to make use of dropdown & photo components whenever 
    they are referenced in cmsDescriptors */
    ```

2. Make sure that the components you have created follow **rule 4 & 5** described above in **A) Add Components directly in the cms root folder.**

[componentDescriptor]: ./descriptors/componentDescriptor.md
[componentDescriptorInline]: ./descriptors/componentDescriptorInline.md
[ZCmsSystem]: ./readme.md
[Vue.use configurator]: ./usage.md