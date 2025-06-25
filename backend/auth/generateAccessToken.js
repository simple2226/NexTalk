require('dotenv').config()
const jwt = require('jsonwebtoken')
const secret = process.env.ACCESS_TOKEN_SECRET
const generateAccessToken = async (payload, options = {}) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, options, (err, token) => {
            if(err) {
                reject(err)
            } else {
                resolve(token)
            }
        })
    })
}

module.exports = generateAccessToken