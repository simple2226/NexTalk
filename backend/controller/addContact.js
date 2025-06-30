const Account_Schema = require('../model/account_model')
const Chat_Schema = require('../model/chat_model')


const addContact = async (req, res) => {
try {
    const { phoneNo, firstMessage } = req.body
    const myAccount = await Account_Schema.findById(req._id)
    const hisAccount = await Account_Schema.findOne({ phoneNo: phoneNo })
    if(!hisAccount) {
        res.status(404).json({ message: "User not found with that phone number" })
        return
    }
    const myAccountId = myAccount._id.toString()
    const hisAccountId = hisAccount._id.toString()
    if(myAccount.contacts.includes(hisAccountId)) {
        res.status(409).send({message: "person already exists in contacts"})
        return
    }
    else if(myAccount.requests.includes(hisAccountId)) {
        myAccount.requests = myAccount.requests.filter(_id => _id !== hisAccountId)
        myAccount.contacts.push(hisAccountId)
        const chat = await Chat_Schema.findOne({
            between: [myAccountId, hisAccountId].sort()
        })
        chat.messages.push({
            sender: myAccountId,
            message: firstMessage
        })
        await myAccount.save()
        await chat.save()
        res.status(200).json({message: "contact created"})
    }
    else {
        myAccount.contacts.push(hisAccountId)
        hisAccount.requests.push(myAccountId)
        const between = [myAccountId, hisAccountId].sort()
        const response = await Chat_Schema.create({
            between: between,
            userA: {
                id: myAccountId
            },
            userB: {
                id: hisAccountId
            },
            messages: [{
                sender: myAccountId,
                message: firstMessage
            }]
        })
        if(response) {
            await myAccount.save()
            await hisAccount.save()
            res.status(200).json({message: "contact created"})
        }
    }
} catch {
    res.status(500).send({message: "Internal Server Error"})
}
}

module.exports = addContact