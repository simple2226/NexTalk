const express = require('express')
const router = express.Router()
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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
const addContact = require('../controller/addContact');
const uploadPfp = require('../controller/uploadPfp');

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
router.put('/auth/update-account/:userId', authorisation, updateAccount)
router.post('/auth/uploadPfp', upload.single('image'), authorisation, uploadPfp)

module.exports = router