const mongoose = require('mongoose')

const Account_Schema = mongoose.Schema({
    createdOn: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true,
        maxLength: 100
    },
    phoneNo: {
        type: String,
        required: true,
        maxLength: 10
    },
    password: {
        type: String,
        required: true,
        maxLength: 200
    },
    pfp: {
        type: mongoose.Schema.Types.Buffer,
        default : null
    },
    contacts: [{
        type: String,
        ref: 'Account'
    }],
    requests: [{
        type: String,
        ref: 'Account'
    }],
    socketId: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model('Account', Account_Schema)