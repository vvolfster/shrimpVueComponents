## Functions (.js)
Shared functions that the library uses. Will have useful generic things. At the moment, there's only one function therein.

1. ***genericResolver(fn, ...params)***  - Resolves a promise or function. If the returned value is truthy for a non-promise, the returned promise will resolve. Else, it will reject. The only exception to this rule is undefined. Undefined is resolved, not rejected.
	- Parameters
		- ***fn (function | promise)*** - The promise or function to resolve.
		- ***...params (args)*** - Arguments to **fn**
	- Return Value
		- **Promise**
	