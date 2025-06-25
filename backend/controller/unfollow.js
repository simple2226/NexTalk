const { default: mongoose } = require('mongoose')
const Account_Schema = require('../model/account_model')
const __id = require('../config/__id')

const unfollow = async (req, res) => {
    try {
        const my_id = req._id
        const his_id = req.body._id
        const [my_response, his_response] = await Promise.all([
            Account_Schema.findByIdAndUpdate(
                my_id,
                [{
                    $set: {
                        following: { 
                            $cond: {
                                if: { $in: [__id(his_id), "$following"] },
                                then: { $filter: { input: "$following", as: "f", cond: { $ne: ["$$f", __id(his_id)] } } }, 
                                else: "$following"
                            }
                        },
                        num_following: {
                            $cond: {
                                if: { $in: [__id(his_id), "$following"] },
                                then: { $subtract: ["$num_following", 1] },
                                else: "$num_following"
                            }
                        }
                    }
                }],
                {new: true}
            ),
            Account_Schema.findByIdAndUpdate(
                his_id,
                [{
                    $set: {
                        followers: { 
                            $cond: {
                                if: { $in: [__id(my_id), "$followers"] },
                                then: { $filter: { input: "$followers", as: "f", cond: { $ne: ["$$f", __id(my_id)] } } }, 
                                else: "$followers"
                            }
                        },
                        num_followers: {
                            $cond: {
                                if: { $in: [__id(my_id), "$followers"] },
                                then: { $subtract: ["$num_followers", 1] },
                                else: "$num_followers"
                            }
                        }
                    }
                }],
                {new: true}
            ),
        ])
        res.status(200).json({
            his_followers: his_response.followers,
            his_num_followers: his_response.num_followers
        })
    } catch(err) {
        res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = unfollow