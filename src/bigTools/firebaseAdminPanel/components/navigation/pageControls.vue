<template>
    <div class="row items-center nowrap">
        <button class="svtbtn fa fa-fast-backward padding10" :class="idx <= 0 ? 'grey lighten-2 grey-text' : 'black-text'" @click="backward(true)"/>
        <button class="svtbtn fa fa-step-backward padding10" :class="idx <= 0 ? 'grey lighten-2 grey-text' : 'black-text'" @click="backward"/>
        <div class="pgctext margin-right">
            {{ Math.min(idx + 1, total) }} / {{ total }}
        </div>
        <button class="svtbtn fa fa-step-forward padding10 " :class="idx >= total - 1 ? 'grey lighten-2 grey-text' : 'black-text'" @click="forward"/>
        <button class="svtbtn fa fa-fast-forward padding10 " :class="idx >= total - 1 ? 'grey lighten-2 grey-text' : 'black-text'" @click="forward(true)"/>
    </div>
</template>

<script>
    import "../../../../css"

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
.pgctext {
    font-size: 20px;
}
</style>
