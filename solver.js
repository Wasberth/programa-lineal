const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all, {
    number: 'Fraction'
});

function diagonalize(m, up = false) {
    const basic = m.basic;

    m.simp();
    for (let ec = 0; ec < m.mc.nRow - 1; ec++) {
        pivot = chooseRow(basic, m, ec);

        if (pivot === -1) { continue; }

        if (pivot !== ec) { m.shiftRows(ec, pivot); }

        for (let affEc = ec + 1; affEc < m.mc.nRow; affEc++) {
            if (basic.equals(m.mc.matrix[ec][ec], basic.zero) || basic.equals(m.mc.matrix[affEc][ec], basic.zero)) { continue; }
            let ecCoeff = m.mc.matrix[ec][ec];
            let affEcCoeff = m.mc.matrix[affEc][ec];

            cLcm = basic.lcm(affEcCoeff, ecCoeff);

            if (!basic.equals(cLcm, basic.one) && !basic.equals(cLcm, basic.minusOne)) {
                affEcCoeff = basic.divide(cLcm, affEcCoeff);
                ecCoeff = basic.divide(cLcm, ecCoeff);
            }

            m.subtractRows(affEc, affEcCoeff, ec, ecCoeff);
        }
        m.appendStepValidate();
        m.simp();
    }

    let range = m.calculateRange();

    console.log("==============================");
    console.log("RANGE: " + range);
    console.log("NROW: " + m.mc.nRow);

    if (!up || range !== m.mc.nRow) {
        return;
    }

    for (let ec = m.mc.nRow - 1; ec >= 1; ec--) {

        for (let affEc = ec - 1; affEc >= 0; affEc--) {
            if (basic.equals(m.mc.matrix[ec][ec], basic.zero) || basic.equals(m.mc.matrix[affEc][ec], basic.zero)) { continue; }

            let ecCoeff = m.mc.matrix[ec][ec];
            let affEcCoeff = m.mc.matrix[affEc][ec];
            console.log('TAC: ' + affEcCoeff);
            console.log('TEC: ' + ecCoeff);

            cLcm = basic.lcm(affEcCoeff, ecCoeff);
            console.log('LCM: ' + cLcm);

            affEcCoeff = basic.divide(cLcm, affEcCoeff);
            ecCoeff = basic.divide(cLcm, ecCoeff);

            console.log('AC: ' + affEcCoeff);
            console.log('EC: ' + ecCoeff);

            m.subtractRows(affEc, affEcCoeff, ec, ecCoeff);
        }
        m.appendStepValidate();
        m.simp();
    }
}

function chooseRow(basic, m, index) {
    let row = -1;
    let prev = undefined;
    for (let i = index; i < m.mc.nRow; i++) {
        if (basic.equals(m.mc.matrix[i][index], basic.zero)) { continue; }

        if (typeof prev === 'undefined' || ((!basic.isConstant(prev)) && basic.isConstant(m.mc.matrix[i][index]))) {
            prev = m.mc.matrix[i][index];
            row = i;
        }

        /*let sm = math.smaller(math.abs(m.mc.matrix[i][index]), math.abs(prev));

        if (!math.equal(sm, prev)) {
            prev = m.mc.matrix[i][index];
            row = i;
        }*/

    }

    return row;
}

module.exports.diagonalize = diagonalize;