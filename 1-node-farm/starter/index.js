const fs = require('fs');

// Blocking
// const TextIN = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(TextIN);

// const isian = `Ini pokoknya tentang alpukat : ${TextIN}.\nCreated At ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', isian);
// console.log('Pesan telah ditulis');

// const output = fs.readFileSync('./txt/output.txt', 'utf-8');
// console.log(output);


// NON blocking
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    if(err) return console.log('ERROR !');

    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
            console.log(data3);

            fs.writeFile('./txt/final.txt', `${data2}.\n${data3}`, 'utf-8', err => {
                console.log('Pesan anda sudah ditulis...')
            })
        })
    })
})
console.log('akan mencetak file');