// LIBRARIES
const express = require('express');
const app = express();
const server = require('http').Server(app);
//const math = require('mathjs');
//const algebra = require('algebrite');
const nerd = require('nerdamer/all.min');

// OTHER JS FILES
const matrixHandler = require('./matrix-handler');
const solver = require('./solver');
const basic = require('./nerd');

// ENCODERS & MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

// PORT FOR LISTENING
const port = process.env.PORT || 3000; // FOR HEROKU
//const port = 25565; // FOR TESTING

app.post('/calculateSystem', (req, res) => {
    //console.log(req.body);
    let a = matrixHandler.CreateIfValid(req.body, 'sys', true, true);
    if (!a.isCorrect) { res.redirect('/'); return; }
    //console.log(a);
    solver.diagonalize(a, true);

    let t = a.systematize();

    res.send(`<!DOCTYPE html>
            <html lang="es">
            
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
                <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
                <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>

                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
            
                <link rel="stylesheet" href="css/matrix.css">
            
                <title>Document</title>
            </head>
            
            <body>
                <div class="container" style="margin-top: 1rem;">
            
                    <div class="row">
                        <h2>Respuesta</h2>
                        ${t.getOgSystem()}
                        ${t.getAnswers()}
                    </div>
            
                    <div class="row row-cols-auto"> 
                        ${a.getOriginalHtml()}
                        ${a.getHtml()}
                    </div>
                </div>
            </body>
        
            </html>`);
});

app.post('/calculate1', (req, res) => {
    console.log(req.body);
    let a = matrixHandler.CreateIfValid(req.body, 'a');
    if (!a.isCorrect) { res.redirect('/'); return; }
    let a2 = matrixHandler.matrixDot(a, a);

    let _a = matrixHandler.createMatrixControl(a.mc.nRow, a.mc.nCol, a.mc.matrix);
    solver.diagonalize(_a, false);
    let _aD = _a.calculateDet();

    let _a2D = basic.multiply(_aD.d, _aD.d);

    let am = a.getM();
    if (!basic.equals(_aD.d, 0)) {
        for (let i = 0; i < am.mc.nRow; i++) {
            am.multiplyRow(i, basic.divide(1, _aD.d));
        }
    }

    res.send(`<!DOCTYPE html>
        <html lang="es">

        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

        <link rel="stylesheet" href="css/matrix.css">

        <title>Document</title>
        </head>

        <body>

        <style>
        .separate {
            margin-bottom: 5px;
        }
        </style>

        <div class="container" style="margin-top: 1rem;">

        <div class="row">
            <h2>Operaciones con matrices</h2>

            <p>Aqu?? se encuentran varias operaciones sobre la matriz A</p>
        </div>

        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">A = </div>
            ${a.getOriginalHtml()}

        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">|A|: </div>
            ${_a.getOriginalHtml()}
            ${_a.getHtml()}
            <div class="col" style="text-align: center; margin-top: 1rem;">|A| = ${_aD.op} = ${_aD.det}</div>
        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">A<sup>2</sup>&nbsp;=&nbsp;</div>
            ${a2.getOriginalHtml()}

        </div>
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">|A<sup>2</sup>| = (${_aD.det})<sup>2</sup> = ${_a2D.toString()}</div>
        </div>
            ${basic.equals(_aD.d, basic.zero) ? `` :
            `<div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">M<sup>T</sup> = </div>
            ${am.getOriginalHtml()}
            <div class="col" style="text-align: center; margin-top: 1rem;">A<sup>-1</sup> = </div>
            ${am.getMatrixHtml()}
        </div>`}

        </div>
        </body>

        </html>
    `);
});

