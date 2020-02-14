const fs = require('fs');

const TextIN = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(TextIN);

const isian = `Ini pokoknya tentang alpukat : ${TextIN}.\nCreated At ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', isian);
console.log('Pesan telah ditulis');

const output = fs.readFileSync('./txt/output.txt', 'utf-8');
console.log(output);

