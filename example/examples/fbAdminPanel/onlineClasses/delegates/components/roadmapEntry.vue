<template>
    <div>
        <h4>Roadmap Entry</h4>
        <textLine @value="d_title = $event" placeholder="title" class="textLine"/>
        <textLineAutoComplete 
            :dictionary="allSegments"
            display="meta.title"
            :matchOn= "['meta.title','meta.description']"
            class="textLine"
            placeholder="add segment"
        />
    </div>
</template>

<script>
    import lodash from 'lodash'
    import fbase from '@/bigTools/firebaseAdminPanel/fbase'
    import textLine from '@/input/textLine'
    import textLineAutoComplete from '@/input/textLineAutoComplete'
    import textParagraph from '@/input/textParagraph'
    import popover from "@/layout/popover"

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
            }
        },
        data() {
            return {
                d_title: "",
                d_search: "",
                d_segments: {},
                results: {},
                allSegments: {}
            }
        },
        mounted() {
            const self = this;
            this.d_title = this.title;
            this.d_segments = this.segments;

            const db = lodash.get(fbase.getState(), "appVars.database");
            if(!db)
                return;

            // create a hashing algorithm on the firebase side for this.
            // firebase is pretty !!#$#% stupid for not even having start at queries.
            db.ref('segments').once('value')
            .then((snap) => {
                self.allSegments = snap.val();
            })
        },
        components: {
            textLine, textParagraph, popover, textLineAutoComplete
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
    }

    button {
        display: block;
        font-size: 20px;
    }

    button:hover {
        background: blue;
        color: white;
    }

    .searchResults {
        display: flex;
        flex-flow: column;
        border: solid 1px black;
        width: 100%;
    }
</style>