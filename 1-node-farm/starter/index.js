const fs = require('fs');
const http = require('http');


///////////////////////////////////
//// FILES

// Blocking
// const TextIN = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(TextIN);

// const isian = `Ini pokoknya tentang alpukat : ${TextIN}.\nCreated At ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', isian);
// console.log('Pesan telah ditulis');

// const output = fs.readFileSync('./txt/output.txt', 'utf-8');
// console.log(output);


// NON blocking
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if(err) return console.log('ERROR !');

//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);

//             fs.writeFile('./txt/final.txt', `${data2}.\n${data3}`, 'utf-8', err => {
//                 console.log('Pesan anda sudah ditulis...')
//             })
//         })
//     })
// })
// console.log('akan mencetak file');






///////////////////////////////////
//// SERVER

//top level code
// menggunakan synchronus karena hanya akan dieksekusi sekali

//READING TEMPLATE

const replaceTemplate = (template, product) => {
    let output = template.replace(/{%ID%}/g, product.id)
    .replace(/{%PRODUCTNAME%}/g, product.productName)
    .replace(/{%IMAGE%}/g, product.image)
    .replace(/{%FROM%}/g, product.from)
    .replace(/{%NUTRIENTS%}/g, product.nutrients)
    .replace(/{%QUANTITY%}/g, product.quantity)
    .replace(/{%PRICE%}/g, product.price)
    .replace(/{%ORGANIC%}/g, `${product.organic ? '' : 'not-organic'}`)
    .replace(/{%DESCRIPTION%}/g, product.description);

    return output;
}

const templOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const templCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const templProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);


const server = http.createServer((req, res) => {
    // console.log(req)
    // res.end('Ini pesan dari server ...');
    // console.log(req.url);

    // if(req.url) {
    //     if(req.url === '/'){
    //         res.end('Selamat Datang di home')
    //     }else{
    //         res.end(`Selamat Datang di ${Array.from(req.url.toString()).filter(chara => chara !== '/').join('')}`)
    //     }
    // }

    const pathName = req.url;

    //OVERVIEW
    if(pathName === '/' || pathName === '/overview'){
        const cardTemp = dataObject.map(el => replaceTemplate(templCard, el)).join('');
        const output = templOverview.replace('{%PRODUCT_CARDS%}', cardTemp);
        
        res.end(output);

    //PRODUCT
    }else if(pathName == '/product'){
        res.end('Selamat Datang di Product');
    
    //API
    }else if (pathName === '/api'){
        res.writeHead(200, {"Content-type":"application/json"});
        res.end(data);

    //PAGENOTFOUND
    }else{
        res.writeHead(404, {
            "Content-type":"text/html",
            "header-pribadi":"flag(1t5_4ll_1n_y0ur_h34d)"
        })
        res.end('<h2>Page Not Found</h2>');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening on port 8000');
});