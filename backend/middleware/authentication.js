const Account_Schema = require('../model/account_model')
const generateAccessToken = require('../auth/generateAccessToken')
const generateRefreshToken = require('../auth/generateRefreshToken')
const cookieOptions = require('../auth/cookieOptions')
const { compareHashedPassword } = require('../auth/passwordEncryption')

const authentication = async (req, res, next) => {
    try {
        const { phoneNo, password } = req.body
        let generateTokens = req.body.generateTokens || false
        const userExists = await Account_Schema.findOne({
            phoneNo: phoneNo
        }, {_id: true, password: true})
        if(!userExists) {
            return res.status(404).json({message: "usename does not exist"})
        }
        const password_is_correct = await compareHashedPassword(password, userExists.password)
        if(!password_is_correct) {
            return res.status(401).json({message: "invalid password"})
        }

        if(generateTokens) {
            const [accessToken, refreshToken] = await Promise.all([
                generateAccessToken({_id: userExists._id}, {
                    expiresIn: '20s'
                }),
                generateRefreshToken({_id: userExists._id}, {
                    expiresIn: '7d'
                })
            ])
            await Account_Schema.findByIdAndUpdate(userExists._id, {refreshToken: refreshToken})

            res
               .cookie("accessToken", accessToken, cookieOptions)
               .cookie("refreshToken", refreshToken, cookieOptions)
        }

        req._id = userExists._id
        next()
    } catch(err) {
        res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = authentication