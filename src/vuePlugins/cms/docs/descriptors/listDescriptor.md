## [ZCmsSystem]/[Descriptors]/listDescriptor **Object**

A descriptor object that tells the plugin how to change a list. This can only be used in tandem with a relevant html attribute in the template section of the vue component.

 - [list] : The boolean that lets the cms system know that it's dealing with a listDescriptor. **Must be set to true**.
 - [individualListDescriptor(s)] : Since a component may have multiple lists, a list descriptor may have multiple of these. The property name of an individualListDescriptor must match with a html attribute in the template of the component.
  - style ***(string | optional)*** : A css style string that will be applied to the list overlay.

```
<template>
    <div>
        <v-for="(v) in persons" :params="v" person>
        <v-for="(v) in colors" :params="v" color>
    </div>
</template>

<script>
    const persons = [];
    const colors = [];

    export default {
        // more script stuff
        computed: {
            cmsDescriptor() {
                return {
                    list: true,
                    person: {  /* This key "person" must match in the template above */
                        mapsTo: persons,
                        add(v){ /* your code here*/},
                        remove(v){/* your code here*/},
                        move({ value, droppedOn, type, idx }){/* your code here*/},
                    },
                    color: { /* This key "color" must match in the template above */
                        mapsTo: persons,
                        add(v){ /* your code here*/ },
                        remove(v){ /* your code here*/ },
                        move({ value, droppedOn, type, idx }){ /* your code here*/ },
                        drop:`color`,
                    }
                }
            }
        }
    }
</script>


```

[ZCmsSystem]: ../readme.md
[Descriptors]: ../descriptors.md
[list]: ./listDescriptor/list.md
[individualListDescriptor(s)]: ./listDescriptor/individualListDescriptor.md