app.post('/calculateVectors', (req, res) => {
    console.log(req.body);

    //try {
    let vec = matrixHandler.CreateIfValid(req.body, 'vec', true, true, basic); // VEC SYSTEM
    if (!vec.isCorrect) { res.redirect('/'); return; }
    solver.diagonalize(vec, true);
    let vecSys = vec.systematize();

    let rn = { ...req.body }; // VEC SYSTEM FOR X, Y, Z, ...
    let li = { ...req.body };

    for (let i = 0; i < rn['n-rows-vec']; i++) {
        rn[`vec-${i}-${Number(rn['n-cols-vec']) - 1}`] = `x_${i + 1}`;
        li[`vec-${i}-${Number(rn['n-cols-vec']) - 1}`] = `0`;
    }

    let R = matrixHandler.CreateIfValid(rn, 'vec', true, true, basic); // R^n
    solver.diagonalize(R, true);
    let Rsys = R.systematize();

    let L = matrixHandler.CreateIfValid(li, 'vec', true, true, basic); // R^n
    solver.diagonalize(L, true);
    let Lsys = L.systematize();

    let solus = vecSys.getSolutions();
    let gen = Rsys.getSolutions();
    let ind = Lsys.getSolutions();

    let u = basic.zero;
    let w = basic.zero;
    let z = basic.zero;

    solus.forEach((sol, i) => {
        u = basic.add(u, basic.multiply(sol, basic.parseAndSimp(`v_${vec.subs[i]}`)));
    });

    gen.forEach((sol, i) => {
        w = basic.add(w, basic.multiply(sol, basic.parseAndSimp(`v_${R.subs[i]}`)));
    });

    ind.forEach((sol, i) => {
        z = basic.add(z, basic.multiply(sol, basic.parseAndSimp(`v_${L.subs[i]}`)));
    });

    let liStr = `<p>Los vectores son linealmente independientes</p>`;
    let RnStr = `<p>Los vectores generan a R<sup>n</sup></p>`;
    let base = `<p>Los vectores son base de R<sup>n</sup></p>`;

    if (!basic.equals(z, basic.zero)) {
        liStr = `<p>Los vectores NO son linealmente independientes</p>`;
        base = `<p>Los vectores NO son base de R<sup>n</sup></p>`;
    }

    if (gen.length == 0) {
        RnStr = `<p>Los vectores NO generan a R<sup>n</sup></p>`;
        base = `<p>Los vectores NO son base de R<sup>n</sup></p>`;
    }


    res.send(`<!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
            <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
            <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

            <link rel="stylesheet" href="css/matrix.css">

            <title>Document</title>
        </head>

        <body>

        <style>
        .separate {
            margin-bottom: 5px;
        }
        </style>

        <div class="container" style="margin-top: 1rem;">

            <div class="row">
                <h2>Combinaciones lineales</h2>

                <p>Aqu?? se encuentran las respuestas</p>
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Resolviendo para u:</p>
                </div>
                <div class="col" style="margin-top: 1rem;">
                    ${vecSys.getOgSystem(false, 'a')}
                </div>

                ${solus.length == 0 ?

            `<div class="col" style="margin-top: 1rem;">
                    El conjunto no genera a u
                </div>`:

            `<div class="col" style="margin-top: 1rem;">
                    \\[u=${u.toTeX()}\\]
                </div>`

        }
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Checando si genera R<sup>n</sup></p>
                </div>
                <div class="col" style="margin-top: 1rem;">
                    ${Rsys.getOgSystem(false, 'a')}
                </div>

                ${gen.length == 0 ?

            `<div class="col" style="margin-top: 1rem;">
                        El conjunto no genera a R<sup>n</sup>
                    </div>`:

            `<div class="col" style="margin-top: 1rem;">
                        \\[R^{n}=${w.toTeX()}\\]
                    </div>`

        }
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Checando si son linealmente independientes</p>
                </div>
                <div class="col" style="margin-top: 1rem;">
                    ${Lsys.getOgSystem(false, 'a')}
                </div>

                ${basic.equals(z, basic.zero) ?

            `
                    <div class="col" style="margin-top: 1rem;">
                        S??lo se puede obtener 0 si todas las constantes son 0
                        Los vectores son linealmente independientes
                    </div>`:

            `
                    <div class="col" style="margin-top: 1rem;">
                        Los vectores NO son linealmente independientes, se puede obtener el vector 0 de la siguiente manera:
                    </div>
                    <div class="col" style="margin-top: 1rem;">
                        \\[\\vec{0}=${z.toTeX()}\\]
                    </div>`

        }
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Checando si son base de R<sup>n</sup></p>
                </div>

                <div class="col" style="margin-top: 1rem;">
                    ${liStr}
                    ${RnStr}
                    <p>Por lo tanto</p>
                    ${base}
                </div>
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Solucion para u:</p>
                </div>
                ${vec.getOriginalHtml()}
                ${vec.getHtml()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Solucion para R<sup>n</sup>:</p>
                </div>
                ${R.getOriginalHtml()}
                ${R.getHtml()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="margin-top: 1rem;">
                    <p>Solucion para linealmente independientes<sup>n</sup>:</p>
                </div>
                ${L.getOriginalHtml()}
                ${L.getHtml()}
            </div>

        </div>
        </body>

        </html>
    `);
    /*} catch (error) {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>Ecuaci??n muy grande para manejar</h1>
        </body>
        </html>
        `);
    }*/
});

