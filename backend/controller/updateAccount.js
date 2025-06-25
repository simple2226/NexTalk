const Account_Schema = require('../model/account_model')

const updateAccount = async (req, res) => {
    try {
        const _id = req.params.userId
        const ud = req.body
        const user = await Account_Schema.findByIdAndUpdate(
            _id,
            ud,
            {new: true}
        )
        if(!user) return res.status(404).json({message: "Internal Server Error"})
        res.status(200).json(user)
    } catch(err) {
        res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = updateAccount