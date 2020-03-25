// ### SERVER START
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE_LOCAL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connection to DB established"));

const app = require('./app');
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App starting on port ${port}`);
});


//unhandled rejection terjadi apabila suatu async function (mereturn promise) tidak dihandle / tidak di catch biasa terjadi 
//pada kesalahan DB (terjadi diluar applikasi express) maka perlu ditangani
//untuk mengetes kasusnya rubah value port dari variabel DATABASE_LOCAL pada config.env lalu save server.js,
//apabila masih baik baik saja coba lakukan request.

process.on('unhandledRejection', (err) => { //process mendengarkan event unhandledRejection
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION. Shutting down . . ."); //yang hanya bisa dilakukan programmer adalah menutup server
    
    //kenapa tidak langsung menggunakan process.exit() karena agar memproses request yang ada dulu, sehingga tidak langsung
    //tertutup ketika user lain masih menunggu respon.

    server.close(()=> { 
        process.exit(1); //parameter pada exit mendefinisikan 0 = success, 1 unchaught exception.
    })
})