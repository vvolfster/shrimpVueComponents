<template>
    <div class="zeer">
        <div class="zeer__holder" ref="zeer_holder">
            <div @mouseenter="show($event, ui.text)" @mouseleave="hide" :style="ui.style">!</div>
        </div>
    </div>
</template>

<script>

    function genId() {
        return `validatorOverlayPopup${new Date().getTime()}`
    }

    function getHtml(x, y, value){
        const style = `position:absolute;border-radius:5px;top:${y + 20}px;left:${x}px;background-color:rgba(255,0,0,0.9);color:white;padding:10px;`;
        return `<span style="${style}">${value}</span>`
    }

    export default {
        props: {
            validated: true,
        },
        methods: {
            show(e, val) {
                this.popupId = genId();

                const element = document.createElement(`span`);
                document.body.appendChild(element);

                element.id = this.popupId;
                element.innerHTML = getHtml(e.clientX, e.clientY, val);
            },
            hide() {
                const element = document.getElementById(this.popupId);
                if(element)
                    element.parentNode.removeChild(element);
            },
        },
        data() {
            return {
                popupId: null,
            }
        },
        destroyed() {
            this.hide();
        },
        computed: {
            ui() {
                const text = this.validated === true || this.validated === undefined ? `` : this.validated.toString();
                const fontSize = 12;
                const style = {
                    position: `fixed`,
                    visibility: text ? `visible` : `hidden`,
                    color: `white`,
                    cursor: 'pointer',
                    'background-color': `red`,
                    'pointer-events': `auto`,
                    'margin-left': `-${fontSize}pt`,
                    'margin-top': `-${fontSize / 5}pt`,
                    'border-radius': `50%`,
                    'font-size': `${fontSize}pt`,
                    'padding-left': `${fontSize / 4}pt`,
                    'padding-right': `${fontSize / 4}pt`,
                }

                return {
                    text,
                    style
                }
            }
        }
    }
</script>

<style scoped>

.zeer {
    width: 100%;
    height: 100%;
    background-color: transparent;
    top: 0;
    left: 0;
    pointer-events: none;
    overflow: visible;
}

.zeer__holder {
    position: relative;
    height: inherit;
}

.zeer__bar--hidden {
    visibility: hidden;
}





</style>
