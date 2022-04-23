const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all, {
    number: 'Fraction',
    precision: 40
});

function equalsConst(a, c) {
    let aa = a;
    let cc = c;

    if (a.fn === 'unaryMinus') {
        aa = a.args[0];
    }

    if (c.fn === 'unaryMinus') {
        cc = c.args[0];
    }

    return aa && cc && aa.value == cc.value;
}

function gcd(a, b) {
    let cero = new math.ConstantNode(0);
    if (equalsConst(a, cero) || equalsConst(b, cero)) {
        return cero;
    }

    console.log(cero);
    console.log(b);
    console.log('bq0: ' + b.equals(1));
    console.log('SE SUPONE QUE ' + a.toString() + ' y ' + b.toString() + ' NO SON CEROS');

    function getNum(csd) {
        let r = csd;
        if (r.fn === 'unaryMinus') {
            r = r.args[0];
        }

        if (r.fn === 'divide') {
            r = r.args[0];
        }

        if (r.fn === 'unaryMinus') {
            r = r.args[0];
        }

        return r;
    }

    console.log(a);
    console.log(b);

    let aob = math.simplify(new math.OperatorNode('/', 'divide', [a, b]));
    let boa = math.simplify(new math.OperatorNode('/', 'divide', [b, a]));

    let sa = aob.toString().length < boa.toString().length;

    let o = sa ? aob : boa;

    let s = getNum(o);

    let gcc = math.simplify(new math.OperatorNode('/', 'divide', [sa ? a : b, s]));

    return gcc;
}

function lcm(a, b) {
    let axb = math.simplify(new math.OperatorNode('*', 'multiply', [a, b]));
    let bxa = math.simplify(new math.OperatorNode('*', 'multiply', [b, a]));

    let sa = axb.toString().length < bxa.toString().length;
    let x = sa ? axb : bxa;

    let r = math.simplify(new math.OperatorNode('/', 'divide', [x, gcd(a, b)]));

    return r
}

module.exports.gcd = gcd;
module.exports.lcm = lcm;
module.exports.equalsConst = equalsConst;