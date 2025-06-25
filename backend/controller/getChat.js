const Account_Schema = require('../model/account_model')
const Chat_Schema = require('../model/chat_model')

const getChat = async (req, res) => {
    try {
        const chat_id = req.body._id
        const user_id = req.body.others_id
        const Chat = await Chat_Schema.findById(chat_id)
        const User = await Account_Schema.findById(user_id)
        if(Chat && User) {
            res.status(200).json({ Chat, User })
        } else {
            res.status(404).json(response)
        }
    } catch(err) {
        res.status(500).send(`Internal Server error: ${err}`)
    }
}

module.exports = getChat