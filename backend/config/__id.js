const { default: mongoose } = require("mongoose")

const __id = (id) => {
    return new mongoose.Types.ObjectId(id)
}

module.exports = __id