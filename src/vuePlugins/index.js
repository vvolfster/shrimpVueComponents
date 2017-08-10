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
            if(disabled || !plugin)
                return;

            const pluginInstallFn = lodash.isObject(plugin) ? plugin.install : plugin;
            if(lodash.isFunction(pluginInstallFn))
                pluginInstallFn(vue, lodash.get(config, pluginName, config || {}))
            // console.warn(`shrimp-vue-components plugin ${pluginName} installed`);
        })
    }
}

