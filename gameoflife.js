var canvas = document.getElementById("canvas"),
    width = canvas.width,
    height = canvas.height,
    ctx = canvas.getContext("2d");

ctx.fillStyle = "#F00";
ctx.fill();
/*
(async function loadPatterns() {
    try {
        const response = await fetch("patterns.json");
        const data = await response.text();
        console.log(data);
    } catch (err) {
        console.error(err);
    }
})();*/

class Rule {
    process(point, matrix) {

    }
}




class GameOfLife {
    #dimensions;
    #initPattern;
    #dCount = 3;
    #width = 200;
    #interval = 1000;
    #renderer;
    #keepGoing = false;
    #lastTimestamp = 0;
    #rules;
    #fillRandom = true;

    constructor(dCount, rules, interval, renderer) {
        this.#dimensions = new Array(this.#width).fill(0);
        this.#rules = rules;
        this.#interval = interval;
        this.#renderer = renderer;
        this.#lastTimestamp = 0;
        this.addDimensions(this.#dimensions, dCount - 1);

        this.#dCount = dCount;
    }

    addDimensions(array, dCount) {
        if (dCount == 0) {
            for (let i = 0; i < array.length; ++i)
                array[i] = Math.random() > 0.7 ? 1 : 0;

            return;
        }

        for (let i = 0; i < array.length; ++i) {
            array[i] = new Array(array.length).fill(0);

            if (this.#fillRandom) {
                array[i].forEach((value, j) => {
                    array[i][j] = Math.random() > 0.8 ? 1 : 0;
                });
            }

            this.addDimensions(array[i], dCount - 1);
        }
    }

    incrementCursorMultiD(cursor, maxVals, minVals, d = 0) {
        if (d == cursor.length - 1 || this.incrementCursorMultiD(cursor, maxVals, minVals, d + 1)) {
            cursor[d]++;

            if (cursor[d] > maxVals[d]) {
                cursor[d] = minVals[d];
                return true;
            }
        }

        return false;
    }

    incrementCursor(cursor, maxVal = this.#width, d = 0, minVal = 0) {
        if (d == cursor.length - 1 || this.incrementCursor(cursor, maxVal, d + 1, minVal)) {
            cursor[d]++;

            if (cursor[d] > maxVal) {
                cursor[d] = minVal;
                return true;
            }
        }

        return false;
    }

    matrixEquals(m1, m2) {
        if (!Array.isArray(m1) && !Array.isArray(m2)) {
            return m1 === m2;
        }

        for (let i = 0, len = m1.length; i < len; i++) {
            if (!this.matrixEquals(m1[i], m2[i])) {
                return false;
            }
        }

        return true;
    }

    applyRule(rule, matrix, cell, func) {
        let stack = [];

        rule.before.forEach((value, i) => {
            stack.push(rules[value.type](matrix, value, this, this.#dCount));
        });

        let operand = null;
        let applies = false;
        let result = cell;
        while (stack.length > 0) {
            operand = stack.pop();
            if (typeof (operand) == 'boolean') {
                applies = operand;
            } else if (typeof (operand) == 'string') {
                if (operand == 'or') {
                    let lparam = stack.pop();
                    let rparam = stack.pop();

                    applies = applies || lparam || rparam;
                }
            }
        }

        if (applies) {
            rule.after.forEach((value, i) => {
                if (value.type == 'action') {
                    result = actions[value.value](matrix, value, this, this.#dCount, cell);
                }
            });

            func(result);
        }
    }


    process() {
        let stack = new Array();
        let cursor = new Array(this.#dCount).fill(1);

        do {
            for (let i = 0; i < this.#rules.rules.length; ++i) {
                let rule = this.#rules.rules[i];
                let matrix = this.getRegion(cursor, this.#rules.width);
                let cell = this.get(cursor);

                if ((cell && rule.applies == "live")
                    || (!cell && rule.applies == "dead")) {
                    this.applyRule(rule, matrix, cell, (after) => {
                        let location = [...cursor];

                        stack.push({
                            "location": location,
                            "modification": after
                        });
                    });
                }
            }
        } while (!this.incrementCursor(cursor));

        stack.forEach(((mod) => {
            //this.setRegion(mod.location, mod.modification);
            this.set(mod.location, mod.modification);
        }).bind(this));
    }

    loop(timestamp) {
        let progress = timestamp - this.#lastTimestamp;

        if (progress > this.#interval) {
            this.process();
            this.#lastTimestamp = timestamp;
        }

        this.#renderer.draw(ctx, this);

        if (this.#keepGoing)
            window.requestAnimationFrame(this.loop.bind(this));
    }

    start() {
        this.#keepGoing = true;
        window.requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.#keepGoing = false;
    }

    getRegion(center, width) {
        let matrix = new Array(width).fill(0);
        this.addDimensions(matrix, this.#dCount - 1);

        let localCursor = new Array(center.length).fill(0);
        let absCursor = [...center];

        absCursor.forEach(((number, i) => {
            absCursor[i]--;
        }).bind(this));

        let minVals = [...absCursor];
        let maxVals = [...absCursor];

        maxVals.forEach(((number, i) => {
            maxVals[i] += width - 1;
        }).bind(this));

        do {
            this.set(localCursor, this.get(absCursor), matrix);

            this.incrementCursor(localCursor, width - 1);
        } while (!this.incrementCursorMultiD(absCursor, maxVals, minVals));

        return matrix;
    }

    setRegion(center, region) {
        let localCursor = new Array(center.length).fill(0);
        let absCursor = [...center];

        absCursor.forEach(((number, i) => {
            absCursor[i]--;

            if (absCursor[i] < 0)
                absCursor[i] += (this.#width - 1);
        }).bind(this));

        let minVals = [...absCursor];
        let maxVals = [...absCursor];

        maxVals.forEach(((number, i) => {
            maxVals[i] += region.length;

            if (maxVals[i] > this.#width - 1) {
                maxVals[i] -= (this.#width - 1);
            }
        }).bind(this));

        do {
            this.set(absCursor, this.get(localCursor, region));

            this.incrementCursor(localCursor, region.length);
        } while (!this.incrementCursorMultiD(absCursor, maxVals, minVals));
    }


    _getR(point, dimenstion = this.#dimensions) {
        let i = point.shift();

        if (i < 0)
            i = this.#width - 1;

        if (i > this.#width - 1)
            i = 0;


        let obj = dimenstion[i];

        if (point.length == 0) {
            return obj;
        } else if (typeof obj == "object") {
            return this._getR(point, obj);
        }
        else
            return obj;
    }

    get(point, dimenstion = this.#dimensions) {
        let copy = [...point];
        return this._getR(copy, dimenstion);
    }

    _setR(point, value, dimenstion = this.#dimensions) {
        let i = point.shift();

        if (i < 0)
            i = this.#width - 1;

        if (i > this.#width)
            i = 0;

        let obj = dimenstion[i];

        if (typeof obj == "object") {
            return this._setR(point, value, obj);
        }
        else {
            dimenstion[i] = value;
            return obj;
        }
    }

    set(point, value, dimenstion = this.#dimensions) {
        if (typeof (value) != 'number')
            debugger;


        let copy = [...point];
        return this._setR(copy, value, dimenstion);
    }

    get width() {
        return this.#width;
    }

    get dCount() {
        return this.#dCount;
    }

    get interval() {
        return this.#interval;
    }

    set interval(value) {
        if (value > 100 && value < 10000)
            this.#interval = value;
    }

    set rules(value) {
        this.#rules = value;
    }

    get iterator() {
        var i = {
            "next": (self) => {
                while (!this.incrementCursor(self.pos, this.#width)) {
                    let v = this.get(self.pos);

                    if (v)
                        return self.pos;
                }

                self.end = true;

            },
            "end": false,
            "pos": new Array(this.#dCount)
        };

        i.pos.fill(0);

        return i;
    }

    get multiDimIterator() {
        var i = {
            "next": (self) => {
                while (!this.incrementCursor(self.pos, this.#width)) {
                    let v = this.get(self.pos);

                    let cursor = new Array(this.#dCount - 2).fill(0);
                    let result = 0;
                    while (!this.incrementCursor(cursor, this.#width)) {
                        result += this.get(cursor, v);
                    }

                    if (v)
                        return [...self.pos, result];
                }

                self.end = true;

            },
            "end": false,
            "pos": new Array(2)
        };

        i.pos.fill(0);

        return i;
    }

}

let game = new GameOfLife(2, patterns.ruleSets[0], 100, new Renderer());

game.start();