const mongoose = require('mongoose')

const Account_Schema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxLength: 50
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