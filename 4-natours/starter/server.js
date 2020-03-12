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
app.listen(port, () => {
    console.log(`App starting on port ${port}`);
})