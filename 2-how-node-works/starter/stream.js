//stream digunakan untuk membaca file yang sangat banyak / besar
//sehingga mengambil /membaca / menulisnya membutuhkan memori dan waktu lama
//maka dari itu digunakan stream karena dengan stream kita membaca chunk by chunk
const fs = require('fs');
const server = require('http').createServer();


server.on('request', (req, res) => {
    //solusi 1 (cara biasa) menggunakan async read NB: tidak efeftif
    // fs.readFile('test-file.txt', (err, data) => {
    //     if(err) console.log(err);
    //     res.writeHead(200, {"Content-Type":"text/plain", "custom-header":"bismillah"});
    //     res.end(data);
    // })

    // Solusi 2 menggunakan stream
    // const reader = fs.createReadStream('test-file.txt');
    // reader.on('data', chunk => { //event data adalah ketika data mengambil chunk / ketika masih terdapat chunk
    //     res.write(chunk); //res adalah writeable stream, dan req adalah sebaliknya
    // });
    // reader.on('end', ()=> { //event end adalah apabila readstream sudah selesai membaca semua chunk.
    //     res.end('Pembacaan Selesai');
    // });
    // reader.on('error', err => {
    //     console.log(err);
    //     res.statusCode = 500;
    //     res.end('File not found!');   
    // });


    // Namun terkadang cara kerja readStream lebih cepat daripada writeStream disebut backpressure
    // maka dari itu diperlukan adanya pipe, untuk menyambungkan langsung darir readStream ke writeStr

    //Solusi 3 menggunakan pipe();
    const reader = fs.createReadStream('test-file.txt');
    reader.pipe(res); //karena disini res adalah writeStream

    //readStreamSource.pipe(writeStreamDestination);
});

server.listen(8000, '127.0.0.1', () => {
    console.log('listening on port 8000');
});