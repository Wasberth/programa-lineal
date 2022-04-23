const nerd = require("nerdamer/all.min");

const minusOne = nerd('-1');
const one = nerd('1');
const zero = nerd('0');

function parseAndSimp(a) {
    return nerd(a);
}

function add(a, b) {
    console.log(a);

    return a.add(b);
}

function subtract(a, b) {
    return a.subtract(b);
}

function multiply(a, b) {
    return nerd.simplify(a.multiply(b));
}

function divide(a, b) {
    let d = nerd.divide(a, b);
    d = nerd.simplify(d);
    return d;
}

function numerator(a) {
    return a.numerator();
}

function equals(a, b) {
    return a.eq(b);
}

function gcd(a, b) {
    if (a.eq(zero) && b.eq(zero)) {
        return zero;
    }

    if (a.eq(zero)) {
        return b;
    }

    if (b.eq(zero)) {
        return a;
    }

    let g = nerd.gcd(nerd.factor(a), b);

    console.log(`GCD of ${a.toString()} + ${b.toString()}: ` + g);
    if (g.toString().includes('gcd')) {
        return divide(a, numerator(divide(a, b)));
    }

    return g;
}

function lcm(a, b) {
    let l = nerd.lcm(a, b);

    if (l.toString().includes('gcd')) {
        return a.multiply(b);
    }

    return l;
}

function negate(a) {
    return a.multiply(minusOne);
}

function reciprocal(a) {
    return a.pow(minusOne);
}

function isConstant(a) {
    let syms = a.variables();
    return syms.length === 0;
}

module.exports.minusOne = minusOne;
module.exports.zero = zero;
module.exports.one = one;

module.exports.parseAndSimp = parseAndSimp;
module.exports.add = add;
module.exports.subtract = subtract;
module.exports.multiply = multiply;
module.exports.divide = divide;
module.exports.numerator = numerator;
module.exports.equals = equals;
module.exports.gcd = gcd;
module.exports.lcm = lcm;
module.exports.negate = negate;
module.exports.reciprocal = reciprocal;

module.exports.isConstant = isConstant;