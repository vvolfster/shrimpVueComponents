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
        let elementParent = parent || lodash.get(element, "parentNode");
        elementParent = lodash.get(elementParent, "$el") || elementParent;
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
                upRight: point(r.parent.width - r.el.width, 0),
                upLeft: point(0, 0),
                downRight: point(r.parent.width - r.el.width, r.parent.height - r.el.height),
                downLeft: point(0, r.parent.height - r.el.height),
                center: posCenter,
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

function presetInAnimation(element, elementParent, position, startingPosition, duration) {
    return new Promise((resolve, reject) => {
        getElAndParent(element, elementParent).then(({ el, parent }) => {
            getPositions(el, parent).then(({ positions, rects }) => {
                function setStartingPos() {
                    return new Promise((resolve, reject) => {
                        const positionAnimDict = {
                            down: {
                                down: ["bottom", point(0, rects.el.height)],
                                up: ["top"],
                                left: ["bottomLeft", point(-rects.el.width, 0)],
                                right: ["bottomRight", point(rects.parent.width, 0)],
                                upLeft: ["upLeft", point(0, -rects.el.height)],
                                upRight: ["upRight", point(0, -rects.el.height)],
                                downLeft: ["downLeft", point(0, rects.el.height)],
                                downRight: ["downRight", point(0, rects.el.height)],
                                center: ["center"]
                            },
                            left: {
                                down: ["bottomLeft"],
                                up: ["topLeft"],
                                right: ["right"],
                                left: ["left", point(-rects.el.width, 0)],
                                upLeft: ["upLeft"],
                                upRight: ["upRight"],
                                downLeft: ["downLeft"],
                                downRight: ["downRight"],
                                center: ["center"]
                            },
                            right: {
                                down: ["bottomRight"],
                                up: ["topRight"],
                                right: ["right", point(rects.el.width, 0)],
                                left: ["left"],

                                upLeft: ["upLeft"],
                                upRight: ["upRight"],
                                downLeft: ["downLeft"],
                                downRight: ["downRight"],
                                center: ["center"]
                            },
                            up: {
                                down: ["bottom"],
                                up: ["top", point(0, -rects.el.height)],
                                left: ["topLeft", point(-rects.el.width, 0)],
                                right: ["topRight", point(rects.parent.width - rects.el.width, 0)],

                                upRight: ["topRight", point(rects.parent.width - rects.el.width, -rects.el.height)],
                                upLeft: ["topLeft", point(-rects.el.width, -rects.el.height)],
                                downLeft: ["bottomLeft", point(-rects.el.width, 0)],
                                downRight: ["bottomRight", point(rects.parent.width - rects.el.width, 0)],
                                center: ["center"]
                            },
                            center: {
                                down: ["bottom"],
                                up: ["top"],
                                right: ["right"],
                                left: ["left"],
                                upLeft: ["topLeft"],
                                upRight: ["topRight"],
                                downLeft: ["bottomLeft"],
                                downRight: ["bottomRight"]
                            }
                        }

                        const pos = lodash.get(positionAnimDict, `${position}.${startingPosition}[0]`)
                        const offset = lodash.get(positionAnimDict, `${position}.${startingPosition}[1]`)

                        if(!pos)
                            return resolve();

                        return setPositionWithinParent({ offset, element, elementParent, position: pos }).then(resolve).catch(reject);
                    })
                }

                function doAnimation() {
                    const pos = positions[position] || positions.center;
                    return animateToPoint({ element: el, x: pos.x, y: pos.y, duration });
                }

                return setStartingPos().then(doAnimation).then(resolve).catch(reject);
            }).catch(reject);
        }).catch(reject);
    })
}

