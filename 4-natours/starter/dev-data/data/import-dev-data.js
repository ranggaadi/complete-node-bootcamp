const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require(`${__dirname}/../../models/tourModel`);

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => console.log('DB Connection successful'));

const data = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importAll = async () => {
    try{
        await Tour.create(data);
        console.log('data berhasil dimasukan');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

const deleteAll = async () => {
    try{
        await Tour.deleteMany();
        console.log('data berhasil dihapus semua');
    }catch(err) {
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] == '--delete'){
    deleteAll();
}else if(process.argv[2] == '--import'){
    importAll();
}

console.log(process.argv);