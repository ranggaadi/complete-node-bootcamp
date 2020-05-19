const CustomError = require('./../utils/customError');

const handleErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new CustomError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const duplicated = Object.values(err.keyValue);
    return new CustomError(`Duplicated field value: ${duplicated.join(', ')}`, 400)
}

const handleValidationErrorDB = err => {
    const errorsMessage = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data: ${errorsMessage.join(". ")}`;
    return new CustomError(message, 400);
}

const handleJWTError = () => new CustomError('Invalid token!, please login again.', 401);

const handleExpiredJWTError = () => new CustomError('Token already expired, please login again.', 401);

const errProd = (err, req, res) => {

    // API error handler
    if (req.originalUrl.startsWith('/api')) {

        //Operasional error: mengirim pesan error ke client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        //Programming error (unknown error): dont leak error detail
        // 1) log error
        console.log("ERROR: ", err); //digunakan untuk log pada hosting

        // 2) Kirim error umum
        return res.status(500).json({
            status: "error",
            message: "Something went wrong!"
        })
    }

    // Rendered Error Handler
    if(err.isOperational){
        return res.status(err.statusCode).render('pages/error', {
            title: "Something went wrong.",
            msg: err.message
        })
    }

    console.log("ERROR:", err);

    return res.status(err.statusCode).render('pages/error', {
        title: "Something went wrong.",
        msg: "Please try again later."
    })
    
}

const errDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        //API error handler
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }

    // Rendered Error handler
    console.error("ERROR:", err);
    return res.status(err.statusCode).render('pages/error', {
        title: 'Something went wrong!',
        msg: err.message
    })


}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    //Memisahkan error dev dan prod

    if (process.env.NODE_ENV === "development") {
        errDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err }; //meng hardcopy error status
        error.message = err.message;


        if (error.name === "CastError") error = handleErrorDB(error); //jika tipenya CastError maka dihandle fungsi handler err DB
        if (error.code === 11000) error = handleDuplicateFieldsDB(error); //jika kode error 11000 duplicated mongoDB
        if (error.name === "ValidationError") error = handleValidationErrorDB(error); //jika tipenya ValidationError maka dihandle
        //fungsi handler Validation Err
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleExpiredJWTError();
        
        // console.log(err)
        // console.log(error)

        errProd(error, req, res);
    }
}