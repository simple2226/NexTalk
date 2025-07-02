const dbConnect = require('./config/database')
const cookieParser = require('cookie-parser')
const { createServer } = require('node:http')
const { Server } = require('socket.io')

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
app.use(cookieParser())
app.use(express.json({ limit: '16mb' }))
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: 'https://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

const Routes = require('./routes/routes')
app.use('/api', Routes)

dbConnect()

const server = createServer(app)
const io = new Server(server, {
    cors: {
        // origin: 'https://track-app-pi.vercel.app',
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
    transports: ['websocket']
})

const account_model = require('./model/account_model')
const chat_model = require('./model/chat_model')

io.on('connection', (socket) => {
/*1*/
    socket.on('register', async ({my_id, firstTime}) => {
        if(!my_id) {
            console.error('didnt receive id (null)')
            return
        }
        const user = await account_model.findById(my_id)
        const contacts = user.contacts.map(item => [my_id, item].sort())
        if (firstTime) {
            user.socketId = socket.id
            await user.save()
    
            const docs = await chat_model.find({ between: { $in: contacts } }, { userA: 1, userB: 1 })
            docs.forEach(doc => {
                if(doc.userA.id === my_id) {
                    if(doc.userB.socketId) io.to(doc.userB.socketId).emit('current status', 'Online')
                } else {
                    if(doc.userA.socketId) io.to(doc.userA.socketId).emit('current status', 'Online')
                }
            })
        }

        const requests = user.requests.map(item => [my_id, item].sort())
        const [Contacts, Requests] = await Promise.all([
            chat_model.aggregate([
                { $match: { between: { $in: contacts } } },
                { $project: { _id: 1, between: 1, userA: 1, userB: 1, lastUpdated: 1, lastMessage: { $ifNull: [ { $arrayElemAt: ['$messages', -1] }, null ] } } }
            ]),
            chat_model.aggregate([
                { $match: { between: { $in: requests } } },
                { $project: { _id: 1, between: 1, userA: 1, userB: 1, lastUpdated: 1, lastMessage: { $ifNull: [ { $arrayElemAt: ['$messages', -1] }, null ] } } }
            ])
        ])

        const notMyId = (c) => {if(c.between[0] !== my_id) {return c.between[0]} else {return c.between[1]}}
        const allIds = [
            ...new Set([...Contacts.map(c => notMyId(c)), ...Requests.map(c => notMyId(c))])
        ]
        const allAccounts = await account_model.find({ _id: { $in: allIds } }).lean()
        const idsToUsernames = {};
        allAccounts.forEach(acc => {
            idsToUsernames[acc._id.toString()] = acc.username
        })


        Contacts.forEach(async (chat) => {
            chat.name = idsToUsernames[notMyId(chat)] || 'Unknown'
            chat.others_id = notMyId(chat)
        })
        Requests.forEach(async (chat) => {
            chat.name = idsToUsernames[notMyId(chat)] || 'Unknown'
            chat.others_id = notMyId(chat)
        })



        io.to(user.socketId).emit('receive chatlist', { Contacts, Requests })
    })

/*2*/
    socket.on('request chat', async ({ prev_chat_id, chat_id, my_id, user_id, request }) => {
        let UTU
        if (prev_chat_id) {
            const prevChat = await chat_model.findById(prev_chat_id)

            UTU = prevChat.userA.id === my_id ? ['userA', 'userB'] : ['userB', 'userA']
            prevChat[UTU[0]].socketId = null
            if(prevChat[UTU[1]].socketId) io.to(prevChat[UTU[1]].socketId).emit('in the chat?', false)

            await prevChat.save()
        }

        const chat = await chat_model.findById(chat_id, {})
        if(chat) {
            UTU = chat.userA.id === my_id ? ['userA', 'userB'] : ['userB', 'userA']
            chat[UTU[0]].checked = true
            chat[UTU[0]].numNotRead = 0
            chat[UTU[0]].socketId = socket.id.toString()
            if(chat[UTU[1]].socketId) {
                io.to(chat[UTU[1]].socketId).emit('in the chat?', true)
                socket.emit('in the chat?', true)
            }
            
            const seenTheMessages = new Set()
            for(let i = chat.messages.length - 1; i >= 0 && chat.messages[i].sender === user_id && chat.messages[i].seen === false; i--) {
                chat.messages[i].seen = true
                seenTheMessages.add(chat.messages[i]._id.toString())
                // console.log(chat.messages[i]._id.toString())
            }

            await chat.save()
            const other_user = await account_model.findById(user_id, {requests: 0, password: 0, refreshToken: 0})
            if(other_user.socketId) socket.emit('current status', 'Online')
            socket.emit('get chat', { user: other_user, chat, request })

            UTU = chat.userA.id === my_id ? 'userB' : 'userA'
            if(chat[UTU].socketId) io.to(chat[UTU].socketId).emit('seen?', [...seenTheMessages])
        }
        
        const userName = await account_model.findById(user_id).lean().username
        const retData = {
            _id: chat._id,
            userA: chat.userA,
            userB: chat.userB,
            lastMessage: chat.messages.length ? chat.messages[chat.messages.length - 1] : null,
            name: userName,
            lastUpdated: chat.lastUpdated,
            others_id: user_id
        }

        socket.emit('receive updated chatList', retData)
    })

/*3*/
    socket.on('send message', async ({sender_id, receiver_id, chat_id, message}) => {
        const from = await account_model.findById(sender_id)
        const to = await account_model.findById(receiver_id)
        let UTU
        if(to) {
            const chat = await chat_model.findById(chat_id)

            UTU = chat.userA.id === receiver_id ? 'userA' : 'userB'
            if(!chat[UTU].socketId) {
                chat[UTU].checked = false
                chat[UTU].numNotRead += 1
            }

            const seen = chat[UTU].socketId ? true : false
            chat.messages.push({
                doc_id: chat._id,
                sender: sender_id,
                message: message,
                seen: seen
            })

            chat.lastUpdated = Date.now()

            await chat.save()
 
            socket.emit('receive updated chatList', {
                _id: chat_id,
                userA: chat.userA,
                userB: chat.userB,
                lastMessage: chat.messages.length ? chat.messages[chat.messages.length - 1] : null,
                name: to.username,
                lastUpdated: chat.lastUpdated,
                others_id: receiver_id
            })

            if(to.socketId) {
                io.to(to.socketId).emit('receive updated chatList', {
                    _id: chat_id,
                    userA: chat.userA,
                    userB: chat.userB,
                    lastMessage: chat.messages.length ? chat.messages[chat.messages.length - 1] : null,
                    name: from.username,
                    lastUpdated: chat.lastUpdated,
                    others_id: sender_id
                })
            }
            
            socket.emit('receive message', chat.messages[chat.messages.length - 1])

            UTU = chat.userA.id === receiver_id ? 'userA' : 'userB'
            if(chat[UTU].socketId)
                io.to(chat[UTU].socketId).emit('receive message', chat.messages[chat.messages.length - 1])
        }
    })

    socket.on('send invite', async ({my_id, phoneNo, firstMessage}) => {
        const myAccount = await account_model.findById(my_id)
        const hisAccount = await account_model.findOne({ phoneNo: phoneNo })
        if(!hisAccount) {
            socket.emit('invitation error', [404, 'User not found'])
            return
        }
        const myAccountId = myAccount._id.toString()
        const hisAccountId = hisAccount._id.toString()
        if(myAccount.contacts.includes(hisAccountId)) {
            socket.emit('invitation error', [409, 'User already added'])
            return
        }
        else if(myAccount.requests.includes(hisAccountId)) {
            myAccount.requests = myAccount.requests.filter(_id => _id !== hisAccountId)
            myAccount.contacts.push(hisAccountId)
            const chat = await chat_model.findOne({
                between: [myAccountId, hisAccountId].sort()
            })
            if(firstMessage !== null) {
                chat.messages.push({
                    doc_id: chat._id,
                    sender: myAccountId,
                    message: firstMessage
                })
                if(chat.userA.id === hisAccountId) {if(!chat.userA.socketId) chat.userA.numNotRead = 1}
                else {if(!chat.userB.socketId) chat.userB.numNotRead = 1}
            }
            await myAccount.save()
            await chat.save()
            socket.emit('repopualate chatList', null)
            if(firstMessage !== null) if(hisAccount.socketId) io.to(hisAccount.socketId).emit('repopualate chatList', null)
        }
        else {
            const between = [myAccountId, hisAccountId].sort()
            const response = await chat_model.create({
                between: between,
                userA: {
                    id: myAccountId
                },
                userB: {
                    id: hisAccountId,
                    numNotRead: 1
                },
                messages: [{
                    doc_id: 'a',
                    sender: myAccountId,
                    message: firstMessage
                }]
            })
            if(response) {
                response.messages[0].doc_id = response._id.toString()
                await response.save()
                myAccount.contacts.push(hisAccountId)
                hisAccount.requests.push(myAccountId)
                await myAccount.save()
                await hisAccount.save()
                socket.emit('repopualate chatList', null)
                if(hisAccount.socketId) io.to(hisAccount.socketId).emit('repopualate chatList', null)
            } else {
                socket.emit('invitation error', [500, 'Failed. Check your connection'])
            }
        }
    })
    
/*4*/
    socket.on('disconnect', async () => {
        const user = await account_model.findOne({ socketId: socket.id })
        if(user) {
            user.socketId = null
            await user.save()

            const contacts = user.contacts.map(item => [user._id.toString(), item].sort())
            const docs = await chat_model.find({ between: { $in: contacts } }, { userA: 1, userB: 1 })
            docs.forEach(doc => {
                if(doc.userA.id === user._id.toString()) {
                    if(doc.userB.socketId) io.to(doc.userB.socketId).emit('current status', 'Offline')
                } else {
                    if(doc.userA.socketId) io.to(doc.userA.socketId).emit('current status', 'Offline')
                }
            })
        }

        const anyLastOpenedChat = await chat_model.findOne(
            {$or: [
                { 'userA.socketId': socket.id },
                { 'userB.socketId': socket.id }
            ]}
        )

        if(anyLastOpenedChat) {
            if(anyLastOpenedChat.userA.socketId === socket.id) {
                anyLastOpenedChat.userA.socketId = null
                if(anyLastOpenedChat.userB.socketId)
                    io.to(anyLastOpenedChat.userB.socketId).emit('in the chat?', false)
            } else {
                anyLastOpenedChat.userB.socketId = null
                if(anyLastOpenedChat.userA.socketId)
                    io.to(anyLastOpenedChat.userA.socketId).emit('in the chat?', false)
            }
            await anyLastOpenedChat.save()
        }

    })
})


app.get('/api', (req, res) => {
    res.json({
        nothing: 'here'
    })
})

server.listen(PORT, () => console.log(`app listening on port ${PORT}`))