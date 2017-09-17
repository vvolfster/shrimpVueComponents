// Documentation: https://github.com/Imagination-International-Inc/vue4vendetta/blob/IIIG-646_Student_Course_Home_CMS/src/vuePlugins/cms/docs/readme.md
/* eslint global-require: "off" */
import $ from 'jquery' // TODO - remove this dependency when you come back to it.
import lodash from 'lodash';
import Vue from 'vue';
import cmsStyle from './cms.css';
import cmsAddChooser from './cmsAddChooser'
import functions from '../../misc/functions'

let cmsform = null; // we will require them in the install method. They need to be aware of this thing's components.
let cmsInlineLoader = null; // we will require them in the install method. They need to be aware of this thing's componentsInline

const config = {
    livesAs: `#wolf-cms-overlay`,
    livesIn: `body`,
    describedBy: `cmsDescriptor`,
    activatedBy: `cmsInfest`,
    allowedBy: `cmsInfestAllowed`,
    activatedByPropagate: `cmsInfestPropagate`,
    components: {}, // these are used in cmsForm.vue
    componentsInline: {}, // these are used in cmsInlineLoader.vue
    toastFn(msg){ // if our toast is installed, we can just use that as default.
        if(lodash.isFunction(Vue.toast))
            Vue.toast(msg);
    }
}

const cssClasses = {
    styleFile: cmsStyle,    // this is just to shut the linter up!
    overlay: `z-cms-overlay`,
    inline: `z-cms-inline`,
    overlayListAddButton: `z-cms-overlay-list-addbtn`,
    overlayList: `z-cms-overlay-list`,
    overlayListRemoveButton: `z-cms-overlay-list-removebtn`,
    overlayRoot: `z-cms-overlay-root`,
    overlayOver: `z-cms-overlay-more-opaque`,
    popup: `z-cms-popup`,
    dragHover: `z-cms-draghover`
}

const cmsState = {
    canDrag: true,
    dragee: null,
    popups: {},
    inline: {},
    watchers: new Map(),
    idGen: -1
}

