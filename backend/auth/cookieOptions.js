const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}


module.exports = cookieOptions