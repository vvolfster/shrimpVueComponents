# Toasts

You can use Toasts as a plugin or as just as an import. There's a number of ways to install the plugin.

----------


## Install as a Plugin and Usage
There's a few ways to install the plugin:
```javascript
import Vue from 'vue'
import Toasts from 'shrimp-vue-components/src/vuePlugins/toasts'

Vue.use(Toasts)

// or

import Vue from 'vue'
import svt from 'shrimp-vue-components'

const Toasts = svt.vuePlugins.toasts; 
Vue.use(Toasts)

// or

import Vue from 'vue'
import svt from 'shrimp-vue-components'

Vue.use(svt)

```
#### Usage as a plugin
The toast is not installed into each component but rather on Vue itself.
```javascript
Vue.toast(msg, params);	// create std Toast
Vue.toast.positive(msg, params); // create a positive / success Toast
Vue.toast.negative(msg, params); // create a negative / danger Toast
Vue.toast.info(msg, params); // create an informational Toast
Vue.toast.warning(msg, params); // createa a warning Toast
```
#### Params
1. msg(***string***)  - Plain text or HTML. The message of the toast.
2. params(***Object***) - Customization object. Can contain style and duration.
 - style ***(Object)*** - Style CSS Object.
 - duration ***(number)*** - Duration of the toast in ms.

----------

## Import and use Directly



### Install as a Plugin and Usage
Just like above there's a few ways to import the plugin.

```javascript
import Toast from 'shrimp-vue-components/src/vuePlugins/toasts'

// or

import svt from 'shrimp-vue-components'

const Toast = svt.vuePlugins.toasts;

```

#### Usage
```javascript
import Toast from 'shrimp-vue-components/src/vuePlugins/toasts'

Toast(msg, params);	// create std Toast
Toast.positive(msg, params); // create a positive / success Toast
Toast.negative(msg, params); // create a negative / danger Toast
Toast.info(msg, params); // create an informational Toast
Toast.warning(msg, params); // createa a warning Toast
```
#### Params
1. msg(***string***)  - Plain text or HTML. The message of the toast.
2. params(***Object***) - Customization object. Can contain style and duration.
 - style ***(Object)*** - Style CSS Object.
 - duration ***(number)*** - Duration of the toast in ms.

----------