app.post('/calculate2', (req, res) => {
    console.log(req.body);
    let HBODY = { ...req.body };

    for (let i = 0; i < HBODY['n-rows-h']; i++) {
        HBODY[`h-${i}-${HBODY['n-cols-h']}`] = `0`;
    }

    HBODY['n-cols-h'] = Number(HBODY['n-cols-h']) + 1;

    let ogH = matrixHandler.CreateIfValid(req.body, 'h');

    let h = matrixHandler.CreateIfValid(HBODY, 'h', true, true, basic);
    solver.diagonalize(h, true);
    let hSys = h.systematize();

    let Im = hSys.getIm();
    //console.log(Im);

    res.send(`<!DOCTYPE html>
        <html lang="es">

        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

        <link rel="stylesheet" href="css/matrix.css">

        <title>Document</title>
        </head>

        <body>

        <style>
        .separate {
            margin-bottom: 5px;
        }
        </style>

        <div class="container" style="margin-top: 1rem;">

            <div class="row">
                <h2>Espacio nulo e imagen de una matriz</h2>

                <p>Aqu?? se encuentran las bases del espacio nulo y la imagen de una matriz</p>
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">A = </div>
                ${ogH.getOriginalHtml()}
            </div>
            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Nu(A) = </div>
                <div class="col" style="text-align: center; margin-top: 1rem;">${hSys.getNull()}</div>
            </div>
            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Dim(Nu(A)) = </div>
                <div class="col" style="text-align: center; margin-top: 1rem;">${hSys.getFreeQuant()}</div>
            </div>
            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Im(A) = </div>
                <div class="col" style="text-align: center; margin-top: 1rem;">${Im.gen}</div>
            </div>
            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Dim(Im(A)) = </div>
                <div class="col" style="text-align: center; margin-top: 1rem;">${Im.dim}</div>
            </div>


            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Soluci??n nulo:</div>
                <div class="col" style="margin-top: 1rem;">
                    ${hSys.getOgSystem(false)}
                </div>
                ${h.getOriginalHtml()}
                ${h.getHtml()}
            </div>
            <div class="row row-cols-auto">
                ${hSys.getAnswers()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Soluci??n Imagen:</div>
                ${Im.steps}
            </div>

            

        </div>
        </body>

        </html>
    `);
});

