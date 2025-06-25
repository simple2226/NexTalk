const Account_Schema = require('../model/account_model')

const login = async (req, res) => {
    try {
        const _id = req._id
        const user = await Account_Schema.findById(_id, {
            password: false,
            __v: false,
            refreshToken: false
        })
        res.status(200).json(user)
    } catch {
        res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = login