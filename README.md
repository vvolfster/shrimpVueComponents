# shrimp-vue-components

> Imagishrimp's Vue Component Emporium

## Installation
```
npm i -S shrimp-vue-components
```

## Table of Contents
1. bigTools
	1. [firebaseAdminPanel](./src/bigTools/firebaseAdminPanel/docs.md) - Very powerful tool that let's you manage your firebase database very easily. Has a ton of customization potential with custom delegates and what not.
2. image
	1. [imageGrid](./src/image/imageGrid/docs.md) - A simple image grid with a fileDropper.
3. input
	1. [autoform](./src/input/autoform/docs.md) - Quick customizable automatic form building. Can be extended.
	2. [boolean](./src/input/boolean/docs.md) - Input switch (on or off).
	3. [combobox](./src/input/combobox/docs.md) - Dropdown menu.
	4. [date](./src/input/date/docs.md) - Date selector.
	5. [file](./src/input/file/docs.md) - File(s) selector.
	6. [json](./src/input/json/docs.md) - Self explanatory.
	7. [markdown](./src/input/markdown/docs.md) - Mark down editor.
	8. [number](./src/input/number/docs.md) - Self explanatory.
    8. [readOnly](./src/input/readOnly/docs.md) - Just shows a value that cannot be edited. Good for when you want to show something on the form that is a result of other parameters.
	9. [textLine](./src/input/textLine/docs.md) - Single line text input.
	10. [textLineAutoComplete](./src/input/textLineAutoComplete/docs.md) - Perhaps should be called a dictionary selector. Allows selection from a key value pair object with customization on what to show & what to match on.
	11. [textParagraph](./src/input/textParagraph/docs.md) - Self explanatory.
	12. [textPassword](./src/input/textPassword/docs.md) - Self explanatory.
4. layout
	1. [dialog](./src/layout/dialog/docs.md) - Highly customizable Dialog generator.
	2. [modal](./src/layout/modal/docs.md) - Simple modal with multiple animation options.
	3. [popover](./src/layout/popover/docs.md) - Simple popover.
	4. [tabView](./src/layout/tabView/docs.md) - Simple tabview that makes use of vue's slots.
	5. [virtualList](./src/layout/virtualList/docs.md) - Forked from [vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list). Used to increase performance of giant lists. Only renders a select portion.
    6. [dataTable](./src/layout/dataTable/docs.md) - Forked & improved from [vue-materialize-datatable](https://github.com/MicroDroid/vue-materialize-datatable). Uses virtualList behind the scenes to provide a very performant experience while going through big data.
5. misc
	1. [animator](./src/misc/animator/docs.md) - Simple tool to animate absolutely positioned elements.
	2. [collapsible](./src/misc/collapsible/docs.md) - Allows for collapsing & expanding content by clicking on a custom header.
	3. [fileDropper](./src/misc/fileDropper/docs.md) - Filedropper / selector. Accepts filters.
	4. [functions](./src/misc/functions/docs.md) - Useful collection of functions. Mostly used by this library itself.
6. vuePlugins
	1. [toasts](./src/vuePlugins/toasts/docs.md) - Easily create & dismiss toasts. Customizable.
	2. [cms](./src/vuePlugins/cms/docs/readme.md) - A framework for content managment. Powerful and customizable. In place as well as popup component support.
    3. [firebaseAuthentication](./src/vuePlugins/firebaseAuthentication/docs.md) - Easily configure authentication for your firebase instances.


## Running examples & demo

``` bash
# install dependencies
git clone https://github.com/Imagination-International-Inc/shrimpVueComponents.git

# cd to cloned folder and
npm run dev
```

