import Velocity from 'velocity-animate'
import lodash from 'lodash'

function point(x, y) {
    const obj = { x: x || 0, y: y || 0 }
    obj.toString = () => {
        return `(${obj.x}, ${obj.y})`
    }
    return obj;
}

function getElAndParent(el, parent) {
    return new Promise((resolve, reject) => {
        const element = lodash.get(el, "$el") || el;
        const elementParent = parent || lodash.get(parent, "parentNode");
        if(!element || !elementParent)
            return reject(`no element or parent: element ${element}, parent ${elementParent}`);

        return resolve({ el: element, parent: elementParent })
    })
}

function getPositions(element, elementParent, offset) {
    return new Promise((resolve, reject) => {
        getElAndParent(element, elementParent)
        .then(({ el, parent }) => {
            const r = {
                parent: parent.getBoundingClientRect(),
                el: el.getBoundingClientRect()
            }

            const posCenter = point((r.parent.width - r.el.width) / 2, (r.parent.height - r.el.height) / 2)
            const positions = {
                left: point(0, posCenter.y),
                up: point(posCenter.x, 0),
                right: point(r.parent.width - r.el.width, posCenter.y),
                down: point(posCenter.x, r.parent.height - r.el.height),
                center: posCenter,
                upRight: point(r.parent.width - r.el.width, 0),
                upLeft: point(0, 0),
                downRight: point(r.parent.width - r.el.width, r.parent.height - r.el.height),
                downLeft: point(0, r.parent.height - r.el.height)
            }

            // apply offsets
            if(offset && typeof offset.x === 'number' && typeof offset.y === 'number') {
                lodash.each(positions, (v) => {
                    v.x += offset.x;
                    v.y += offset.y;
                })
            }

            // create aliases
            positions.top = positions.up;
            positions.bottom = positions.down;
            positions.topRight = positions.upRight;
            positions.topLeft = positions.upLeft;
            positions.bottomRight = positions.downRight;
            positions.bottomLeft = positions.downLeft;
            return resolve({ positions, rects: r });
        })
        .catch(reject);
    })
}

function animateToPoint({ element, x, y, duration }) {
    const el = lodash.get(element, "$el") || element;
    return Velocity(el, { top: y, left: x }, { duration });
}

function setPositionWithinParent({ element, elementParent, position, offset }) {
    return new Promise((resolve, reject) => {
        getElAndParent(element, elementParent).then(({ el, parent }) => {
            getPositions(el, parent, offset).then(({ positions }) => {
                const pos = positions[position];
                if(!pos)
                    return reject(`no such position as ${position}`)

                el.style.top = `${pos.y}px`;
                el.style.left = `${pos.x}px`;
                return resolve();
            }).catch(reject);
        })
        .catch(reject);
    })
}

function presetAnimationInParent(element, elementParent, position, animation, duration) {
    return new Promise((resolve, reject) => {
        getElAndParent(element, elementParent).then(({ el, parent }) => {
            getPositions(el, parent).then(({ positions, rects }) => {
                function setStartingPos() {
                    const positionAnimDict = {
                        down: {
                            up: ["bottom", point(0, rects.el.height)],
                            down: ["top"],
                            left: ["bottomLeft", point(-rects.el.width, 0)],
                            right: ["bottomRight", point(rects.parent.width, 0)]
                        },
                        left: {
                            up: ["bottomLeft"],
                            down: ["topLeft"],
                            left: ["right"],
                            right: ["left", point(-rects.el.width, 0)]
                        },
                        right: {
                            up: ["bottomRight"],
                            down: ["topRight"],
                            left: ["right", point(rects.el.width, 0)],
                            right: ["left"],
                        },
                        up: {
                            up: ["bottom"],
                            down: ["top", point(0, -rects.el.height)],
                            left: ["topLeft", point(-rects.el.width, 0)],
                            right: ["topRight", point(rects.parent.width - rects.el.width, 0)]
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
                    return setPositionWithinParent({ offset, element, elementParent, position: pos })
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
                    return animateToPoint({ element: el, x: pos.x, y: pos.y, duration });
                }

                if(!animation || animation === 'none')
                    return setEndingPos().then(resolve).catch(reject);

                return setStartingPos().then(doAnimation).then(resolve).catch(reject);
            }).catch(reject);
        }).catch(reject);
    })
}

export default {
    setPositionWithinParent,
    animateToPoint,
    animateToCenter({ element, elementParent, startingPosition, duration }) {
        return new Promise((resolve, reject) => {
            getElAndParent(element, elementParent).then(({ el, parent }) => {
                presetAnimationInParent(el, parent, "center",  startingPosition, duration).then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    animateToTop({ element, elementParent, startingPosition, duration }) {
        return new Promise((resolve, reject) => {
            getElAndParent(element, elementParent).then(({ el, parent }) => {
                presetAnimationInParent(el, parent, "up",  startingPosition, duration).then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    animateToBottom({ element, elementParent, startingPosition, duration }) {
        return new Promise((resolve, reject) => {
            getElAndParent(element, elementParent).then(({ el, parent }) => {
                presetAnimationInParent(el, parent, "down",  startingPosition, duration).then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    animateToLeft({ element, elementParent, startingPosition, duration }) {
        return new Promise((resolve, reject) => {
            getElAndParent(element, elementParent).then(({ el, parent }) => {
                presetAnimationInParent(el, parent, "left",  startingPosition, duration).then(resolve).catch(reject);
            }).catch(reject);
        })
    },
    animateToRight({ element, elementParent, startingPosition, duration }) {
        return new Promise((resolve, reject) => {
            getElAndParent(element, elementParent).then(({ el, parent }) => {
                presetAnimationInParent(el, parent, "right",  startingPosition, duration).then(resolve).catch(reject);
            }).catch(reject);
        })
    },
}
