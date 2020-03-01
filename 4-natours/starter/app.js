const fs = require('fs');
const express = require('express');
const app = express();

const port = 3000;

app.use(express.json());

// app.get('/', (req, res) => {
//     // res.status(200).send('Output dari server');
//     res.status(200).json({message: "Ini API dari get method", appName: "Natours", List: [{nama: "Abdul", usia: 18}]});
//     //jika menggunakan json maka Content/Type akan otomatis dirubah menjadi json/application
// })

// app.post('/', (req, res)=> {
//     res.status(403).send("Tidak Bisa post pada endpoint ini...");
// })


// Ini adalah top level code (dieksekusi sekali aja)

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: "success",
        result: tours.length,
        data : {
            tours
        }
    })
})

app.get('/api/v1/tours/:id', (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1; //merubah string params id menjadi number
    const tour = tours.find(el => el.id === id);

    if(!tour){
        res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    }else{
        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        })
    }
})

app.post('/api/v1/tours', (req, res) => {
    // console.log(req.body);
    // res.send("Done!");

    const newId = tours[tours.length-1].id + 1;
    const newTour = Object.assign({id : newId}, req.body);

    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tours: newTour
            }
        })
    })
})

app.listen(port, () => {
    console.log(`App starting on port ${port}`);
})