<!-- CMS FORM DOCS
To make this component work. The init method must be called from the outside. Cms.js does this.


============
DATA
============



=============
EVENTS
=============
close - emitted when the user successfully submits or hits close. In Cms.js , there's a listener for this.

-->
<template>
    <div class="background">
        
        <div class="root">
            <div class="title">
                <div class="title--text">{{ ui.title }}</div>
                <button class="title--button title--button-cancel" @click="close()">✖</button>
                <button :class= "canSubmit? 'title--button title--button-accept' : 'title--button title--button-gray'" 
                        @click="canSubmit ? submit() : null">✔</button>
            </div>
            <div class="content" ref="content">
                <div v-for="(v,k,index) in buildParams" style="position:relative;" :key="index">
                    <component :is="resolveCmp(v.type)" 
                            :name="k"
                            :value="v.value"
                            :options="v.options"
                            @submit="val => { setValue(k,val) }"
                            :key="index"
                    />
                    <voverlay :validated="v.validated"/>
                </div>
            </div>
            <pbar class="loadingbar" :value="ui.loading"></pbar>
        </div>

    </div> 
</template>

<script>
    // import all the components, this thing can support :D
    import lodash from 'lodash';
    import voverlay from './helpers/validatorOverlay';
    import pbar from './helpers/progressBar';
    import string from './components/string';
    import { extendComponents } from './';
    
    function getComponents() {
        const localComponents = { string }
        if(toString.call(extendComponents) === `[object Object]`)
            return lodash.merge(localComponents, extendComponents);
        return localComponents;
    }

    const cmsComponents = getComponents();
    const helperComponents = {
        voverlay,
        pbar,
    }

    export default {
        data() {
            return {
                buildParams: {},
                title: ``,
                element: null,
                descriptor: null,
                loadProgress: 0,
                canSubmit: false,
                setFn: null
            }
        },
        methods: {
            /**
            * @function {function name}
            * @param  {type} element    {description}
            * @param  {object} descriptor {passed from a cmsAble component we have designed.
                @example {
                    title: `Person`,
                    mapTo: this.params,
                    types: {
                        firstName: `string`,
                        lastName: `string`,
                        email: {
                            type: `email`,
                            mapTo: (k, v) => {
                                if(v === undefined) { // acts as a getter
                                    return new Promise((resolve) => {
                                        setTimeout(resolve, 1000, this.params.email)
                                    })
                                }

                                // else acts as a setter
                                this.params.email = v;
                                return true;
                            },
                            validator(v) {
                                if(v.indexOf("@") === -1)
                                    return "e-mails contain @";
                                return true;
                            }
                        },
                        photoUrl: `string`,
                        rating: `float`,
                        rating_count: `int`,
                        aboutMe: `paragraph`
                    }
                }
             }
            * @return {type} {description}
            */
            init(element, descriptor, setFn) {
                if(typeof element !== 'object' || typeof descriptor !== 'object')
                    return;

                const self = this;
                const promises = [];
                const rootMappedTo = descriptor.mapTo || element;
                const trueFn = () => { return true };
                const loading = {
                    loadedProperties: 0,
                    totalProperties: Object.keys(descriptor.types).length,
                    loadedOne() {
                        loading.loadedProperties += 1;
                        self.loadProgress = loading.loadedProperties / loading.totalProperties;
                    }
                }

                function generatePromise(key, fn, type, validator, options){
                    return new Promise((resolve) => {
                        Promise.resolve(fn(key)).then((value) => {
                            loading.loadedOne();
                            resolve({ key, result: { type, value, validator, options, validated: validator(value) } })
                        })
                    })
                }

                self.element = element;
                self.descriptor = descriptor;
                self.title = descriptor.title || ``;
                self.loadProgress = 0;
                self.submitProgress = 0;
                self.setFn = setFn || null;

                self.buildParams = lodash.reduce(descriptor.types, (a, v, k) => {
                    if(!v)
                        return a;   // no need to do anything here.

                    // is the descriptor simple or an object?
                    const isComplex = typeof v === 'object';

                    const type = isComplex ? v.type : v;
                    const validator = isComplex && typeof v.validator === `function` ? v.validator : trueFn;
                    const mappedTo  = isComplex && v.mapTo ? v.mapTo : rootMappedTo;
                    const options   = isComplex ? v.options : null;

                    if(typeof mappedTo === `function`) { // so MappedTo can be a promise so this may go async. Hence we do this.
                        promises.push(generatePromise(k, mappedTo, type, validator, options))
                    }
                    else {
                        const value =  mappedTo[k];
                        a[k] = { type, value, validator, validated: validator(value), options }
                        loading.loadedOne();
                    }

                    return a;
                }, {})

                if(promises.length > 0) {
                    Promise.all(promises).then((results) => {
                        lodash.each(results, ({ key, result }) => {
                            self.$set(self.buildParams, key, result);
                        })
                        this.refreshCanSubmit();
                    })
                }
                else {
                    this.refreshCanSubmit();
                }
            },
            close() {
                this.$emit('close');
            },
            submit() { // only possible to be called canSubmit is true!
                return new Promise((resolve, reject) => {
                    const self = this;
                    const setFn = typeof self.setFn === `function` ? self.setFn : () => { return false };
                    const valueObj = lodash.reduce(self.buildParams, (a, v, k) => {
                        a[k] = v.value;
                        return a;
                    }, {})

                    Promise.resolve(setFn(valueObj)).then(() => {
                        this.close();
                        resolve();
                    }).catch((err) => {
                        // alert(`err occured when trying to submit ${err}`);
                        return reject(`err occured when trying to submit ${err}`);
                    })
                })
            },
            resolveCmp(cmpName) {
                if(!cmsComponents)
                    return null;
                if(!cmsComponents[cmpName])
                    return `string` // do our best?
                return cmpName;
            },
            setValue(k, v) {
                if(!this.buildParams || this.buildParams[k] === undefined)
                    return;

                const ptr = this.buildParams[k];
                this.$set(ptr, `value`, v);
                this.$set(ptr, `validated`, ptr.validator(v));
                this.refreshCanSubmit();
            },
            refreshCanSubmit() {
                this.canSubmit = lodash.every(this.buildParams, (value) => { return value.validated === true })
            }
        },
        computed: {
            ui() {
                return {
                    title: this.title,
                    loading: this.loadProgress
                }
            },
        },
        components: lodash.merge({}, cmsComponents, helperComponents)
    }
