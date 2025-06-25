const Account_Schema = require('../model/account_model')

const getAccount = async (req, res) => {
    try {
        const id = req.params.id
        const response = await Account_Schema.findById(id, {
            password: false,
            matches_history: false,
            presets: false,
            __v: false,
            refreshToken: false
        })
        if(response) {
            res.status(200).json(response)
        } else {
            res.status(404).json(response)
        }
    } catch(err) {
        res.status(500).send(null)
    }
}

module.exports = getAccount