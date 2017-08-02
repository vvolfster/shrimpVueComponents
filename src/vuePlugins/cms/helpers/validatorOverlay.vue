<template>
    <div :class="ui.text ? 'zroot' : 'zroot zroot-hidden'">
        <div class="zroot--bar" @mouseenter="show()" @mouseleave="hide()"></div>
        <div class="zroot--popup">
            <span :class="ui.popupClass" id="zmyPopup">{{ui.text}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        props: { validated: true },
        methods: {
            show() {
                if(this.popupClass.indexOf(` zshow`) === -1)
                    this.popupClass += ` zshow`;
            },
            hide() {
                this.popupClass = this.popupClass.replace(new RegExp(` zshow`, 'g'), ``);
            },
        },
        data() {
            return {
                popupClass: `zpopuptext`,
            }
        },
        computed: {
            ui() {
                return {
                    popupClass: this.popupClass,
                    text: this.validated === true || this.validated === undefined ? `` : this.validated.toString(),
                }
            }
        }
    }
</script>

<style scoped>

/* Popup container - can be anything you want */
.zroot {
    position:absolute; 
    width:100%; 
    height:100%; 
    top:0; 
    left:0; 
    pointer-events:none;
    visibility: visible;
    z-index: 2147483647;
    display: grid;
    grid-column-gap: 10px;
    grid-template-columns: 5px 1fr;
    grid-template-areas: "bar popup";
}

.zroot-hidden {
    visibility: hidden;
}

.zroot--bar {
    grid-area: bar;
    background-color : red;
    pointer-events:auto;
}

.zroot--popup {
    grid-area: popup;
    display:grid;
    justify-items:left;
    align-items:center;
}

/* The actual popup */
.zpopuptext {
    visibility: hidden;
    text-align: center;
    border-radius: 6px;
    padding: 10px;
    font-size:14pt;
    background-color: red;
    color: white;
    opacity: 0.9;    
}

/* Toggle this class - hide and show the popup */
.zshow {
    visibility: visible;
}




</style>