</script>

<style scoped>

    .background {
        width: 100%;
        height: 100%;
        display:grid;
        grid-template-columns: 1fr 10fr 1fr;
        grid-template-rows   : 1fr 10fr 1fr;
        grid-template-areas  : ".  .  ."
                               ".  p  ."
                               ".  .  .";
        background-color: transparent;
    }


    .root {
        background-color: transparent;
        border-style: solid;
        border-width: 1px;
        box-shadow: 1px 1px 2px black, 0 0 25px gray, 0 0 5px transparent;
        -webkit-box-shadow: 1px 1px 2px black, 0 0 25px gray, 0 0 5px transparent;
        -moz-box-shadow: 1px 1px 2px black, 0 0 25px gray, 0 0 5px transparent;

        grid-area: p;
        
        display: grid; 
        grid-template-rows: 1fr 0.05fr 10fr;
        grid-template-areas: "title"
                             "loadingbar"
                             "content";
                             
    }

    .title {
        border-style: solid;
        border-width: 0 0 1px 0;
        background-color: #555;
        color: white;
        text-align: center;
        grid-area: title;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(20, 1fr);
    }

    .title--text {
        grid-column: auto / span 18;
        align-self: center;
        font-size : 16pt;
    }

    .title--button {
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5%;
        
        height: 90%;
        align-self:center;
        grid-column: auto / span 1;
    }
    
    .title--button-accept {
        background-color: #4CAF50; /* Green */
    }

    .title--button-gray {
        background-color: #aaa; /* Green */
    }

    .title--button:focus {
        border-width:1px;
        border-style:solid;
    }

    .title--button-cancel {
        background-color: red;
    }

    .content {
        grid-area: content;
        background-color: yellow;
        display: grid;
        background-color : white;
    }

    .loadingbar {
        grid-area: loadingbar;
    }

</style>
