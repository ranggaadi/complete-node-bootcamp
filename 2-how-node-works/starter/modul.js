//pembuktian jika ada semua modul ada di dalam IIFE 
// console.log(arguments);
// console.log(require("module").wrapper);

//module.exports
// const Calculator = require('./test-module-1');
// const C = new Calculator();

// console.log(C.tambah(5, 5));
// console.log(C.bagi(15, 3));

//export
// const calc = require('./test-module-2');
// console.log(calc.bagi(200, 5));
// console.log(calc.tambah(30, 20));

    //mencoba dengan destructuring
    // const { tambah, kali, bagi} = require('./test-module-2');
    // console.log(tambah(12, 24));
    // console.log(kali(2, 4));
    // console.log(bagi(40, 2));

//caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();