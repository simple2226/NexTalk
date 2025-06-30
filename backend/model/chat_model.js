const mongoose = require('mongoose')

const Chat_Schema = mongoose.Schema({
    between: [String],
    userA: {
        id: {type: String, required: true},
        checked: {type: Boolean, default: false},
        socketId: {type: String, default: null}
    },
    userB: {
        id: {type: String, required: true},
        checked: {type: Boolean, default: false},
        socketId: {type: String, default: null}
    },
    started: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    messages: [{
        sender: {type: String, required: true},
        message: {type: mongoose.Schema.Types.Mixed, required: true},
        sentWhen: {type: Date, default: Date.now},
        seen: {type: Boolean, default: false},
        edited: {
            is: {type: Boolean, default: false},
            when: {type: Date, default: Date.now}
        }
    }]
})

Chat_Schema.pre('save', (next) => {
    if (this.between && this.between.length === 2) {
      this.between.sort()
    }
    next()
})

module.exports = mongoose.model('Chat', Chat_Schema)