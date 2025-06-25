const cookieOptions = require('../auth/cookieOptions')
const generateAccessToken = require('../auth/generateAccessToken')
const generateRefreshToken = require('../auth/generateRefreshToken')
const Account_Schema = require('../model/account_model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authorisation = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken
        const refreshToken = req.cookies?.refreshToken
        
        if(!accessToken || !refreshToken) {
            return res.status(401).json({message: "Access or refresh token missing"})
        }

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decodedAccess) => {
            if(err) {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
                    if(err) {
                        return res.status(403).json({message: "Invalid or expired tokens"})
                    }
                    const user = await Account_Schema.findById(decodedRefresh._id)
                    if(!user || refreshToken !== user.refreshToken) {
                        res.clearCookie('accessToken')
                        res.clearCookie('refreshToken')
                        return res.status(403).json({message: "Invalid refresh token"})
                    }

                    const newRefreshToken = await generateRefreshToken({ _id: decodedRefresh._id }, {
                        expiresIn: '7d'
                    })
                    user.refreshToken = newRefreshToken
                    await user.save()
                    res.cookie("refreshToken", newRefreshToken, cookieOptions)

                    const newAccessToken = await generateAccessToken({_id: decodedRefresh._id}, {
                        expiresIn: '20s'
                    })
                    res.cookie("accessToken", newAccessToken, cookieOptions)
                    req._id = decodedRefresh._id
                    next()
                })
            } else {
                req._id = decodedAccess._id
                next()
            }
        })
    } catch {
        res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = authorisation