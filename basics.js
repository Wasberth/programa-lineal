const algebra = require('algebrite');

const minusOne = algebra.simplify('-1');
const one = algebra.simplify('1');
const zero = algebra.simplify('0');

function trueSimplify(a) {
    //console.log('trues');
    //console.log('\tsimp');
    let r = algebra.simplify(a);

    //console.log('\tsyms');
    let syms = [];
    algebra.collectUserSymbols(r, syms);

    //console.log('\tfor');
    for (let sy = 0; sy < syms.length; sy++) {
        const symbol = syms[sy];

        //console.log('\t\tnum');
        let n = algebra.numerator(r);
        //console.log('\t\tden');
        let d = algebra.denominator(r);
        console.log('N: ' + n + ' D: ' + d);

        if (isConstant(d)) {
            console.log('===================================' + d + ' IS CONSTANT');
            return r;
        }
        //console.log('\trun');
        r = algebra.run(`factor(${n}, ${symbol})/factor(${d}, ${symbol})`);
    }

    return algebra.rationalize(r);
}

function parseAndSimp(a) {
    console.log('p&s');
    let b = algebra.simplify(a);
    return trueSimplify(b);
}

function negate(a) {
    console.log('neg ' + a);
    let neg = algebra.multiply(a, minusOne);
    return algebra.simplify(neg);
}

function reciprocal(a) {
    console.log('rec' + a);
    let overA = algebra.power(a, minusOne);
    return trueSimplify(overA);
}

function add(a, b) {
    console.log(a + ' + ' + b);
    let sum = algebra.add(a, b);
    return algebra.simplify(sum);
}

function subtract(a, b) {
    console.log(a + ' - ' + b);;
    return algebra.simplify(algebra.run('(' + a + ') - (' + b + ')'));
}

function multiply(a, b) {
    console.log(a + '*' + b);
    let mul = algebra.multiply(a, b);
    return trueSimplify(mul);
}

function divide(a, b) {
    console.log('DIVIDE' + a + ' / ' + b);
    return trueSimplify(algebra.run('(' + a + ') / (' + b + ')'));
}

function numerator(a) {
    console.log('num of ' + a);
    return algebra.numerator(a);
}

function equals(a, b) {
    console.log(a + '=?' + b);
    return algebra.equal(a, b) === 1;
}

function gcd(a, b) {
    console.log('\tGCD OF ' + a + " AND " + b);
    if (equals(a, zero) && equals(b, zero)) {
        console.log('\tIS: ' + zero);
        return zero;
    }

    if (equals(a, zero)) {
        console.log('\tIS: ' + b);
        return b;
    }

    if (equals(b, zero)) {
        console.log('\tIS: ' + a);
        return a;
    }

    let adivb = divide(a, b);
    let bdiva = reciprocal(adivb);

    let numAdivB = numerator(adivb);
    let numBdivA = numerator(bdiva);

    let shorter;

    if (isConstant(numAdivB)) {
        shorter = 'a';
    } else if (isConstant(numBdivA)) {
        shorter = 'b';
    } else {
        shorter = numAdivB.toString().length < numBdivA.toString().length ? 'a' : 'b';
    }

    console.log('SHORTER: ' + shorter);

    let s = shorter == 'a' ? numAdivB : numBdivA;

    let gcc = divide(shorter == 'a' ? a : b, s);

    console.log('\tIS: ' + gcc);
    return trueSimplify(gcc);
}

function lcm(a, b) {
    console.log('lcm of ' + a + " and " + b);
    let axb = multiply(a, b);
    let gcc = gcd(a, b);
    let lcm = divide(axb, gcc);
    return trueSimplify(lcm);
}

function isConstant(a) {
    console.log('isCons: ' + a);
    let sa = algebra.simplify(a);
    console.log('SA: ' + sa);

    let sas = [];
    algebra.collectUserSymbols(sa, sas);

    console.log('\tsas: ' + sas + ' sas len: ' + sas.length + ' is sas len 0 ' + (sas.length == 0));

    return sas.length == 0;
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