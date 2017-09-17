<template>
    <div class="cmsInlineRoot">
        <component  :is="resolveCmp()"
                    :name="name"
                    :value="value"
                    :options="options"
                    @value-changed="setValueLocally($event)"
                    @submit="submit($event).then(syncValue)"
        />
        <voverlay :validated="validated" />
    </div>
</template>

<script>
import lodash from 'lodash'
import voverlay from './helpers/validatorOverlayInline'
import pbar from './helpers/progressBar'
// our great inline components. Add them here :)
import string from './componentsInline/string'
import paragraph from './componentsInline/paragraph'
import { extendComponentsInline } from './'
import fns from '../../misc/functions'

function getComponents() {
    const localComponents = { string, paragraph }
    if(toString.call(extendComponentsInline) === `[object Object]`)
        return lodash.merge(localComponents, extendComponentsInline);
    return localComponents;
}

const inlineComponents = getComponents();
const helperComponents = {
    voverlay,
    pbar,
}

function paramsAreValid(p) {
    if(toString.call(p) !== `[object Object]`)
        return false;

    return lodash.isString(p.name) &&
        lodash.isString(p.type) &&
        lodash.isFunction(p.set) &&
        (lodash.isFunction(p.mapTo) || typeof p.mapTo === `object`) &&
        (p.validator === undefined || lodash.isFunction(p.validator))
}

export default {
    components: lodash.merge({}, inlineComponents, helperComponents),   // since merge mutates the first object!
    methods: {
        init(params) {
            // if(toString.call(extendComponents) === `[object Object]`)
            return new Promise((resolve, reject) => {
                const self = this;
                self.type = ``;
                if(!paramsAreValid(params))
                    return reject(`invalid params`);

                self.name = params.name;
                self.mapTo = params.mapTo;
                self.set = params.set;
                self.options = params.options || null;
                if(lodash.isFunction(params.validator))
                    self.validator = params.validator;

                return self.getValue().then((val) => {
                    // we can now bring in the component :)
                    if(!self)
                        return reject(`self no longer exists. took too long perhaps did we?`);

                    self.value = val;
                    self.validated = self.validator(val);

                    // setting this here is gonna make it so we don't need load the
                    // component until necessary
                    self.type = params.type;
                    return resolve();
                })
            })
        },
        getValue() {
            const mapTo = this.mapTo;
            const name = this.name;
            return new Promise((resolve, reject) => {
                if(!mapTo)
                    return reject("mapTo is no longer valid")
                else if(!name)
                    return reject("name is no longer valid")
                else if(lodash.isFunction(mapTo))
                    return fns.genericResolver(mapTo, name).then(resolve).catch(reject);

                return resolve(mapTo[name]);
            })
        },
        setValueLocally(v) {
            const self = this;
            self.value = v;
            self.validated = self.validator(v);
        },
        syncValue() {
            const self = this;
            self.getValue().then((newVal) => {
                if(!self)
                    return;
                // log(`value was updated. now udpate it in the cms thinger to ${newVal}!`)
                self.value = newVal;
            })
        },
        submit(v) {
            return new Promise((resolve, reject) => {
                if(this.validator(v) !== true) {
                    return reject(`value doesn't match validation`);
                }

                const setFn = this.set;
                const valueObj = { [this.name]: v }

                if(!lodash.isFunction(setFn))
                    return reject(`setFn is no longer valid`);

                return fns.genericResolver(setFn, valueObj).then(resolve).catch((err) => {
                    // alert(`err occured when trying to submit ${err}`);
                    reject(`err occured when trying to submit ${err}`);
                })
            })
        },
        resolveCmp() {
            const type = this.type;
            if(!inlineComponents || !type)
                return null;
            if(!inlineComponents[type])
                return `string` // do our best?
            return type;
        },
    },
    data() {
        return {
            name: ``,
            type: ``,
            mapTo: null,
            set: null,
            options: null,
            validator(){ return true; },
            // state info
            value: null,
            canSubmit: false,
            validated: ``,
        }
    }
}
</script>

<style scoped>
.cmsInlineRoot {
   width: 100%;
   height: 100%;
}
</style>
