const express = require('express');
const app = express();

const port = 3000;
app.get('/', (req, res) => {
    // res.status(200).send('Output dari server');
    res.status(200).json({message: "Ini API dari get method", appName: "Natours", List: [{nama: "Abdul", usia: 18}]});
    //jika menggunakan json maka Content/Type akan otomatis dirubah menjadi json/application
})

app.post('/', (req, res)=> {
    res.status(403).send("Tidak Bisa post pada endpoint ini...");
})

app.listen(port, () => {
    console.log(`App starting on port ${port}`);
})