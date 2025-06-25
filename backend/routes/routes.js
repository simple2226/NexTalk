const express = require('express')
const router = express.Router()

// middlewares
const authentication = require('../middleware/authentication')
const authorisation = require('../middleware/authorisation')

// controllers
const getAccount = require('../controller/getAccount')
const addAccount = require('../controller/addAccount')
const updateAccount = require('../controller/updateAccount')
const login = require('../controller/login')
const unfollow = require('../controller/unfollow')
const logout = require('../controller/logout')
const searchAccounts = require('../controller/searchAccounts')
const addContact = require('../controller/addContact')
const getChat = require('../controller/getChat')

// {unauthorised / public}
router.post('/accounts/add', addAccount)
router.get('/accounts/:id', getAccount)
router.get('/accounts/search/:str', searchAccounts)


// {authorised / user-only}
router.post('/auth/login', authentication, login)
router.post('/auth/verify', authorisation, login)
router.post('/auth/logout', authorisation, logout)
router.post('/auth/unfollow', authorisation, unfollow)
router.post('/auth/addContact', authorisation, addContact)
router.post('/auth/chat', authorisation, getChat)
router.put('/auth/update-account/:userId', authorisation, updateAccount)

module.exports = router