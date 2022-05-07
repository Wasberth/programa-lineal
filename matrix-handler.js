const mathjs = require('mathjs');
const math = mathjs.create(mathjs.all, {
    number: 'Fraction'
});

//const basic = require('./basics');
const solver = require('./solver');

function getSumString(a, basic) {
    let m = basic.parseAndSimp(a);
    let op = m.toString().charAt(0) === '-' ? '-' : '+';
    if (op === '-') {
        m = basic.negate(m);
    }

    let ccc = m.toTeX();
    if (basic.equals(m, basic.one)) {
        ccc = "";
    }

    if (!basic.isConstant(m)) {
        ccc = "(" + ccc + ")"
    }


    return { op: op, str: ccc };
}

function matrixDot(A, B) {
    try {
        if (!A || !B || A.mc.matrix.length === undefined || B.mc.matrix[0].length === undefined ||
            A.mc.matrix.length !== B.mc.matrix[0].length) {
            return undefined;
        }
    } catch (error) {
        return undefined;
    }

    var result = new Array(A.mc.matrix.length).fill().map(() => new Array(B.mc.matrix[0].length).fill().map(() => A.basic.zero));

    console.log(result);

    return createMc(A.mc.matrix.length, B.mc.matrix[0].length,
        result.map((row, i) => {
            return row.map((val, j) => {
                return A.mc.matrix[i].reduce(function (sum, elm, k) {
                    return A.basic.add(sum, A.basic.multiply(elm, B.mc.matrix[k][j]), 0);
                })
            });
        }), false, false, A.basic);
}

function validateJSON(json, mN, canDeleteZeros = false, isReshapable = false, basic = require('./nerd')) {
    console.log(json);
    let nRow = json[`n-rows-${mN}`]; // Number of ecuations
    let nCol = json[`n-cols-${mN}`]; // Number of variables

    if (typeof nRow === 'undefined' || typeof nCol === 'undefined' ||
        isNaN(nRow) || isNaN(nCol)) { // IF N-ROWS & N-COLS IS VALID NUMBER
        return { isCorrect: false };
    }
    nRow = Number(nRow);
    nCol = Number(nCol);

    let matrix = Array(nRow).fill().map(() => Array(nCol).fill()); // INIT ARRAY WITH undefined

    for (let i = 0; i < nRow; i++) {
        for (let j = 0; j < nCol; j++) {

            let currentVar = json[`${mN}-${i}-${j}`];
            /*if (typeof currentVar === 'undefined' || isNaN(currentVar)) { // IF j-i VAR IS VALID NUMBER
                return { isCorrect: false };
            };*/

            try {
                matrix[i][j] = basic.parseAndSimp(currentVar);
            } catch (error) {
                return { isCorrect: false };
            }
        }
    }

    return createMc(nRow, nCol, matrix, canDeleteZeros, isReshapable, basic);
}

