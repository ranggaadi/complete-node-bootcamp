const fs = require('fs');
const http = require('http');
const url = require('url');

// mengexport module DIY
const replaceTemplate = require('./modules/replaceTemplate');

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

    const {query, pathname} = url.parse(req.url, true);

    //OVERVIEW
    if(pathname === '/' || pathname === '/overview'){
        res.writeHead(200, {"Content-Type":"text/html"});
        const cardTemp = dataObject.map(el => replaceTemplate(templCard, el)).join('');
        const output = templOverview.replace('{%PRODUCT_CARDS%}', cardTemp);
        
        res.end(output);
        
        //PRODUCT
    }else if(pathname === '/product'){
        const product = dataObject[query.id];
        const output = replaceTemplate(templProduct, product);
        res.end(output);
    
    //API
    }else if (pathname === '/api'){
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