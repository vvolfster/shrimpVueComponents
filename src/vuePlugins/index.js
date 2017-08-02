import lodash from 'lodash'

import cms from './cms'
import toasts from './toasts'

const plugins = {
    cms, toasts
}

export default {
    install(vue, config) {
        lodash.each(plugins, (plugin, pluginName) => {
            const disabled = lodash.get(config, `${pluginName}.disable`, false) === true;
            if(disabled || !plugin || !lodash.isFunction(plugin))
                return;

            plugin(vue, lodash.get(config, pluginName, config || {}))
            // console.warn(`shrimp-vue-components plugin ${pluginName} installed`);
        })
    }
}

