const bcrypt = require('bcrypt')

const hashPassword = async (plainPassword) => {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
    return hashedPassword
}

const compareHashedPassword = async (plainPassword, hashedPassword) => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}

module.exports = { hashPassword, compareHashedPassword }