function presetOutAnimation(element, elementParent, position, startingPosition, duration) {
    return new Promise((resolve, reject) => {
        getElAndParent(element, elementParent).then(({ el, parent }) => {
            getPositions(el, parent).then(({ positions, rects }) => {
                function setStartingPos() {
                    return new Promise((resolve, reject) => {
                        const positionAnimDict = {
                            down: {
                                down: ["bottom", point(0, rects.el.height)],
                                up: ["top"],
                                left: ["bottomLeft", point(-rects.el.width, 0)],
                                right: ["bottomRight", point(rects.parent.width, 0)],
                                upLeft: ["upLeft", point(0, -rects.el.height)],
                                upRight: ["upRight", point(0, -rects.el.height)],
                                downLeft: ["downLeft", point(0, rects.el.height)],
                                downRight: ["downRight", point(0, rects.el.height)],
                                center: ["center"]
                            },
                            left: {
                                down: ["bottomLeft"],
                                up: ["topLeft"],
                                right: ["right"],
                                left: ["left", point(-rects.el.width, 0)],
                                upLeft: ["upLeft"],
                                upRight: ["upRight"],
                                downLeft: ["downLeft"],
                                downRight: ["downRight"],
                                center: ["center"]
                            },
                            right: {
                                down: ["bottomRight"],
                                up: ["topRight"],
                                right: ["right", point(rects.el.width, 0)],
                                left: ["left"],

                                upLeft: ["upLeft"],
                                upRight: ["upRight"],
                                downLeft: ["downLeft"],
                                downRight: ["downRight"],
                                center: ["center"]
                            },
                            up: {
                                down: ["bottom"],
                                up: ["top", point(0, -rects.el.height)],
                                left: ["topLeft", point(-rects.el.width, 0)],
                                right: ["topRight", point(rects.parent.width - rects.el.width, 0)],

                                upRight: ["topRight", point(rects.parent.width - rects.el.width, -rects.el.height)],
                                upLeft: ["topLeft", point(-rects.el.width, -rects.el.height)],
                                downLeft: ["bottomLeft", point(-rects.el.width, 0)],
                                downRight: ["bottomRight", point(rects.parent.width - rects.el.width, 0)],
                                center: ["center"]
                            },
                            center: {
                                down: ["bottom"],
                                up: ["top"],
                                right: ["right"],
                                left: ["left"],
                                upLeft: ["topLeft"],
                                upRight: ["topRight"],
                                downLeft: ["bottomLeft"],
                                downRight: ["bottomRight"]
                            }
                        }

                        const pos = lodash.get(positionAnimDict, `${position}.${startingPosition}[0]`)
                        const offset = lodash.get(positionAnimDict, `${position}.${startingPosition}[1]`)

                        if(!pos)
                            return resolve();

                        return setPositionWithinParent({ offset, element, elementParent, position: pos }).then(resolve).catch(reject);
                    })
                }

                function doAnimation() {
                    const pos = positions[position] || positions.center;
                    const offsets = {
                        up: point(0, -rects.el.height),
                        down: point(0, rects.el.height),
                        left: point(-rects.el.width, 0),
                        right: point(rects.el.width, 0)
                    }

                    const off = offsets[position] || { x: 0, y: 0 }
                    return animateToPoint({ element: el, x: pos.x + off.x, y: pos.y + off.y, duration });
                }

                return setStartingPos().then(doAnimation).then(resolve).catch(reject);
            }).catch(reject);
        }).catch(reject);
    })
}

export default {
    setPositionWithinParent,
    animateToPoint,
    animateInCenter({ element, elementParent, startingPosition, duration }) {
        return presetInAnimation(element, elementParent, "center",  startingPosition, duration)
    },
    animateInTop({ element, elementParent, startingPosition, duration }) {
        return presetInAnimation(element, elementParent, "up",  startingPosition, duration)
    },
    animateInBottom({ element, elementParent, startingPosition, duration }) {
        return presetInAnimation(element, elementParent, "down",  startingPosition, duration)
    },
    animateInLeft({ element, elementParent, startingPosition, duration }) {
        return presetInAnimation(element, elementParent, "left",  startingPosition, duration)
    },
    animateInRight({ element, elementParent, startingPosition, duration }) {
        return presetInAnimation(element, elementParent, "right",  startingPosition, duration)
    },

    animateOutTop({ element, elementParent, startingPosition, duration }) {
        return presetOutAnimation(element, elementParent, "up",  startingPosition, duration)
    },
    animateOutBottom({ element, elementParent, startingPosition, duration }) {
        return presetOutAnimation(element, elementParent, "down",  startingPosition, duration)
    },
    animateOutLeft({ element, elementParent, startingPosition, duration }) {
        return presetOutAnimation(element, elementParent, "left",  startingPosition, duration)
    },
    animateOutRight({ element, elementParent, startingPosition, duration }) {
        return presetOutAnimation(element, elementParent, "right",  startingPosition, duration)
    },

    shake({ element, magnitude, duration, vertical }) {
        return new Promise((resolve, reject) => {
            getElAndParent(element).then(({ el }) => {
                const shakeVal = typeof magnitude === 'number' ? `${magnitude}px` : '5px';
                const dur = duration || 50;

                if(!el)
                    return;

                function up() {
                    return Velocity(el, { translateY: `-${shakeVal}` }, { duration: dur })
                }
                function down() {
                    return Velocity(el, { translateY: shakeVal }, { duration: dur })
                }
                function left() {
                    return Velocity(el, { translateX: `-${shakeVal}` }, { duration: dur })
                }
                function right() {
                    return Velocity(el, { translateX: shakeVal }, { duration: dur })
                }
                function end() {
                    return Velocity(el, { translateX: '0px', translateY: '0px' }, { duration: dur })
                }

                if(vertical) {
                    up()
                    .then(down)
                    .then(up)
                    .then(down)
                    .then(end)
                    .then(resolve)
                    .catch(reject)
                }
                else {
                    left()
                    .then(right)
                    .then(left)
                    .then(right)
                    .then(end)
                    .then(resolve)
                    .catch(reject)
                }
            }).catch(reject);
        })
    }
}