const helpers = {
    nextTick(fn) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if(typeof fn === `function`)
                    fn();
                resolve();
            }, 0);
        })
    },
    isObject(a) {
        return toString.call(a) === `[object Object]`
    },
    findChildRecursive(element, childIdentifier) {
        // first see if we can find the child with className at this level.
        let children = $(element).children(`${childIdentifier}`);
        if(children.length > 0) {   // return the first child matching this tag.
            return children[0];
        }

        children = $(element).children();
        if(children.length === 0)
            return null;

        let loopResult = null;
        lodash.some(children, (child) => {
            const r = helpers.findChildRecursive(child, childIdentifier);
            if(r)
                loopResult = r;
            return r;
        })

        return loopResult;
    },
    findChildrenWithAttributesRecursive(element, attr) {
        const attributes = lodash.isArray(attr) ? attr : [attr];
        const children = $(element).children();

        const accumulator = lodash.reduce(attributes, (a, v) => {
            a[v] = [];
            return a;
        }, {});

        lodash.each(children, (child) => {
            // check this child.
            lodash.each(attributes, (v) => {
                const hasAttr = $(child).attr(v);
                if(hasAttr !== null && hasAttr !== undefined) {
                    accumulator[v].push(child);
                }
            })

            lodash.merge(accumulator, helpers.findChildrenWithAttributesRecursive(child, attributes));
        })

        return accumulator;
    },
    findChildrenRecursive(element, childIdentifier) {   // unused but may prove useful at some point. Doesn't stop when it finds one child.
        // check at this level
        const results = [];
        let loopResults = [];
        lodash.each($(element).children(), (child) => {
            if($(child).is(childIdentifier))
                results.push(child);
            loopResults = loopResults.concat(helpers.findChildrenRecursive(child, childIdentifier));
        })
        return results.concat(loopResults);
    },
    onlyUserDefinedProperties(vueComponent) {
        const notArr = [config.describedBy, config.activatedBy, config.activatedByPropagate, `Dom7`, `Template7`]
        return lodash.pickBy(vueComponent, (v, k) => {
            return k.charAt(0) !== "$" && k.charAt(0) !== "_" && notArr.indexOf(k) === -1;
        })
    },
    descriptorValue(element, descriptor) {
        return new Promise((resolve) => {
            if(typeof element !== `object` || typeof descriptor !== `object`)
                resolve(null);

            const valueObject = {}
            const promises = [];
            const rootMappedTo = descriptor.mapTo || element;
            const resolverFn = () => { resolve(valueObject) }

            function generatePromise(key, fn){
                return new Promise((resolve) => {
                    functions.genericResolver(fn, key).then((value) => { resolve({ key, value }); })
                })
            }

            lodash.each(descriptor.types, (v, k) => {
                if(!v)
                    return;

                // is the descriptor simple or an object?
                const isComplex = typeof v === 'object';
                const mappedTo  = isComplex && v.mapTo ? v.mapTo : rootMappedTo;
                if(typeof mappedTo === `function`) {
                    promises.push(generatePromise(k, mappedTo));
                }
                else {
                    valueObject[k] =  mappedTo[k];
                }
            })

            Promise.all(promises).then((results) => {
                lodash.each(results, ({ key, value }) => { valueObject[key] = value; })
            }).then(resolverFn);
        })
    },
    descriptorValueNoWait(element, descriptor) {
        if(typeof element !== `object` || typeof descriptor !== `object`)
            return null;

        if(typeof descriptor.mapTo === `object`)
            return descriptor.mapTo;

        const valueObject = {}
        const rootMappedTo = descriptor.mapTo || element;
        lodash.each(descriptor.types, (v, k) => {
            if(!v)
                return;

            const isComplex = typeof v === 'object';
            const mappedTo  = isComplex && v.mapTo ? v.mapTo : rootMappedTo;
            if(typeof mappedTo === `function`) {
                functions.genericResolver(mappedTo, k).then((val) => { valueObject[k] = val; })
            }
            else {
                valueObject[k] =  mappedTo[k];
            }
        })
        return valueObject;
    },
    resolveObjOrFunction(obj, ...args) {
        if(!obj)
            return null;

        const type = typeof obj;
        switch(type) {
            case `object` : return obj;
            case `function` : return obj(...args);
            default: return null;
        }
    },
    createPopup(type, cmp, onDestroy) {
        const livesIn = config.livesIn;
        const livesAs = config.livesAs;
        const root = $(livesIn);
        const refId = `${livesAs}-${type}`
        if(cmsState.popups[type])
            return cmsState.popups[type].$refs[refId];

        $(root).append(`<div id="${refId.slice(1)}" class="${cssClasses.popup}"><popup-cmp ref="${refId}" @close="destroy($event)"/></div>`);
        cmsState.popups[type] = new Vue({
            el: refId,
            components: {
                'popup-cmp': cmp
            },
            data() {
                return {
                    destroyFn: typeof onDestroy === `function` ? onDestroy : () => {}
                }
            },
            methods: {
                destroy(arg) {
                    const vueInstance = cmsState.popups[type];
                    if(vueInstance) {
                        this.destroyFn(arg);
                        vueInstance.$destroy(true);
                    }
                }    // destroy self
            },
            destroyed() {
                // do clean up!
                const items = $(root).children(refId);
                lodash.each(items, (v) => { $(v).remove(); })
                cmsState.popups[type] = null;
            },
        })
        return cmsState.popups[type].$refs[refId];
    },
    generateId() {
        cmsState.idGen += 1;    // (new Date()).getTime() was not gud!! we would sometimes hit two inline generators on one timestamp!
        return `${config.livesAs}${cmsState.idGen}`
    },
    css(a) {
        const sheets = document.styleSheets
        let o = {};
        for (const i in sheets) {
            const rules = sheets[i].rules || sheets[i].cssRules;
            for (const r in rules) {
                if (a.is(rules[r].selectorText)) {
                    o = $.extend(o, helpers.css2json(rules[r].style), helpers.css2json(a.attr('style')));
                }
            }
        }
        return o;
    },
    css2json(css) {
        let myCss = css;
        const s = {};
        if (!myCss) return s;
        if (myCss instanceof CSSStyleDeclaration) {
            for (const i in myCss) {
                if ((myCss[i]).toLowerCase) {
                    s[(myCss[i]).toLowerCase()] = (myCss[myCss[i]]);
                }
            }
        } else if (typeof myCss === "string") {
            myCss = myCss.split("; ");
            for (const i in myCss) {
                const l = myCss[i].split(": ");
                s[l[0].toLowerCase()] = (l[1]);
            }
        }
        return s;
    },
    createCmsRefreshFnFor(component) {
        return () => {
            const cmp = component;
            const turnCmsOff = () => { if(cmp) cmp[config.activatedBy] = false }
            const turnCmsOn  = () => { if(cmp) cmp[config.activatedBy] = true }
            helpers.nextTick(turnCmsOff).then(helpers.nextTick(turnCmsOn));
        }
    },
    // The watchers are only ever created on vue cmp that have lists that iterate over
    // non vue components (mundane divs,button,etc) or on elements with empty lists.
    // however, as soon as the list receives a member, the watcher on that list will die for good.
    // We need at least one html element to know if a list is on vue components or standard html elements.
    // NOTE --
    // The method of determining whether an element is mundane or not is deep. Meaning, you can
    // encase a vue component in a for-loop inside a div. And this will be smart enough to know
    // that it doesn't need to create a listener.
    createLengthWatcherOn(cmp, item){
        if(!cmp ||  (!lodash.isArray(item) && !helpers.isObject(item))){
            return false;
        }

        const len = Object.keys(item).length;
        const watcher = {
            cmp,
            item,
            len,
            watchId: null,
            refreshCms: helpers.createCmsRefreshFnFor(cmp),
            unwatch() {
                clearInterval(watcher.watchId);
            }
        }

        // console.log(`created watcher for`, cmp[config.describedBy]);
        watcher.watchId = setInterval(() => {
            const curLen = watcher.item ? Object.keys(watcher.item).length : 0;
            if(curLen <= watcher.len || !watcher.cmp)
                return;

            if(watcher.cmp[config.activatedBy]){
                // this will kill the watcher by virtue of turning off the cms & then turning it back on.
                // this is not the cleanest / most efficient way to do it but is definitely the least amount
                // of code
                watcher.refreshCms();
            }
        }, 200)


        const cmpWatchList = cmsState.watchers.get(cmp);
        if(!lodash.isArray(cmpWatchList)){
            cmsState.watchers.set(cmp, [watcher])
        }
        else {
            cmpWatchList.push(watcher);
        }

        return true;
    },
    removeWatchersOn(cmp) {
        const cmpWatchList = cmsState.watchers.get(cmp);
        if(!cmpWatchList)
            return;

        // let count = 0;
        lodash.eachRight(cmpWatchList, (watcher, index) => {
            watcher.unwatch();
            cmpWatchList.splice(index, 1);
            // count += 1;
        })
        // console.log(count, `watchers removed fr`, cmp)
        cmsState.watchers.delete(cmp);
    },
    elementContainsVueComponent(element) {
        const vueName = `__vue__`
        if(!element)
            return false;

        if(element[vueName])
            return true;

        return lodash.some(element.childNodes, (child) => {
            return helpers.elementContainsVueComponent(child);
        })
    }
}

