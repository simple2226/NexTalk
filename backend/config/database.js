const mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2;
require('dotenv').config()

const dbConnect = async () => {
    mongoose.connect(process.env.DB_URL)
    .then(() => console.log('DB connected successfully'))
    .catch(err => {
        console.log(`Error connecting DB: ${err}`)
        process.exit(1)
    })
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = { dbConnect, cloudinary }