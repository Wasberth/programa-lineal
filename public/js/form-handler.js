function editForm(mN) {
    console.log(mN);

    let rows = document.getElementById(`form-rows-${mN}`).value; // NUMBER OF ROWS

    let fC = document.getElementById(`form-cols-${mN}`);

    let cols = fC ? document.getElementById(`form-cols-${mN}`).value : rows; // NUMBER OF COLS

    if (mN == 'sys') {
        cols++;
    }

    // FORM FOR SYSTEM INPUT
    let html = `<input name="n-rows-${mN}" type="hidden" value="${rows}">` + // HIDDEN N-ROWS & N-COLS
        `<input name="n-cols-${mN}" type="hidden" value="${cols}">` + ``;
    //`<table style="width:100%;"><tbody>`;

    for (let i = 0; i < rows; i++) {
        //html = html + `<tr class="form-group form-inline" style="width:100%;"><td>`;
        html = html + '<div class="input-group mb-3">';
        for (let j = 0; j < cols; j++) {
            let t = "";
            let l = "";

            if (mN == 'sys' && j != 0) {
                t = `<span class="input-group-text" id="label-${i}-${j}">x<sub>${j}</sub>&nbsp;+ </span>` // X_j +
                l = `aria-describedby="label-${i}-${j}"`; // ASSOCIATE INPUT WITH DESC
            }

            if (mN == 'sys' && j === cols - 1) {
                t = `<span class="input-group-text" id="label-${i}-${j}">=</span>` // X_j +
            }

            html = html + t +
                `<input name="${mN}-${i}-${j}" type="text" class="form-control" ${l}>`; // INPUT FOR j i
        }
        html = html + '</div>';
        //html = html + `</td></tr>`;
    }

    html = html + "</table></tbody>";
    document.getElementById(`m-${mN}-container`).innerHTML = html; //APPEND

    return false;
};

function editVecForm() {
    console.log('vec');

    let rows = Number(document.getElementById(`form-rows-vec`).value); // NUMBER OF ROWS
    let cols = Number(document.getElementById(`form-cols-vec`).value); // NUMBER OF COLS

    // FORM FOR SYSTEM INPUT
    let html = `<input name="n-rows-vec" type="hidden" value="${rows}">` + // HIDDEN N-ROWS & N-COLS
        `<input name="n-cols-vec" type="hidden" value="${cols + 1}">`;
    //`<table style="width:100%;"><tbody>`;

    for (let i = 0; i < cols + 1; i++) {
        //html = html + `<tr class="form-group form-inline" style="width:100%;"><td>`;
        html = html + '<div class="input-group mb-3">';
        for (let j = 0; j < rows; j++) {
            let t = "";
            let l = "";

            if (j == 0) {
                t = `<span class="input-group-text" id="label-v-${i}">v<sub>${i + 1}</sub>&nbsp;=&nbsp;</span>` // v_i =
                l = `aria-describedby="label-v-${i}"`; // ASSOCIATE INPUT WITH DESC
            }

            if (i == cols && j == 0) {
                t = `<span class="input-group-text" id="label-v-${i}">u&nbsp;=&nbsp;</span>` // u
            }

            html = html + t +
                `<input name="vec-${j}-${i}" type="text" class="form-control" ${l}>`; // INPUT FOR j i
        }
        html = html + '</div>';
        //html = html + `</td></tr>`;
    }

    //html = html + "</table></tbody>";
    document.getElementById(`m-vec-container`).innerHTML = html; //APPEND

    return false;
}

function fillRandom(mN, max, min) {
    let rows = document.getElementById(`form-rows-${mN}`).value; // NUMBER OF ROWS

    let fC = document.getElementById(`form-cols-${mN}`);

    let cols = fC ? document.getElementById(`form-cols-${mN}`).value : rows; // NUMBER OF COLS

    if (mN == 'sys') {
        cols++;
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let e = document.getElementsByName(`${mN}-${i}-${j}`);
            if (e) {
                e = e[0];
            }

            if (e) {
                e.value = Math.floor(Math.random() * (max - min)) + min;
            }
        }        
    }
}

document.addEventListener("DOMContentLoaded", function () {
    //document.getElementById('form-control-a').onsubmit = function() { return editForm('a') };

    let sys = document.getElementById('form-control-sys');
    if (sys) {
        sys.onsubmit = function () { return editForm('sys') };
    }

    let a = document.getElementById('form-control-a');
    if (a) {
        a.onsubmit = function () { return editForm('a') };
    }

    let vec = document.getElementById('form-control-vec');
    if (vec) {
        vec.onsubmit = function () { return editVecForm() };
    }

    let h = document.getElementById('form-control-h');
    if (h) {
        h.onsubmit = function () { return editForm('h') };
    }
});