module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);

        // menggunakan sintaks dibawah ini juga sama saja
        // fn(req, res, next).catch(next);
    }
}