// Turn this on, if you want to see how many watches you currently have on!
// setInterval(() => {
//     let count = 0;
//     cmsState.watchers.forEach((v) => { count += v.length; })
//     console.log(`z-cms:: num watches on: ${count}`);
// }, 300);

const list = {
    getMatchingDataItem(item, listData, idx) {
        function findInVueComponent(element, data) {
            const vueComponent = element[`__vue__`];
            if(typeof vueComponent !== `object`)
                return null;

            // prune all the properties that we know, we don't need to compare against!
            // the data for this vueComponent has to be provided in the topLevel as sometype of param.
            const cmpSubset = helpers.onlyUserDefinedProperties(vueComponent);

            // now in the remaining user defined properties of the cmpSubset. We can now try to match
            // an entry in the data! If they match, we have found a match!
            return lodash.find(data, (d) => {
                return lodash.some(cmpSubset, (v) => {
                    return v === d
                })
            })
        }
        return findInVueComponent(item, listData) || listData[idx];
    },
    // From what I understand, there isn't a way to pass a js Object in a drag event.
    // We would have to JSON.stringify the element data being dragged. Then, we would
    // have to parse it on drop *making it a duplicate*. It's not horrible and maybe
    // cleaner in some ways but is less efficient.
    doAdd(addDescriptor) {
        return new Promise((resolve, reject) => {
            if(!addDescriptor)
                return reject();

            const type = typeof addDescriptor;
            if(type === `function`)
                return functions.genericResolver(addDescriptor).then(resolve);

            const cmsAddInstance = helpers.createPopup(`cmsaddchooser`, cmsAddChooser, (fn) => {
                if(typeof fn === `function`) {
                    const chosenAddOption = lodash.findKey(addDescriptor, v => v === fn) || ``;
                    const beautify = chosenAddOption.charAt(0).toUpperCase() + chosenAddOption.slice(1);
                    functions.genericResolver(fn).then((result) => {
                        const addMsg = typeof result === `string` ? result : beautify;
                        config.toastFn(addMsg, "Added", "success");
                        resolve();
                    }).catch((err) => {
                        config.toastFn(`Add ${beautify}`, err || `failed`, "error");
                        resolve();
                    });
                }
                else
                    resolve();
            });
            cmsAddInstance.init(addDescriptor);
            return null;
        })
    },
    modifyDragEvents({ element, data, idx, moveFn, refreshFn, dropObject }, val) {
        const propertyStorageName = `z-cms-list-dragEvents`;
        const fnName = val ? `on` : `off`;
        const eventHandlers = {
            dragover(e) {
                e.preventDefault();
            },
            drop(e) {
                $(e.target).removeClass(cssClasses.dragHover);
                const thisItem = list.getMatchingDataItem(element, data, idx);
                if(thisItem !== cmsState.dragee.value && cmsState.canDrag){
                    const params = {
                        idx,
                        value: cmsState.dragee.value,
                        droppedOn: thisItem,
                        type: cmsState.dragee.type,
                        // isInList: lodash.find(data, (v) => { return v === cmsState.dragee.value }) !== undefined, Removed cause it is not useful in many cases since it doesnt return accurately.
                    }
                    cmsState.canDrag = false;
                    functions.genericResolver(moveFn, params).then(() => { cmsState.canDrag = true; refreshFn(); });
                }
            },
            dragenter(e) {
                e.preventDefault();
                $(e.target).addClass(cssClasses.dragHover);
            },
            dragleave(e) {
                $(e.target).removeClass(cssClasses.dragHover);
            },
        }
        const eventHandlerCollection = val ? eventHandlers : element[propertyStorageName];

        // figure out if we need to add a dragStart event to this element. This will happen if the element has no __vue__ or no cmsDescriptor with `drop` property.
        const addDragStart = val && (!element[`__vue__`] ||
                                    typeof element[`__vue__`][config.describedBy] !== `object` ||
                                    !element[`__vue__`][config.describedBy].drop);

        if(addDragStart) {
            const thisItem = list.getMatchingDataItem(element, data, idx);
            const dropType = dropObject.type;
            const dropValue = helpers.resolveObjOrFunction(dropObject.data, thisItem) || thisItem;

            eventHandlers.dragstart = () => {
                if(thisItem)
                    cmsState.dragee = {
                        type: dropType,
                        value: dropValue
                    };
            }
        }

        // we must store the collection of these new functions inside the element, so we can remove them later when cms is turned off.
        if(val)
            element[propertyStorageName] = eventHandlers;

        lodash.each(eventHandlerCollection, (v, k) => {
            $(element)[fnName](k, v);      // e.g., d7(element).on(`dragenter`, eventHandlers.dragEnter)
        })
        $(element).attr(`draggable`, val);

        if(!val)
            element[propertyStorageName] = null; // remove them now
    },
    modifyOverlay(cmp, val) {
        const descriptor = lodash.pickBy(cmp[config.describedBy], (v, k) => { return k !== 'list' })
        const element = cmp.$el;
        const results = helpers.findChildrenWithAttributesRecursive(element, Object.keys(descriptor));

        const htmlContainerStart = `<div class="${cssClasses.overlayList}" style="${descriptor.style || ''}">`;
        const htmlContainerEnd   = `</div>`;
        const htmlRemove = `<button class="${cssClasses.overlayListRemoveButton}">-</button>`;
        const htmlAdd = `<button class="${cssClasses.overlayListAddButton}">+</button>`;

        // we are doing this just so the newly created item in the list also gets the cms overlays.
        // we can probably replace this with a better method that finds the new dataItem and all but that
        // might be overly complicated if this list is computed and the add function, didn't actually adda
        // anything to this list. But to some other list on the page. This is the easiest way programmatically at least.
        // ------
        const refreshFn  = helpers.createCmsRefreshFnFor(cmp);
        lodash.each(results, (children, listName) => {
            const listDescriptor = descriptor[listName];
            const mappedTo = listDescriptor.mapTo;

            const firstChild = lodash.first(children);
            if(!firstChild || !helpers.elementContainsVueComponent(firstChild)){
                if(val)
                    helpers.createLengthWatcherOn(cmp, mappedTo, { listDescriptor });
                else
                    helpers.removeWatchersOn(cmp);
            }

            const hasAdd = typeof listDescriptor.add === `function` || toString.call(listDescriptor.add) === `[object Object]`;
            const hasRemove = typeof listDescriptor.remove === `function` && typeof mappedTo === `object`;
            const hasMove = typeof listDescriptor.move === `function`;

            const dropObject = { type: listName }
            if(typeof listDescriptor.drop === `string`) {
                dropObject.type = listDescriptor.drop;
            }
            else if(typeof listDescriptor.drop === `object`){
                dropObject.type = typeof listDescriptor.drop.type === `string` ? listDescriptor.drop.type : listName;
                dropObject.data = listDescriptor.drop.data;
            }

            lodash.each(children, (child, idx) => {
                if(val) {
                    const relatedDataItem = hasRemove ? list.getMatchingDataItem(child, mappedTo, idx) : null;
                    let createdDeleteButton = false;

                    $(child).addClass(`${cssClasses.overlayRoot}`);

                    if(hasMove) {
                        list.modifyDragEvents({
                            idx,
                            refreshFn,
                            dropObject, // only used if the inner list elements are not droppable themselves.
                            element: child,
                            data: mappedTo,
                            moveFn: listDescriptor.move
                        }, true);
                    }

                    if(idx === 0 && hasAdd) {
                        if(relatedDataItem) { // we have a delete
                            $(child).append(`${htmlContainerStart}${htmlAdd}${htmlRemove}${htmlContainerEnd}`);
                            createdDeleteButton = true;
                        }
                        else {
                            $(child).append(`${htmlContainerStart}${htmlAdd}${htmlContainerEnd}`);
                        }
                        // in either case, we always have an add. so let's assign a click function to that
                        const addButton = helpers.findChildRecursive(child, `.${cssClasses.overlayListAddButton}`)
                        $(addButton).on('click', () => {
                            const vueName = '__vue__'
                            if(child[vueName]) {
                                list.doAdd(listDescriptor.add);
                            }
                            else
                                list.doAdd(listDescriptor.add).then(refreshFn);
                        })
                    }
                    else if(relatedDataItem){
                        $(child).append(`${htmlContainerStart}${htmlRemove}${htmlContainerEnd}`);
                        createdDeleteButton = true;
                    }
                    if(createdDeleteButton) {
                        const delButton = helpers.findChildRecursive(child, `.${cssClasses.overlayListRemoveButton}`);
                        $(delButton).on('click', () => {
                            functions.genericResolver(listDescriptor.remove, relatedDataItem).then(refreshFn);
                        })
                    }
                }
                else {
                    if(hasMove)
                        list.modifyDragEvents({ idx, element: child, data: mappedTo, moveFn: listDescriptor.move, dropObject }, false);

                    const insertedCmsElement = helpers.findChildRecursive(child, `.${cssClasses.overlayList}`)
                    $(insertedCmsElement).remove();
                    $(child).removeClass(`${cssClasses.overlayRoot}`);
                }
            })
        })
    },
}

