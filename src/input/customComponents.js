/* eslint-disable max-len */
import lodash from 'lodash'

const components = new Map();

export default {
    validate(component, warningPrefix, silent) {
        const warnings = {
            props: [],
            methods: []
        }

        const prefix = warningPrefix || 'customComponents.validate:: ';

        if (toString.call(component) !== '[object Object]') {
            if(!silent)
                console.error('Tried to register a non object component');

            return null;
        }

        if (typeof component.render !== 'function') {
            if(!silent)
                console.error(`component has no render function!`);

            return null;
        }

        const obj = lodash.pickBy(component, (v, k) => k !== 'methods');
        const props = obj.props || {};
        if (!props.value) {
            warnings.props.push(`value`);
        }

        if (!props.placeholder) {
            warnings.props.push(`placeholder`);
        }

        obj.methods = lodash.assign({}, component.methods);
        const methods = obj.methods;
        if (typeof methods.getValue !== 'function') {
            warnings.methods.push(`getValue`);
            methods.getValue = () => { return "" }
        }

        if (typeof methods.isInError !== 'function') {
            warnings.methods.push(`isInError`);
            methods.isInError = () => false
        }

        if (typeof methods.isEmpty !== 'function') {
            warnings.methods.push(`isEmpty`);
            methods.isEmpty = () => false
        }

        if (typeof methods.updateValue !== 'function') {
            warnings.methods.push(`updateValue \t.Please make sure this methods emits a "value" event with the value on change`);
            methods.updateValue = () => false
        }

        const missingProps = warnings.props.length ? warnings.props.join('\n') : null;
        const missingMethods = warnings.methods.length ? warnings.methods.join('\n') : null;
        if (missingProps) {
            console.warn(prefix, `is missing the following props & will not behave properly with autoform:\n${missingProps}`)
        }

        if (missingProps || missingMethods) {
            console.warn(prefix, `is missing the following methods & will not behave properly with autoform:\n${missingMethods}.\n\ndummy functions were added.`)
        }

        // console.log(obj);
        return obj;
    },
    register(identifier, component) {
        const uid = typeof identifier === 'string' ? identifier.toLowerCase() : identifier;
        const obj = this.validate(component, `customComponents.register::${uid} `);
        if (obj)
            components.set(uid, obj);
    },
    get(identifier) {
        return components.get(identifier);
    },
    set(identifier, component) {
        return this.register(identifier, component);
    },
    remove(identifier) {
        return components.delete(identifier);
    },
    keys() {
        return components.keys();
    },
    values() {
        return components.values();
    },
    entries() {
        return components.entries();
    }
}
