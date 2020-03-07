const fs = require('fs');
const express = require('express');
const app = express();

const port = 3000;

app.use(express.json());


// Ini adalah top level code (dieksekusi sekali aja)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//memisahkan route handler
const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        result: tours.length,
        data : {
            tours
        }
    })
}

const getTour = (req, res) => {
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
}

const createATour = (req, res) => {
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
}

const updateTour = (req, res) => {
    const tour = tours.find(el => el.id === req.params.id * 1);
    if(!tour){
        res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        })
    }else{
        res.status(200).json({
            status: "success",
            data: {
                tour: "<Updated Tours here.....>"
            }
        })
    }
}

const deleteTour = (req, res) => {
    const tour = tours.find(el => el.id === req.params.id * 1);
    if(tour){
        res.status(204).json({
            status: 'success',
            data: null
        })
    }else{
        res.status(404).json({
            status: 'fail',
            message: 'invalid ID'
        })
    }
}

// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createATour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

app.route('/api/v1/tours')
    .get(getAllTours)
    .post(createATour);

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

app.listen(port, () => {
    console.log(`App starting on port ${port}`);
})