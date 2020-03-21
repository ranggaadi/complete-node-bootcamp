const CustomError = require('./../utils/customError');

const handleErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new CustomError(message, 400);
}


const errProd = (err, res) => {
    //Operasional error: mengirim pesan error ke client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });

    //Programming error (unknown error): dont leak error detail
    }else{
        // 1) log error
        console.log("ERROR: ", err); //digunakan untuk log pada hosting

        // 2) Kirim error umum
        res.status(500).json({
            status: "error",
            message: "Something went wrong!"
        })
    }
}

const errDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    //Memisahkan error dev dan prod

    if (process.env.NODE_ENV === "development") {
        errDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = {...err}; //meng hardcopy error file

        if(error.name === "CastError") error = handleErrorDB(error); //jika tipenya CastError maka dihandle fungsi handler err DB
        errProd(error, res);
    }
}