const mongoose = require('mongoose')
require('dotenv').config()

const dbConnect = async () => {
    mongoose.connect(process.env.DB_URL)
    .then(() => console.log('DB connected successfully'))
    .catch(err => console.log(`Error connecting DB: ${err}`))
}

module.exports = dbConnect