const single = {
    showCmsForm(element, cmsDescriptor, setFn) {
        if(!cmsform){
            // console.error(`show cmsForm called before Vue.use(cms)`);
            return;
        }

        const cmsFormInstance = helpers.createPopup(`cmsform`, cmsform);   // instantiates cmsPopup and returns it.
        cmsFormInstance.init(element, cmsDescriptor, setFn);    // give it data. The cmsForm component will handle rendering.
    },
    propagateChange(elem, val) {
        const children = lodash.isArray(elem.$children) ? elem.$children : [elem.$children];
        lodash.each(children, (v) => {
            const child = v;
            if(child[config.activatedBy] !== undefined){
                // the promise always sets it back to true :) This will stop unnecessary propagation
                child[config.activatedByPropagate] = false;
                child[config.activatedBy] = val;
            }
            single.propagateChange(child, val);
        })
    },
    modifyDragEvents(cmp, val) {
        const descriptor = cmp[config.describedBy];
        if(!descriptor || !descriptor.drop){
            return;
        }

        const dropType = typeof descriptor.drop === `string` ? descriptor.drop : descriptor.drop.type;
        const dropData = typeof descriptor.drop === `object` ? descriptor.drop.data : null;
        if(!dropType)
            return;

        const propertyStorageName = `z-cms-dragEvents`;
        const element = cmp.$el;
        const fnName = val ? `on` : `off`;
        const eventHandlers = {
            dragstart() {
                cmsState.dragee = {
                    value: helpers.resolveObjOrFunction(dropData) || helpers.descriptorValueNoWait(cmp, descriptor),
                    type: dropType,
                }
            },
        }
        const eventHandlerCollection = val ? eventHandlers : element[propertyStorageName];

        // we must store the collection of these new functions inside the element, so we can remove them later when cms is turned off.
        if(val)
            element[propertyStorageName] = eventHandlers;

        lodash.each(eventHandlerCollection, (v, k) => {
            $(element)[fnName](k, v);      // e.g., d7(element).on(`dragenter`, eventHandlers.dragEnter)
        })
        $(element).attr(`draggable`, val);

        if(!val)
            element[propertyStorageName] = null; // remove them now
    },
    modifyOverlay(cmp, val) {
        let insertedCmsElement = null;
        const element = cmp.$el;
        single.modifyDragEvents(cmp, val);

        const descriptor = cmp[config.describedBy];
        const setFn = descriptor.set;
        if(typeof setFn !== `function`) // individual components must provide a set function!
            return;

        if(val) {
            if(!$(element).hasClass(cssClasses.overlayRoot))
                $(element).addClass(cssClasses.overlayRoot);

            $(element).append(`<div class="${cssClasses.overlay}" style="${descriptor.style || ''}"/>`);

            insertedCmsElement = helpers.findChildRecursive(element, `.${cssClasses.overlay}`);
            $(insertedCmsElement).mouseenter(() => { $(insertedCmsElement).addClass(cssClasses.overlayOver) })
            $(insertedCmsElement).mouseleave(() => { $(insertedCmsElement).removeClass(cssClasses.overlayOver) })
            $(insertedCmsElement).mouseup((e) => {
                if(e.stopPropagation) e.stopPropagation();
                if(e.preventDefault) e.preventDefault();
                single.showCmsForm(cmp, descriptor, setFn)
            });
        } else {
            insertedCmsElement = helpers.findChildRecursive(element, `.${cssClasses.overlay}`);
            $(insertedCmsElement).remove();

            $(element).removeClass(cssClasses.overlayRoot);
        }
    },
}