app.post('/baseChan', (req, res) => {
    console.log(req.body);
    let validate = { ...req.body };
    const siz = Number(validate['n-rows-vecb']);
    console.log(siz);

    for (let i = 0; i < siz; i++) {
        validate[`vecb-${i}-${siz}`] = `0`;
        validate[`vecb2-${i}-${siz}`] = `0`;
    }

    validate['n-cols-vecb'] = siz + 1;
    validate['n-cols-vecb2'] = validate['n-cols-vecb'];

    let b1 = matrixHandler.CreateIfValid(validate, 'vecb', true, true, basic);
    solver.diagonalize(b1, true);
    let b1Sys = b1.systematize();

    let b2 = matrixHandler.CreateIfValid(validate, 'vecb2', true, true, basic);
    solver.diagonalize(b2, true);
    let b2Sys = b2.systematize();

    if (b1Sys.getStatus() !== 2) {
        res.send(`<!DOCTYPE html>
        <html lang="es">

        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

        <link rel="stylesheet" href="css/matrix.css">

        <title>Document</title>
        </head>

        <body>

        <style>
        .separate {
            margin-bottom: 5px;
        }
        </style>

        <div class="container" style="margin-top: 1rem;">

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">\\[${b1.getBaseHtml('\\beta_{1}')}\\]</div>
                <div class="col" style="text-align: center; margin-top: 1rem;"><p style="margin-top: 15%">No es una base</p></div>
            </div>

            <div class="row row-cols-auto">
                ${b1.getOriginalHtml()}
                ${b1.getHtml()}
            </div>

        </div>
        </body>

        </html>
        `);
        return;
    }

    if (b2Sys.getStatus() !== 2) {
        res.send(`<!DOCTYPE html>
        <html lang="es">

        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

        <link rel="stylesheet" href="css/matrix.css">

        <title>Document</title>
        </head>

        <body>

        <style>
        .separate {
            margin-bottom: 5px;
        }
        </style>

        <div class="container" style="margin-top: 1rem;">

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">\\[${b2.getBaseHtml('\\beta_{2}')}\\]</div>
                <div class="col" style="text-align: center; margin-top: 1rem;"><p style="margin-top: 15%">No es una base</p></div>
            </div>

            <div class="row row-cols-auto">
                ${b2.getOriginalHtml()}
                ${b2.getHtml()}
            </div>

        </div>
        </body>

        </html>
        `);
        return;
    }

    let canB = Array(siz).fill();
    let transMatrix = Array(siz).fill();
    let steps0 = "";
    let steps = "";

    for (let colVec = 0; colVec < siz; colVec++) {
        let ma = { ...req.body };
        let me = { ...req.body };
        for (let i = 0; i < siz; i++) {
            ma[`vecb2-${i}-${siz}`] = req.body[`vecb-${i}-${colVec}`];
            me[`vecb-${i}-${siz}`] = 0;
            if (colVec === i) {
                me[`vecb-${i}-${siz}`] = 1;
            }
        }
        me[`n-cols-vecb`] = Number(me[`n-cols-vecb`]) + 1;

        let md = matrixHandler.CreateIfValid(me, 'vecb', true, true, basic);
        solver.diagonalize(md, true);
        let mds = md.systematize();
        canB[colVec] = mds.getSolutions();

        steps0 = steps0 + `
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">Vector ${colVec + 1}</div>
            <div class="col" style="margin-top: 1rem;">
                ${mds.getOgSystem(false)}
            </div>
            ${md.getOriginalHtml()}
            ${md.getHtml()}
        </div>
        <div class="row row-cols-auto">
            ${mds.getAnswers()}
        </div>
        `;

        let ms = matrixHandler.CreateIfValid(ma, 'vecb2', true, true, basic);
        solver.diagonalize(ms, true);
        let mss = ms.systematize();
        transMatrix[colVec] = mss.getSolutions();

        steps = steps + `
        <div class="row row-cols-auto">
            <div class="col" style="text-align: center; margin-top: 1rem;">Vector ${colVec + 1}</div>
            <div class="col" style="margin-top: 1rem;">
                ${mss.getOgSystem(false)}
            </div>
            ${ms.getOriginalHtml()}
            ${ms.getHtml()}
        </div> 
        <div class="row row-cols-auto">
            ${mss.getAnswers()}
        </div>
        `;
    }

    console.log(transMatrix);

    let canMC = matrixHandler.createMatrixControl(canB.length, canB[0].length, canB);
    let tCanMC = canMC.getT();

    let transMC = matrixHandler.createMatrixControl(transMatrix.length, transMatrix[0].length, transMatrix);
    let tTransMC = transMC.getT();

    let canVec = [];
    for (let i = 0; i < siz; i++) {
        canVec.push([req.body[`vecb2-${i}-${siz}`]]);
    }

    let canVecMC = matrixHandler.createMatrixControl(canVec.length, 1, canVec);
    let vecB = matrixHandler.matrixDot(tCanMC, canVecMC);
    let vecB2 = matrixHandler.matrixDot(tTransMC, vecB);

    //console.log(Im);

    res.send(`<!DOCTYPE html>
        <html lang="es">

        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

        <link rel="stylesheet" href="css/matrix.css">

        <title>Document</title>
        </head>

        <body>

        <style>
        .separate {
            margin-bottom: 5px;
        }
        </style>

        <div class="container" style="margin-top: 1rem;">

            <div class="row">
                <h2>Cambios de base</h2>

                <p>Aqu?? se encuentra el vector ingresado en las otras bases, la matr??z para convertir de base can??nica a &beta;<sub>1</sub>&nbsp;y de &beta;<sub>1</sub>&nbsp;a&nbsp;&beta;<sub>2</sub></p>
                
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">\\[${b1.getBaseHtml('\\beta_{1}')}\\]</div>
                <div class="col" style="text-align: center; margin-top: 1rem;"><p style="margin-top: 15%">Es una base</p></div>
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">\\[${b2.getBaseHtml('\\beta_{2}')}\\]</div>
                <div class="col" style="text-align: center; margin-top: 1rem;"><p style="margin-top: 15%">Es una base</p></div>
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Matriz transformadora Can??nica&nbsp;&rarr;&nbsp;&beta;<sub>1</sub>&nbsp;=&nbsp;</div>
                ${tCanMC.getOriginalHtml()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Matriz transformadora &beta;<sub>1</sub>&nbsp;&rarr;&nbsp;&beta;<sub>2</sub>&nbsp;=&nbsp;</div>
                ${tTransMC.getOriginalHtml()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Vector can??nico</div>
                ${canVecMC.getOriginalHtml()}
                <div class="col" style="text-align: center; margin-top: 1rem;">Vector en la base &beta;<sub>1</sub></div>
                ${vecB.getOriginalHtml()}
                <div class="col" style="text-align: center; margin-top: 1rem;">Vector en la base &beta;<sub>2</sub></div>
                ${vecB2.getOriginalHtml()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Verificando base 1:</div>
                <div class="col" style="margin-top: 1rem;">
                    ${b1Sys.getOgSystem(false)}
                </div>
                ${b1.getOriginalHtml()}
                ${b1.getHtml()}
            </div>
            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Verificando base 2:</div>
                <div class="col" style="margin-top: 1rem;">
                    ${b2Sys.getOgSystem(false)}
                </div>
                ${b2.getOriginalHtml()}
                ${b2.getHtml()}
            </div>

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Pasos matriz transformadora Can??nica&nbsp;&rarr;&nbsp;&beta;<sub>2</sub></div>
            </div>
            ${steps0}

            <div class="row row-cols-auto">
                <div class="col" style="text-align: center; margin-top: 1rem;">Pasos matriz transformadora &beta;<sub>1</sub>&nbsp;&rarr;&nbsp;&beta;<sub>2</sub></div>
            </div>
            ${steps}
                  

        </div>
        </body>

        </html>
    `);
});

server.listen(port, function () {
    console.log(`Servidor corriendo en el puerto ${port}`);
});