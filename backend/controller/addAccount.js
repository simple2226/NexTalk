const Account_Schema = require('../model/account_model')
const { hashPassword } = require('../auth/passwordEncryption')


const addAccount = async (req, res) => {
    try {
        const { phoneNo, username, password } = req.body
        const hashedPassword = await hashPassword(password)
        const alreadyExists = await Account_Schema.find({
            phoneNo : phoneNo
        })
        if(alreadyExists.length) {
            res.status(409).send({message: "username exists"})
            return
        }
        const response = await Account_Schema.create({
            phoneNo: phoneNo.trim(),
            username: username.trim(),
            password: hashedPassword,
        })
        if(response) {
            res.status(200).json({message: "success"})
        }
    } catch {
        res.status(500).send({message: "Internal Server Error"})
    }
}

module.exports = addAccount