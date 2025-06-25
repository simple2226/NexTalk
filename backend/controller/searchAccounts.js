const { default: mongoose } = require('mongoose')
const Account_Schema = require('../model/account_model')

const searchAccounts = async (req, res) => {
    const str = req.params.str

    const query = mongoose.Types.ObjectId.isValid(str)
    ? { _id: new mongoose.Types.ObjectId(str) }
    : { showName: { $regex: str, $options: 'i' } }

    try {
        const searchedAccounts = await Account_Schema.find(
            query, {_id: true, showName: true}
        )
        res.status(200).json(searchedAccounts)
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = searchAccounts