function createMc(nRow, nCol, matrix, canDeleteZeros = false, isReshapable = false, basic = require('./nerd')) {
    function shiftRows(mc, row1, row2) {
        console.log('SHIFT ROWS');
        for (let i = 0; i < mc.nCol; i++) {
            let temp = mc.matrix[row1][i];
            mc.matrix[row1][i] = mc.matrix[row2][i];
            mc.matrix[row2][i] = temp;

            /*
            let temp = math.simplify(mc.matrix[row1][i]);
            mc.matrix[row1][i] = math.simplify(mc.matrix[row2][i]);
            mc.matrix[row2][i] = math.simplify(temp);
            */
        }
    }

    function shiftCols(mc, col1, col2) {
        console.log('SHIFT COLS');
        for (let i = 0; i < mc.nRow; i++) {
            let temp = mc.matrix[i][col1];
            mc.matrix[i][col1] = mc.matrix[i][col2];
            mc.matrix[i][col2] = temp;
        }

        let su = subs[col1];
        subs[col1] = subs[col2];
        subs[col2] = su;
    }

    function subtractRows(mc, affRow, affRowCoeff, subRow, subRowCoeff) {
        console.log('Subtract ROWS');
        for (let i = 0; i < mc.nCol; i++) {
            mc.matrix[affRow][i] = basic.subtract(
                basic.multiply(affRowCoeff, mc.matrix[affRow][i]),
                basic.multiply(subRowCoeff, mc.matrix[subRow][i])
            );
        }
    }

    function multiplyRow(mc, row, coeff) {
        console.log('mul ROWS');
        for (let i = 0; i < mc.nCol; i++) {
            mc.matrix[row][i] = basic.multiply(coeff, mc.matrix[row][i]);
        }
    }

    console.log('create mc');
    let ogMatrix = Array(nRow).fill().map(() => Array(nCol).fill());
    let cMatrix = Array(nRow).fill().map(() => Array(nCol).fill());
    let subs = [];

    for (let i = 0; i < nRow; i++) {
        for (let j = 0; j < nCol; j++) {
            ogMatrix[i][j] = basic.parseAndSimp(matrix[i][j]);
            cMatrix[i][j] = basic.parseAndSimp(matrix[i][j]);
        }
    }

    for (let i = 0; i < nCol - 1; i++) {
        subs[i] = i + 1;
    }

    return {
        isCorrect: true,
        mc: { nRow: nRow, nCol: nCol, matrix: cMatrix },
        ogMatrix: ogMatrix,
        balances: [], // Factors to get same det value after operation
        subs: subs,
        basic: basic,

        shiftRows: function (rowA, rowB) {
            this.balances.push(basic.minusOne);
            //this.appendStep();
            shiftRows(this.mc, rowA, rowB);
            this.addT(`F<sub>${rowA + 1}</sub>&nbsp;&harr;&nbsp;F<sub>${rowB + 1}</sub><br>`);
            this.appendStep();
        },

        /*
         * @param affRow es un entero índice de la fila afectada
         * @param affRowCoeff es un nodo matemático por el cual se va a multiplicar la fila afectada
         * @param subRow es un entero índice de la fila que se va a restar
         * @param subRowCoeff es un nodo matemático por el cual se va a multiplicar la fila que se resta
         */
        subtractRows: function (affRow, affRowCoeff, subRow, subRowCoeff) {
            //this.appendStep();
            subtractRows(this.mc, affRow, affRowCoeff, subRow, subRowCoeff);

            let ac = basic.parseAndSimp(affRowCoeff);
            let sc = basic.parseAndSimp(subRowCoeff);
            this.balances.push(basic.reciprocal(ac));

            let op = sc.toString().charAt(0) === '-' ? '+' : '-';
            sc = op === '+' ? basic.negate(sc) : sc;

            let acs = basic.equals(ac, basic.one) ?
                "" :
                (basic.equals(ac, basic.minusOne) ?
                    '-' :
                    ac.toString()
                );
            let scs = basic.equals(sc, basic.one) ? "" : sc.toString();

            let acIsC = basic.isConstant(ac);
            if (!acIsC && acs.length > 1) {
                acs = "(" + acs + ")";
            }
            let scIsC = basic.isConstant(sc);
            if (!scIsC && scs.length > 1) {
                scs = "(" + scs + ")";
            }

            this.addT(
                `${acs}F<sub>${affRow + 1}</sub>&nbsp;${op}&nbsp;` +
                `${scs}F<sub>${subRow + 1}</sub>&nbsp;&rarr;&nbsp;` +
                `F<sub>${affRow + 1}</sub><br>`
            );
        },

        multiplyRow: function (row, coeff) {
            //this.appendStep();
            multiplyRow(this.mc, row, coeff);

            let co = basic.parseAndSimp(coeff);
            let divco = basic.reciprocal(co);

            this.balances.push(divco);

            let isC = basic.isConstant(co);
            let ccc = co.toString();
            if (!isC && ccc.length > 1) {
                ccc = "(" + ccc + ")";
            }

            this.addT(`${ccc}F<sub>${row + 1}</sub>&nbsp;&rarr;&nbsp;F<sub>${row + 1}</sub><br>`);
        },

        calculateRange: function () { // Asume que la matriz ya fue diagonalizada
            console.log('range');
            let rangeMatrix = 0;
            for (let i = 0; i < this.mc.nRow; i++) {
                let matIsCero = true;

                for (let j = 0; j < this.mc.nCol && matIsCero; j++) {
                    matIsCero = matIsCero && basic.equals(this.mc.matrix[i][j], basic.zero);
                }

                if (!matIsCero) { rangeMatrix++; }
            }

            return rangeMatrix;
        },

        calculateRangeS: function () { // Asume que la matriz ya fue diagonalizada
            console.log('range');
            let rangeMatrix = 0;
            for (let i = 0; i < this.mc.nRow; i++) {
                let matIsCero = true;

                for (let j = 0; j < this.mc.nCol - 1 && matIsCero; j++) {
                    matIsCero = matIsCero && basic.equals(this.mc.matrix[i][j], basic.zero);
                }

                if (!matIsCero) { rangeMatrix++; }
            }

            return rangeMatrix;
        },

        calculateDet: function () { // Asume que es una matriz cuadrada
            console.log('det');
            let op = "<strong>";
            let det = basic.one;

            this.balances.forEach(b => {
                if (!basic.equals(b, basic.one)) {
                    op = op + `(${b.toString()})`;
                    det = basic.multiply(det, b)
                }
            });

            op = op + "</strong>";

            for (let i = 0; i < this.mc.nRow; i++) {
                op = op + `(${this.mc.matrix[i][i].toString()})`;
                det = basic.multiply(det, this.mc.matrix[i][i]);
            }

            return { op: op, det: det.toString(), d: det };
        },

        getM: function () {
            console.log('M');
            let M = Array(nRow).fill().map(() => Array(nCol).fill());

            for (let i = 0; i < this.mc.nRow; i++) {
                for (let j = 0; j < this.mc.nCol; j++) {

                    let T = [];
                    for (let i2 = 0; i2 < this.mc.nRow; i2++) {
                        if (i2 === i) { continue; }
                        let T2 = [];
                        for (let j2 = 0; j2 < this.mc.nCol; j2++) {
                            if (j2 === j) { continue; }
                            T2.push(this.mc.matrix[i2][j2]);
                        }
                        T.push(T2);
                    }

                    let TC = createMc(this.mc.nRow - 1, this.mc.nCol - 1, T);
                    solver.diagonalize(TC, false);

                    let d = TC.calculateDet().d;
                    let s = math.pow(-1, i + j);

                    M[j][i] = basic.multiply(d, basic.parseAndSimp(s));
                }
            }

            let MC = createMc(this.mc.nRow, this.mc.nCol, M);

            return MC;
        },

        simp: function () {
            console.log('SIMPING');
            for (let i = 0; i < this.mc.nRow; i++) {
                console.log('ROW: ' + this.mc.matrix[i]);
                let g = this.mc.matrix[i][0];

                for (let j = 1; j < this.mc.nCol; j++) {
                    g = basic.gcd(this.mc.matrix[i][j], g);

                    if (basic.equals(g, basic.one)) {
                        break;
                    }
                }

                if (basic.equals(g, basic.zero) && canDeleteZeros) {
                    this.addT(`Se borró la F<sub>${i + 1}</sub><br>`);

                    this.mc.matrix.splice(i, 1);
                    this.mc.nRow--;
                    i--;

                    this.appendStep();
                    continue;
                }

                if (basic.equals(g, basic.one) || basic.equals(g, basic.zero) || basic.equals(g, basic.minusOne)) {
                    continue;
                }

                console.log('DIVIDING BY: ' + g)

                this.multiplyRow(i, basic.reciprocal(g));
            }

            this.appendStepValidate();

            for (let i = 0; i < this.mc.nRow; i++) {
                let s = "";
                for (let j = 0; j < this.mc.nCol; j++) {
                    s = s + this.mc.matrix[i][j].toString() + " ";
                }
                console.log(s);
            }

            console.log('reshapable: ' + isReshapable);

            if (isReshapable) {
                console.log(this.mc.nCol + ">" + this.mc.nRow + "?" + (this.mc.nCol > this.mc.nRow));

                let longes =
                    this.mc.nCol > this.mc.nRow ? this.mc.nRow :
                        this.mc.nCol - 1;

                console.log('LONGES: ' + longes);

                for (let i = 0; i < longes; i++) {
                    console.log(this.mc.matrix[i][i].toString());
                    if (basic.equals(this.mc.matrix[i][i], basic.zero)) {
                        console.log('MUST SHIFT');
                        for (let j = i; j < nCol - 1; j++) {
                            console.log(this.mc.matrix[i][j].toString());
                            if (!basic.equals(this.mc.matrix[i][j], basic.zero)) {
                                console.log('SHIFTING');
                                this.addT(`C<sub>${i + 1}</sub>&nbsp;&harr;&nbsp;C<sub>${j + 1}</sub><br>`);
                                shiftCols(this.mc, i, j);
                                break;
                            }
                        }
                    }
                }
            }

            this.appendStepValidate();
        },

        steps: "",
        appendedHtml: "",

        addT: function (t) { // For step descriptions
            console.log('t');
            this.steps = this.steps + t;
        },
        appendT: function (appendArrow = true) { // For HTML step descriptions (and clears steps)
            console.log('appt');
            if (this.steps === "") { return; }

            this.appendedHtml = this.appendedHtml +
                `<div class="col" style="text-align: center; margin-top: 1rem;">` + this.steps +
                `${appendArrow ? "&rarr;" : ""}</div>`;
            this.steps = "";
        },
        appendStep: function (appendArrow = true) { // For HTML step and step descriptions
            console.log('apps');
            this.appendT(appendArrow);

            this.appendedHtml = this.appendedHtml +
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < this.mc.nRow; i++) {

                this.appendedHtml = this.appendedHtml +
                    `<tr>`;

                for (let j = 0; j < this.mc.nCol; j++) {
                    this.appendedHtml = this.appendedHtml +
                        `<td style="padding-left:5px; padding-right:5px">${this.mc.matrix[i][j].toString()}</td>`;
                }

                this.appendedHtml = this.appendedHtml +
                    `</tr>`;
            }

            this.appendedHtml = this.appendedHtml +
                `       </tbody>` +
                `   </table>` +
                `</div>`;
        },
        appendStepValidate: function () { // Validates details to append step
            console.log('sv');
            if (this.steps === "") { return; }
            this.appendStep();
        },
        getHtml: function () {
            console.log('html');
            return this.appendedHtml;
        },
        getOriginalHtml: function () {
            console.log('html og');
            let og =
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < nRow; i++) {

                og = og + `<tr>`;

                for (let j = 0; j < nCol; j++) {
                    og = og + `<td style="padding-left:5px; padding-right:5px">${this.ogMatrix[i][j].toString()}</td>`;
                }

                og = og + `</tr>`;
            }

            og = og +
                `       </tbody>` +
                `   </table>` +
                `</div>`;

            return (og);
        },
        getMatrixHtml: function () {
            console.log('html mx');
            let m =
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < this.mc.nRow; i++) {

                m = m + `<tr>`;

                for (let j = 0; j < this.mc.nCol; j++) {
                    m = m + `<td style="padding-left:5px; padding-right:5px">${this.mc.matrix[i][j].toString()}</td>`;
                }

                m = m + `</tr>`;
            }

            m = m +
                `       </tbody>` +
                `   </table>` +
                `</div>`;

            return (m);
        },

        systematize: function () {
            let rangeMatrix = this.calculateRangeS();
            let rangeAumMatrix = this.calculateRange();
            console.log('R(A) = ' + rangeMatrix + ' R(A*) = ' + rangeAumMatrix);
            let mc = this.mc;
            let ogM = this.ogMatrix;
            let subs = this.subs;

            function bitCount32(n) {
                n = n - ((n >> 1) & 0x55555555)
                n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
                return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
            }


            function getOgSystem(addSolv = true, letter = 'x') {
                let s = "<p >";
                if (addSolv) {
                    s = "<p>Resolviendo:<br>";
                }

                for (let i = 0; i < nRow; i++) {
                    for (let j = 0; j < nCol - 1; j++) {
                        let isC = basic.isConstant(ogMatrix[i][j]);
                        let ccc = ogMatrix[i][j].toString();
                        if (!isC && ccc.length > 1) {
                            ccc = "(" + ccc + ")";
                        }

                        s = s + `${ccc}${letter}<sub>${j + 1}</sub>${j === nCol - 2 ? '' : '&nbsp;+&nbsp;'}`;
                    }

                    s = s + `&nbsp;=&nbsp;${ogMatrix[i][nCol - 1].toString()}<br>`;
                }

                return s + "</p>";
            }

            function calculateStatus() {
                if (rangeMatrix !== rangeAumMatrix) {
                    return 0; // NO SOLUTIONS
                }
                if (rangeMatrix === rangeAumMatrix && rangeAumMatrix < mc.nCol - 1) {
                    return 1; // INFINITAS SOLUCIONEs
                }
                return 2; // UNA SOLA SOLUCION
            }

            function getAnswers() {
                let hasSolutions = calculateStatus();

                if (!hasSolutions) {
                    return "El sistema no tiene soluciones";
                }

                hasSolutions--;

                if (!hasSolutions) {
                    let aMsg = "<p>El sistema tiene infinidad de soluciones, representadas de la siguiente manera:</p>";

                    for (let ec = 0; ec < mc.nRow; ec++) {

                        aMsg = aMsg + `\\[x_{${subs[ec]}}=`;
                        let sol = mc.matrix[ec][mc.nCol - 1];
                        //aMsg = aMsg + `x<sub>${ec + 1}</sub>&nbsp;=&nbsp;(${mc.matrix[ec][mc.nCol - 1]}&nbsp;`;

                        const freeVarQ = mc.nCol - mc.nRow - 1;
                        console.log('FVQ: ' + freeVarQ);

                        for (let i = 0; i < freeVarQ; i++) {
                            let sub = subs[i];
                            let freeVarI = mc.nCol - i - 2;

                            sol = basic.subtract(sol, basic.multiply(mc.matrix[ec][freeVarI], basic.parseAndSimp(`lambda_${sub}`)));

                        }

                        sol = basic.divide(sol, mc.matrix[ec][ec]);
                        aMsg = aMsg + sol.toTeX() + "\\]";
                        //aMsg = aMsg + `)&nbsp;/&nbsp;${mc.matrix[ec][ec]}<br>`;
                    }

                    let j = mc.nCol - mc.nRow - 1;
                    for (let missVar = mc.nRow; missVar < mc.nCol - 1; missVar++) {
                        aMsg = aMsg + `\\[x_{${subs[missVar]}}=\\lambda_{${j}}\\]`;
                        //aMsg = aMsg + `x<sub>${missVar + 1}</sub>&nbsp;=&nbsp;&lambda;<sub>${j}</sub><br>`;
                        j--;
                    }

                    return aMsg;
                }

                let bMsg = "<p>El sistema tiene una única solución:</p>";

                for (let ec = 0; ec < mc.nRow; ec++) {
                    let numerator = mc.matrix[ec][mc.nCol - 1];
                    let denominator = mc.matrix[ec][ec];

                    bMsg = bMsg + `\\[x_{${subs[ec]}}=${basic.divide(numerator, denominator).toTeX()}\\]<br>`;
                }

                return bMsg;
            }

            function getSolutions() {
                let hasSolutions = calculateStatus();
                let solus = [];

                if (!hasSolutions) {
                    return solus;
                }

                hasSolutions--;

                for (let i = 0; i < mc.nRow; i++) {
                    let s = "";

                    for (let j = 0; j < mc.nCol; j++) {
                        s = s + mc.matrix[i][j].toString() + " ";
                    }

                    console.log(s);
                }

                if (!hasSolutions) {

                    for (let ec = 0; ec < mc.nRow; ec++) {
                        let sol = mc.matrix[ec][mc.nCol - 1];

                        const freeVarQ = mc.nCol - mc.nRow - 1;
                        for (let i = 0; i < freeVarQ; i++) {
                            let sub = i + 1;
                            let freeVarI = mc.nCol - i - 2;

                            sol = basic.subtract(sol, basic.multiply(mc.matrix[ec][freeVarI], basic.parseAndSimp(`lambda_${sub}`)));
                        }

                        sol = basic.divide(sol, mc.matrix[ec][ec]);

                        solus.push(sol);
                    }

                    let j = mc.nCol - mc.nRow - 1;
                    for (let missVar = mc.nRow; missVar < mc.nCol - 1; missVar++) {
                        let sol = basic.parseAndSimp(`lambda_${j}`);
                        solus.push(sol);
                        j--;
                    }

                    return solus;
                }

                for (let ec = 0; ec < mc.nRow; ec++) {
                    let numerator = mc.matrix[ec][mc.nCol - 1];
                    let denominator = mc.matrix[ec][ec];

                    let sol = basic.divide(numerator, denominator);
                    solus.push(sol);
                }

                return solus;
            }

            function getFrees() {
                let hasSolutions = calculateStatus();
                let frees = [];

                if (!hasSolutions) {
                    return frees;
                }

                hasSolutions--;

                console.log('FREES:');
                for (let i = 0; i < mc.nRow; i++) {
                    let s = "";

                    for (let j = 0; j < mc.nCol; j++) {
                        s = `${s + mc.matrix[i][j].toString()}\t`;
                    }

                    console.log(s);
                }

                if (!hasSolutions) {

                    for (let ec = 0; ec < mc.nRow; ec++) {
                        let freeI = [];

                        const freeVarQ = mc.nCol - mc.nRow - 1;
                        for (let i = 0; i < freeVarQ; i++) {
                            let freeVarI = mc.nCol - i - 2;

                            freeI[i] = mc.matrix[ec][freeVarI];
                        }

                        frees.push({
                            coeff: mc.matrix[ec][ec],
                            freeI: freeI
                        });
                    }

                    return frees;
                }

                for (let ec = 0; ec < mc.nRow; ec++) {
                    frees.push({
                        coeff: mc.matrix[ec][ec],
                        freeI: []
                    });
                }

                return frees;
            }

            function getFreeQuant() {
                return mc.nCol - mc.nRow - 1;
            }

            //Asumiendo que el sistema es homogeneo
            function getNull() {
                if (calculateStatus() == 2) {
                    return "{<strong>0</strong>}";
                }

                let s = "<";
                const freeQ = getFreeQuant();
                const frees = getFrees();

                let facs = [];
                let lcm = frees[0].coeff;

                for (let j = 1; j < mc.nCol - freeQ - 1; j++) {
                    lcm = basic.lcm(lcm, frees[j].coeff);
                }

                console.log("FREE LCM: " + lcm);

                for (let j = 0; j < mc.nCol - freeQ - 1; j++) {
                    facs[j] = basic.divide(lcm, frees[j].coeff);
                }

                for (let i = 0; i < freeQ; i++) {
                    s = s + "(";

                    for (let j = 0; j < mc.nCol - freeQ - 1; j++) {
                        s = s + basic.multiply(basic.negate(frees[j].freeI[i]), facs[j]).toString() + ", ";
                    }

                    for (let j = 0; j < freeQ; j++) {
                        let l = basic.zero;

                        if (j == freeQ - 1 - i) {
                            l = basic.one;
                        }

                        s = s + basic.multiply(l, lcm).toString();

                        if (j != freeQ - 1) {
                            s = s + ", ";
                        }
                    }

                    s = s + ")";

                    if (i != freeQ - 1) {
                        s = s + ", ";
                    }
                }
                s = s + ">";
                return s;
            }

            function getIm() {
                let v = "";
                let steps = "";

                for (let i = 0; i < Math.pow(2, mc.nCol - 1); i++) {
                    if (bitCount32(i) != rangeMatrix) {
                        continue;
                    }
                    let vr = "<";

                    let c = 0;

                    let vVecs = Array(mc.nRow).fill().map(() => Array(rangeMatrix + 1).fill(0));
                    console.log(vVecs);

                    for (let k = 0; k < mc.nCol; k++) {
                        console.log(i.toString(2) + ", " + (i.toString(2).charAt(k) == 1));

                        if (i.toString(2).charAt(k) == 1) {
                            vr = vr + "("
                            for (let l = 0; l < mc.nRow; l++) {
                                vVecs[l][c] = ogM[l][k];
                                vr = vr + ogM[l][k];

                                if (l !== mc.nRow - 1) {
                                    vr = vr + ", ";
                                }
                            }
                            vr = vr + ")";
                            c++;

                            if (c !== rangeMatrix) {
                                vr = vr + ", ";
                            }
                        }
                    }

                    vr = vr + ">";

                    let vecsMC = createMc(mc.nRow, rangeMatrix + 1, vVecs, true, true, basic);
                    solver.diagonalize(vecsMC, true);
                    let vecsSys = vecsMC.systematize();

                    steps = steps +
                        `<div class="col" style="text-align: center; margin-top: 1rem;">
                            Checando si {${vr.substring(1, vr.length - 1)}} son linealmente independientes
                        </div>
                        <div class="col" style="margin-top: 1rem;">
                            ${vecsSys.getOgSystem(false)}
                        </div>
                        ${vecsMC.getOriginalHtml()}
                        ${vecsMC.getHtml()}`;

                    console.log("STATUS: " + vecsSys.getStatus());

                    if (vecsSys.getStatus() === 2) {
                        v = vr;
                        steps = steps +
                            `<div class="col" style="text-align: center; margin-top: 1rem;">
                                Sí son linealmente independientes
                            </div>`;
                        break;
                    }

                    steps = steps +
                        `<div class="col" style="text-align: center; margin-top: 1rem;">
                            No son linealmente independientes
                        </div>`;

                }

                return { gen: v, steps: steps};
            }

            return {
                getOgSystem: getOgSystem,
                getAnswers: getAnswers,
                getSolutions: getSolutions,
                getFrees: getFrees,
                getFreeQuant: getFreeQuant,
                getStatus: calculateStatus,
                getNull: getNull,
                getIm: getIm
            };
        }
    };
}

module.exports.CreateIfValid = validateJSON;
module.exports.matrixDot = matrixDot;
module.exports.createMatrixControl = createMc;