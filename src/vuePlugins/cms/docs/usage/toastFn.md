### [ZCmsSystem]/[Usage]/toastFn **function**

If this function is passed when doing Vue.use, the cms system will call it when it wants to make toasts. The function will be passed three params:

 1. title(***string***) - The title of the toast
 2. msg(***string***) - The msg of the toast
 3. type(***string enum of [success, error, warning, info]*** ) - The type of the toast.

##### Default:
```javascript
function (){}

```
##### Relevant Example
```javascript
Vue.use(cms, {
  toastFn(title, msg, type) {
      if(type === `success`)
        console.log(title + msg)
      else
        console.error(title + msg)
  }
})
```

[ZCmsSystem]: ../readme.md
[Usage]: ../usage.md