const inline = {
    injectInlineCms(element, inlineLoaderParams, style) {
        if(!cmsInlineLoader){
            // console.error(`show injectInlineCms called before Vue.use(cms)`);
            return
        }

        const id = helpers.generateId();
        const injectHtml = `<div id="${id.slice(1)}" class="${cssClasses.inline}" style="${style}"><iloader ref="iloader"/></div>`

        // this is to make the position of the element relative so our component
        // that we will put on top of it, can work :)
        $(element).addClass(cssClasses.overlayRoot)

        // const myCss = helpers.css($(element));
        $(element).append(injectHtml);
        // console.time(`vue creation`)
        cmsState.inline[id] = new Vue({
            el: id,
            components: { iloader: cmsInlineLoader },
            mounted() {
                // if the user hasn't killed us, continue!
                if(!this)
                    return;

                const iloader =  this.$refs.iloader;
                if(!iloader){
                    // error(`no iloader @ ${id}. We shall kill`, inlineLoaderParams);
                    inline.ejectInlineCms(element);
                    return;
                }

                iloader.init(inlineLoaderParams).catch(() => {
                    // error(`failure @ injecting cause ${JSON.stringify(err)}`)
                    inline.ejectInlineCms(element)
                });
                // console.timeEnd(`vue creation`)
            },
            destroyed() {
                // log(`vue instance destroyed milord`);
            },
            methods: {}
        })
    },
    ejectInlineCms(element) {
        const insertedCmsElement = helpers.findChildRecursive(element, `.${cssClasses.inline}`);

        const id = $(insertedCmsElement).attr("id")
        const vueInstance = cmsState.inline[`#${id}`];
        if(vueInstance){
            vueInstance.$destroy(true);
            delete cmsState.inline[`#${id}`];
        }

        $(insertedCmsElement).remove();
        $(element).removeClass(cssClasses.overlayRoot);
    },
    modifyOverlay(cmp, val) {
        function doFind(element, types) {
            // we only care about the first child! I mean, there should only be one!
            const results = helpers.findChildrenWithAttributesRecursive(element, Object.keys(types));
            lodash.each(results, (v, k) => { results[k] = v.length > 0 ? v[0] : null; })
            return results;
        }

        const element = cmp.$el;
        const descriptor = cmp[config.describedBy];
        const results = doFind(element, descriptor.types);
        const style = lodash.isString(descriptor.style) ? descriptor.style : ''

        // we can use the drag / drop event handling from single!
        // since the dragging is not inline. the entire component is dragged / dropped.
        single.modifyDragEvents(cmp, val);

        lodash.each(results, (childElement, name) => {
            if(!childElement)
                return;

            const childDescriptor = descriptor.types[name];
            const inlineLoaderParams = {
                name,
                mapTo: childDescriptor.mapTo || descriptor.mapTo,
                validator: childDescriptor.validator,
                type: childDescriptor.type || childDescriptor,
                set: descriptor.set,
                options: childDescriptor.options
            };

            if(val) {
                inline.injectInlineCms(childElement, inlineLoaderParams, style);
            }
            else {
                inline.ejectInlineCms(childElement);
            }
        })
    }
}

