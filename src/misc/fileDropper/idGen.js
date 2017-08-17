let newKey = 0;

export default {
    getId() {
        const ret = `fileDropperInput_${newKey}`
        newKey += 1;
        return ret;
    }
}
