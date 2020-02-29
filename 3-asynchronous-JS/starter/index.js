const fs = require('fs');
const superagent = require('superagent');


// Kasus callback hell dalam javascript

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//     console.log(`Breed : ${data}`);

//     superagent.get(`https://dog.ceo/api/breed/${data}/images/random`).end((err, res) => {
//         if (err) return console.log('Not Found !');


//         fs.writeFile('dog-img.txt', res.body.message, err => {
//             if(err) return console.log('File error !')
//             console.log('File telah ditulis dan disimpan...');
//         })
//     })
// });


//Cara kerja promises
// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//     console.log(`Breed : ${data}`);

//     superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then(res => {
//         console.log(res.body.message);

//         fs.writeFile('dog-img.txt', res.body.message, err => {
//             if(err) return console.log('File Error');
//             console.log('File telah ditulis dan disimpan...');
//         })
//     })
//     .catch(err => {
//         console.log(err.message)
//     })
// })


// merubah sebuah method menjadi promise

const readFilePromise = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject('File not found');
            resolve(data);
        })
    })
}

const writeFilePromise = (pathfile, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(pathfile, data, err => {
            if (err) reject('Failed to write file...');
            resolve('success writing file...');
        })
    })
}

//Menggunakan readFile dan writeFile yang dirubah menjadi promise
// readFilePromise(`${__dirname}/dog.txt`)
//     .then(data => {
//         console.log(`Breed : ${data}`);
//         return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//     })
//     .then(result => {
//         console.log(result.body.message);

//         return writeFilePromise('dog-img.txt', result.body.message);
//     })
//     .then(() => {
//         console.log('File sukses ditulis dalam file');
//     })
//     .catch(err =>{
//         console.log(err);
//     })


//Menggunakan Async / Await untuk merapikan promises
// const getDogPic = async () => {
//     try {
//         const data = await readFilePromise(`${__dirname}/dog.txt`);
//         console.log(`Breed: ${data}`);
    
//         const result = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//         console.log(result.body.message);
    
//         await writeFilePromise('dog-img.txt', result.body.message);
//         console.log('File sukses ditulis dalam file');

//     }catch(err) {
//         console.log(err);
//     }|
// }

// getDogPic();


// Mengambil return value dari async await
// const getDogPic = async () => {
//         try {
//             const data = await readFilePromise(`${__dirname}/dog.txt`);
//             console.log(`Breed: ${data}`);
        
//             const result = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//             console.log(result.body.message);
        
//             await writeFilePromise('dog-img.txt', result.body.message);
//             console.log('File sukses ditulis dalam file');
    
//         }catch(err) {
//             console.log(err);
//             throw err;  //untuk mereturn error ketika fungsi async diapit promise lagi
//         }
//         return "Proses sedang dijalankan";
//     }

// console.log('1. jalankan method untuk mengambil gambar anjing');
// // const x = getDogPic();
// // console.log(x);
// getDogPic().then(returnVal => {     //hal ini karena otomatis sebuah method async await mereturn promise
//     console.log(returnVal);
//     console.log('3. Proses selesai dan gambar sudah didapatkan');
// })



//namun kode diatas kurang relevan karena kita kembali menggunakan sebuah promise
//maka dari itu akan digunakan sebuah methode async await lagi digabung dengan IIFE

// (async() => {
//     try{
//         console.log('1. jalankan method untuk mengambil gambar anjing');
//         console.log(await getDogPic());
//         console.log('3. Proses selesai dan gambar sudah didapatkan')
//     }catch(err){
//         console.log(err);
//     }
// })();



// Waiting for multiple Promises secara bersamaan

const getDogPic = async ()=> {
    try {
        const data = await readFilePromise(`${__dirname}/dog.txt`);
        console.log(`Breed : ${data}`);
    
        // kita akan menyimpan promise (sehingga tanpa await)
        // const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res1Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res2Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res3Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    
        const allPromise = await Promise.all([res1Promise, res2Promise, res3Promise]);
        const pathImageDariPromise = allPromise.map(el => el.body.message);
    
        await writeFilePromise('dog-img-all.txt', pathImageDariPromise.join('\n'))    
        console.log()
    }catch(err) {
        console.log(err);
        throw err;
    }

    return "2. Proses pengambilan foto selesai";
}

(async () => {
    try{
        console.log("1. Menjalankan fungsi untuk mendapatkan gambar anjing");
        console.log(await getDogPic());
        console.log("3. Proses pemanggilan fungsi sudah selesai");
    }catch(err){
        console.log(err);
    }
})();