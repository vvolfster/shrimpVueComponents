import _bigTools from './src/bigTools'
import _button from './src/button'
import _image from './src/image'
import _input from './src/input'
import _layout from './src/layout'
import _misc from './src/misc'
import _vuePlugins from './src/vuePlugins'

// this will let us do stuff like 'import { button } from shrimp-vue-tools' & then use button.toggleButton for instance.
export const bigTools = _bigTools;
export const button = _button;
export const image = _image;
export const input = _input;
export const layout = _layout;
export const misc = _misc;
export const vuePlugins = _vuePlugins;

// this will let us do stuff like 'import svt from shrimp-vue-tools' & then use svt.button.toggleButton for instance.
export default {
    bigTools,
    button,
    image,
    input,
    layout,
    misc,
    vuePlugins,
    install(vue, config) {
        // console.log(`shrimp-vue-components . starting install`)
        _vuePlugins.install(vue, config);
    }
};
