<template>
    <div :style="ui.background">
        <div :style="ui.fill"/>
    </div>
</template>

<script>
    export default {
        props: {
            colors: {
                type: Object,
                default() {
                    return {
                        empty: `#aaa`,
                        progress: `orange`,
                        complete: `green`,
                    }
                }
            },
            value: {
                type: Number,
                default() {
                    return 0
                }
            },
        },
        computed: {
            ui() {
                const loadedPerc = Math.min(this.value * 100, 100);
                const fillColor = loadedPerc === 100 ? this.colors.complete : this.colors.progress;
                const fill = {
                    width: `${loadedPerc}%`,
                    height: `100%`,
                    'background-color': fillColor,
                }

                const background = {
                    width: `100%`,
                    height: `100%`,
                    'background-color': this.colors.empty,
                    'border-style': 'solid',
                    'border-width': '1px 0 0px 0'
                }

                return {
                    background,
                    fill
                }
            }
        }
    }
</script>
