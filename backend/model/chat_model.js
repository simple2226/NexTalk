const mongoose = require('mongoose')

const Chat_Schema = mongoose.Schema({
    between: [String],
    userA: {
        id: {type: String, required: true},
        checked: {type: Boolean, default: false},
        numNotRead: {type: Number, default: 0},
        socketId: {type: String, default: null}
    },
    userB: {
        id: {type: String, required: true},
        checked: {type: Boolean, default: false},
        numNotRead: {type: Number, default: 0},
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
        doc_id: {type: String, required: true},
        sender: {type: String, required: true},
        message: {type: mongoose.Schema.Types.Mixed, required: true},
        sentWhen: {type: Date, default: Date.now},
        seen: {type: Boolean, default: false},
        edited: {type: Boolean, default: false},
        deletedForBoth: {type: Boolean, default: false},
        deletedForOne: [String],
        replyFor: {type: String, default: null},
        isCall: {
            isIt: {type: Boolean, default: false},
            caller: {type: String, default: null},
            callee: {type: String, default: null},
            status: {type: String, default: null},
            callOffer: { type: mongoose.Schema.Types.Mixed, default: null },
            typeOfCall: {type: String, default: 'Video'},
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