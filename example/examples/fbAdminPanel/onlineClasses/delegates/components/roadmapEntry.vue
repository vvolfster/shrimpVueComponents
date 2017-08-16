<template>
    <div>
        <textLine @value="d_title = $event" placeholder="title" class="textLine"/>
        <div class='currentSegments'>
            <div v-for="(segment, key, idx) in d_segments" :key="key" class='segment'>
                <div>
                    #{{ idx }} {{ segment.meta.title }}
                </div>
                <button class='btn--delete'>
                    <i class='fa fa-trash'></i>
                </button>
            </div>
        </div>

        <div class="segInputArea">
            <div>
                <i class="fa fa-search"></i>
                <textLineAutoComplete 
                    :dictionary="allSegments"
                    display="meta.title"
                    :matchOn= "['meta.title','meta.description']"
                    placeholder="add existing..."
                    @value="addSegment"
                    class="textLine"
                    style="display:inline-block;"
                />
            </div>
            <button class='btn--create'>
                Create New Segment
            </button>
        </div>
        
    </div>
</template>

<script>
    import textLine from '@/input/textLine'
    import textLineAutoComplete from '@/input/textLineAutoComplete'
    import Vue from 'vue'
    
    export default {
        props: {
            title: {
                type: String,
                default: "",
            },
            segments: {
                type: Object,
                default() {
                    return {}
                }
            },
            allSegments: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        data() {
            return {
                d_title: "",
                d_search: "",
                d_segments: {},
            }
        },
        mounted() {
            this.d_title = this.title;
            this.d_segments = this.segments;
        },
        methods: {
            addSegment(segObj) {
                Vue.set(this.d_segments, segObj.key, segObj.data);
            }
        },
        components: {
            textLine, textLineAutoComplete
        },
        watch: {
            title() {
                this.d_title = this.title;
            },
            segments() {
                this.d_segments = this.segments;
            },
        },
    }
</script>

<style scoped>
    .textLine {
        font-size: 20px;
        text-align: center;
    }

    .currentSegments {
        display: flex;
        flex-flow: row;
    }

    .segment {
        font-size: 20px;
        display: flex;
        justify-content: space-between;
        border: solid 1px;
        width: 100%;
        align-items: center;
    }

    .segInputArea {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .btn--create {
        background: green;
        color: white;
    }

    .btn--delete {
        background: red;
        color: white;
    }

</style>