<template>
    <div>
       <autoform :fields="fields" @value="updateJSON"/>
       <br>
        ---- JSON form value ----
        <br>
        <pre>
            {{ json }}
        </pre>
    </div>
</template>

<script>
import autoform from '@/input/autoform'
// import customComponents from '@/input/customComponents'
import colorCube from './colorCube'

// customComponents.register("colorCube", colorCube);

export default {
    components: { autoform },
    data() {
        return {
            fields: {
                name: String,
                myCube: {
                    type: colorCube,
                    model: "blue"
                },
            },
            json: ''
        }
    },
    methods: {
        updateJSON(v) {
            this.json = JSON.stringify(v, null, 2);
        }
    }
}

</script>