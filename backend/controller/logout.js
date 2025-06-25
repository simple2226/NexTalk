const Account_Schema = require('../model/account_model')

const logout = async (req, res) => {
    try {
        const _id = req._id
        await Account_Schema.findByIdAndUpdate(_id, { refreshToken: null })
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.status(200).json({ message: "Logged out successfully" })
    } catch {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = logout