// call this function with apply
function watcherFn() {
    const self = this;
    const showCmsState = self[config.activatedBy] && self[config.allowedBy];
    const promise = new Promise((resolve) => {
        const descriptor = self[config.describedBy];
        // check the activatedByPropagate mutex property. if it's true, we need to propagate this activation
        // down to self's children.
        if(self[config.activatedByPropagate])
            single.propagateChange(self, showCmsState);

        // if this thing has no cms properties, we don't need to do anything further. Quit.
        if(typeof descriptor !== `object`)
            return resolve();

        if(descriptor.list) {   // lists have different behavior than individual components, duh.
            list.modifyOverlay(self, showCmsState);
        }
        else if(descriptor.inline){
            inline.modifyOverlay(self, showCmsState);
        }
        else {
            single.modifyOverlay(self, showCmsState);
        }

        return resolve();
    })

    promise.then(() => {
        self[config.activatedByPropagate] = true;
    })
}

export default function install(VuePtr, { livesIn, livesAs, describedBy, activatedBy, toastFn, components, componentsInline }){
    // read config
    config.livesIn = livesIn || `body`;
    config.livesAs = livesAs || `#wolf-cms-overlay`;
    config.describedBy = describedBy || `cmsDescriptor`;
    config.activatedBy = activatedBy || `cmsInfest`;
    config.allowedBy = `${config.activatedBy}Allowed`
    config.activatedByPropagate = `${config.activatedBy}Propagate`

    // instantiate plug in components
    if(helpers.isObject(components))
        lodash.assign(config.components, components);

    if(helpers.isObject(componentsInline))
        lodash.assign(config.componentsInline, componentsInline);

    // now it's ok to load these components :)
    cmsform = require('./cmsForm.vue');
    cmsInlineLoader = require('./cmsInlineLoader.vue')


    if(typeof toastFn === `function`)
        config.toastFn = toastFn;

    VuePtr.mixin({
        props: {
            [config.allowedBy]: {
                type: Boolean,
                default() {
                    return true;
                }
            },
        },
        data() {
            return {
                [config.activatedBy]: false,
                [config.activatedByPropagate]: true,
            }
        },
        mounted() { // when a component is created, it always checks its mom to see if its time to edit :D
            const parent = this.$parent;
            if(parent && parent[config.activatedBy]){
                const parentDescriptor = parent[config.describedBy];

                // this solves having to manually turn cms on / off on vue components with list cms descriptors
                // who get new items in the list from external sources & not their add functions.
                // What this does not solve is adding vue components with list descriptors on non vue components, such as a div.
                // Remember, this cms allows us to work with lists of non vue things if we give add || remove || move functions
                // The list part of the cms is vue agnostic. This is handled by listeners introduced above.
                if(parentDescriptor && parentDescriptor.list) {
                    // turn parent on / off
                    const refreshParentCms = helpers.createCmsRefreshFnFor(parent);
                    refreshParentCms();
                }
                else if(parent[config.allowedBy]){ // respect the allowed by!
                    this[config.activatedBy] = true;
                }
            }
        },
        watch: {
            /**
            * @function {config.activatatedBy} Triggered each time the `activatedBy` property is changed.
                                    This adds outlines to components so we can edit them.
                                    By default this will be `showCms`.
            * @param  {type} val {This is the showCms property}
            */
            [config.activatedBy]() {
                watcherFn.apply(this)
            },
            [config.allowedBy]() {
                watcherFn.apply(this)
            }
        }
    })
}

export const extendComponents = config.components;
export const extendComponentsInline = config.componentsInline;

