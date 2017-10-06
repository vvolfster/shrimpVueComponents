## userActiveStatus (.js)
A convenience component that listens for userActivity. Has 2 functions.

1. ***addListener(fn, duration)***  - The **fn** will be triggered when the user has been inactive for **duration** ms and also when the user becomes active again with a **boolean** value representing userStatus. It will also be triggered at once to get the user's current status. ***duration** defaults to 5000 and is optional.

2. ***removeListener(fn, duration)***  - The **fn** will be removed from all duration watchers if **duration** is not provided. If provided, **fn** will only be removed from being triggered on that **duration**


### Example
```javascript
import userStatus from 'shrimp-vue-components/src/misc/userStatus'

const myListener = (v) => console.log(v);

userStatus.addListener(myListener, 1000);

// and then later
userStatus.removeListener(myListener, 1000);
```