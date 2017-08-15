<template>
    <div class="pageControls">
        <button class="fa fa-fast-backward" :class="idx <= 0 ? 'pgcbtn pgcbtn--disabled' : 'pgcbtn'" @click="backward(true)"/>
        <button class="fa fa-step-backward" :class="idx <= 0 ? 'pgcbtn pgcbtn--disabled' : 'pgcbtn'" @click="backward"/>
        <div class="pgctext">
        {{ Math.min(idx + 1, total) }} / {{ total }}
        </div>
        <button class="fa fa-step-forward" :class="idx >= total - 1 ? 'pgcbtn pgcbtn--disabled' : 'pgcbtn'" @click="forward"/>
        <button class="fa fa-fast-forward" :class="idx >= total - 1 ? 'pgcbtn pgcbtn--disabled' : 'pgcbtn'" @click="forward(true)"/>
    </div>
</template>

<script>
    export default {
        props: {
            total: {
                type: Number,
                default: 0,
                validator(v) {
                    // should have no decimals
                    return Math.floor(v) === v;
                }
            }
        },
        data() {
            return {
                idx: 0
            }
        },
        watch: {
            total() {
                this.idx = 0;
            },
            idx(v) {
                this.$emit('value', v);
            }
        },
        methods: {
            backward(allTheWay) {
                this.idx = allTheWay === true ? 0 : Math.max(this.idx  - 1, 0);
            },
            forward(allTheWay) {
                this.idx = allTheWay === true ? Math.max(this.total - 1, 0) : Math.min(this.idx + 1, this.total - 1);
            },
            setIndex(v) {
                if(v >= 0 && v < this.total)
                    this.idx = v;
            }
        }
    }
</script>

<style scoped>
.pageControls {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.pgctext {
    font-size: 20px;
}

.pgcbtn {
    background: transparent;
    color: black;
}

.pgcbtn--disabled {
    color: lightgray;
}

</style>
