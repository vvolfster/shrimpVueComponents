import Velocity from 'velocity-animate'
import lodash from 'lodash'

function point(x, y) {
    const obj = { x: x || 0, y: y || 0 }
    obj.toString = () => {
        return `(${obj.x}, ${obj.y})`
    }
    return obj;
}

function animateTo({ element, x, y, duration }) {
    const el = lodash.get(element, "$el") || element;
    return Velocity(el, { top: y, left: x }, { duration });
}

function setPositionWithinParent({ element, elementParent, position, offset }) {
    const el = lodash.get(element, "$el") || element;
    const container = elementParent || lodash.get(el, "parentNode");
    const off = offset || { x: 0, y: 0 }
    return new Promise((resolve, reject) => {
        if(!el || !container)
            return reject(`no element or container: element ${element}, parent ${parent}`);

        const r = {
            container: container.getBoundingClientRect(),
            el: el.getBoundingClientRect()
        }

        const posCenter = point((r.container.width - r.el.width) / 2, (r.container.height - r.el.height) / 2)
        const positions = {
            left: point(0, posCenter.y),
            up: point(posCenter.x, 0),
            right: point(r.container.width - r.el.width, posCenter.y),
            down: point(posCenter.x, r.container.height - r.el.height),
            center: posCenter,
            upRight: point(r.container.width - r.el.width, 0),
            upLeft: point(0, 0),
            downRight: point(r.container.width - r.el.width, r.container.height - r.el.height),
            downLeft: point(0, r.container.height - r.el.height)
        }

        // create aliases
        positions.top = positions.up;
        positions.bottom = positions.down;
        positions.topRight = positions.upRight;
        positions.topLeft = positions.upLeft;
        positions.bottomRight = positions.downRight;
        positions.bottomLeft = positions.downLeft;

        const pos = positions[position];
        if(!pos)
            return reject(`no such position as ${position}`)

        el.style.top = `${pos.y + off.y}px`;
        el.style.left = `${pos.x + off.x}px`;
        return resolve();
    })
}

export default {
    animateTo,
    setPositionWithinParent,
    presetAnimationInParent({ element, elementParent, position, animation, duration }) {
        const el = lodash.get(element, "$el") || element;
        const container = elementParent || lodash.get(el, "parentNode");
        return new Promise((resolve, reject) => {
            if(!el || !container)
                return reject(`element is not valid`)

            const rects = {
                container: container.getBoundingClientRect(),
                element: el.getBoundingClientRect()
            }
            const posCenter = {
                y: (rects.container.height - rects.element.height) / 2,
                x: (rects.container.width - rects.element.width) / 2
            }

            const positions = {
                up: point(posCenter.x, 0),
                left: point(0, posCenter.y),
                right: point(rects.container.width - rects.element.width, posCenter.y),
                down: point(posCenter.x, rects.container.height - rects.element.height),
                center: posCenter
            }

            function setStartingPos() {
                const positionAnimDict = {
                    down: {
                        up: ["bottom", point(0, rects.element.height)],
                        down: ["top"],
                        left: ["bottomLeft", point(-rects.element.width, 0)],
                        right: ["bottomRight", point(rects.container.width, 0)]
                    },
                    left: {
                        up: ["bottomLeft"],
                        down: ["topLeft"],
                        left: ["right"],
                        right: ["left", point(-rects.element.width, 0)]
                    },
                    right: {
                        up: ["bottomRight"],
                        down: ["topRight"],
                        left: ["right", point(rects.element.width, 0)],
                        right: ["left"],
                    },
                    up: {
                        up: ["bottom"],
                        down: ["top", point(0, -rects.element.height)],
                        left: ["topLeft", point(-rects.element.width, 0)],
                        right: ["topRight", point(rects.container.width - rects.element.width, 0)]
                    },
                    center: {
                        up: ["bottom"],
                        down: ["top"],
                        left: ["right"],
                        right: ["left"]
                    }
                }

                const pos = lodash.get(positionAnimDict, `${position}.${animation}[0]`)
                const offset = lodash.get(positionAnimDict, `${position}.${animation}[1]`)
                return setPositionWithinParent({ element: el, offset, position: pos, elementParent: container })
            }

            function setEndingPos() {
                return new Promise((resolve) => {
                    const pos = positions[position] || positions.center;
                    el.style.top = `${pos.y}px`;
                    el.style.left = `${pos.x}px`;
                    resolve();
                })
            }

            function doAnimation() {
                const pos = positions[position] || positions.center;
                return animateTo({ element: el, x: pos.x, y: pos.y, duration });
            }

            if(!animation || animation === 'none')
                return setEndingPos().then(resolve).catch(reject);

            return setStartingPos().then(doAnimation).then(resolve).catch(reject);
        })
    }
}
