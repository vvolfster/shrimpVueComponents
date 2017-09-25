## Animator (.js)
Leverages **Velocity.js** to provide animations to Vue components. Has a bunch of useful animation functions that are used throughout the lib and can be used elsewhere as well.

----------------
**setPositionWithinParent({ element, elementParent, position, offset })** - Sets the position of **element** relative to **elementParent** as defined by **position** & offseted by **offset**.

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 
	- ***position( String)*** - One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***offset (Object)*** - Offset from position
		- ***x (number)*** - x offset
		- ***y (number)*** - y offset
- Returns **Promise**

------------------

**animateToPoint({ element, x, y, duration})** - Move **element** to **x,y** in **duration** milliseconds. The element **MUST** have absolute positioning.

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***x (number)*** - x coord
	- ***y (number)*** - y coord
	- ***duration(number) -*** The milliseconds it takes to complete the animation.
- Returns **Promise**

------------------
**animateInCenter({ element, elementParent, startingPosition, duration })** - Animate **element** to center of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**animateInTop({ element, elementParent, startingPosition, duration })** - Animate **element** to the inner top side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------

**animateInBottom({ element, elementParent, startingPosition, duration })** - Animate **element** to the inner bottom side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**animateInLeft({ element, elementParent, startingPosition, duration })** - Animate **element** to the inner left side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------

**animateInRight({ element, elementParent, startingPosition, duration })** - Animate **element** to the inner right side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**animateOutTop({ element, elementParent, startingPosition, duration })** - Animate **element** to the outer top side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**animateOutBottom({ element, elementParent, startingPosition, duration })** - Animate **element** to the outer bottom side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**animateOutLeft({ element, elementParent, startingPosition, duration })** - Animate **element** to the outer left side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**animateOutRight({ element, elementParent, startingPosition, duration })** - Animate **element** to the outer right side of **elementParent** over **duration** milliseconds (from **startingPosition**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
 	- ***startingPosition( String)*** - Starting position of the element. (optional) One of ['top', 'bottom', 'topRight', 'topLeft', 'bottomRight', 'bottomLeft']
	- ***duration(number)*** - The duration of the animation in ms.
- Returns **Promise**

------------------
**shake({ element, elementParent, duration, vertical })** - Shakes**element** in place within **elementParent** over **duration** milliseconds (**vertically**, if provided).

-	Params (obj)
	- ***element( HtmlObject | VueComponent)*** - The element to position
	- ***elementParent (HtmlObject | VueComponent) *** - The parent container of the element (Defaults to element's parent)
	- ***duration(number)*** - The duration of the animation in ms.
  	- ***vertical(boolean)*** - Makes the shaking vertical.

- Returns **Promise**

------------------
