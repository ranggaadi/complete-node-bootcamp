const EventEmitter = require('events');
const http = require('http');

// const myEmitter = new EventEmitter();

// Namun best practicenya adalah menggunakan class yang mengextends EventEmitter

class Penjualan extends EventEmitter {
    constructor(){
        super();
    }
}

const myEmitter = new Penjualan();

myEmitter.on('testing', () => {
    console.log('bisa lah bro');
})

myEmitter.on('testing', () => {
    console.log('Bisa kedua');
})

myEmitter.on('testing', (angka, nama) => {
    console.log(`angka ${angka} ini dioper dari emitter, dan namaku adalah ${nama}`);
});

myEmitter.emit('testing', 10, 'Axlotl');


/////////////////////////////////////
//// Kasus Penggunaan dalam server

const server = http.createServer();

server.on('request', (req ,res) => {
    console.log('Request Telah diterima...');
    res.end('Request Telah diterima...');
});

server.on('request', (req, res) => {
    console.log('Laporan Kedua');
})

server.on('close', () => {
    console.log('server closed');
})

server.listen(8000, '127.0.0.1', () => {
    console.log('Menunggu request ...');
})