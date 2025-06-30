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
    console.log('connected')
/*1*/
    socket.on('register', async (my_id) => {
        if(!my_id) {
            console.error('didnt receive id (null)')
            return
        }
        const user = await account_model.findById(my_id)
        user.socketId = socket.id
        await user.save()
        const contacts = user.contacts.map(item => [my_id, item].sort())
        const requests = user.requests.map(item => [my_id, item].sort())
        const [Contacts, Requests] = await Promise.all([
            chat_model.aggregate([
                { $match: { between: { $in: contacts } } },
                { $project: { _id: 1, between: 1, userA: 1, userB: 1, lastMessage: { $arrayElemAt: ['$messages', -1] } } }
            ]),
            chat_model.aggregate([
                { $match: { between: { $in: requests } } },
                { $project: { _id: 1, between: 1, userA: 1, userB: 1, lastMessage: { $arrayElemAt: ['$messages', -1] } } }
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
    socket.on('request chat', async ({prev_chat_id, chat_id, my_id, user_id}) => {
        if (prev_chat_id) {
            const prevChat = await chat_model.findById(prev_chat_id)
            if(prevChat.userA.id === my_id)
                prevChat.userA.socketId = null
            else
                prevChat.userB.socketId = null
            await prevChat.save()
        }

        const chat = await chat_model.findById(chat_id, {})
        if(chat) {
            if(chat.userA.id === my_id) {
                chat.userA.checked = true
                chat.userA.socketId = socket.id.toString()
            } else {
                chat.userB.checked = true
                chat.userB.socketId = socket.id.toString()
            }
            await chat.save()
            const user = await account_model.findById(user_id, {requests: 0, socketId: 0, password: 0, refreshToken: 0})
            socket.emit('get chat', { user, chat })
        }


        const user = await account_model.findById(my_id)
        const contacts = user?.contacts.map(item => [my_id, item].sort())
        const requests = user?.requests.map(item => [my_id, item].sort())
        const userName = await account_model.findById(user_id).lean().username
        const retData = {
            category: contacts.includes(chat.between.sort()) ? 'Contacts' : 'Requests',
            data: {
                _id: chat._id,
                userA: chat.userA,
                userB: chat.userB,
                lastMessage: chat.messages.length ? chat.messages[chat.messages.length - 1] : null,
                name: userName,
                others_id: user_id
            }
        }

        socket.emit('receive read chat', retData)
    })

/*3*/
    socket.on('send message', async ({sender_id, receiver_id, chat_id, message}) => {
        const from = await account_model.findById(sender_id)
        const to = await account_model.findById(receiver_id)
        if(to) {

            const chat = await chat_model.findById(chat_id)
            chat.messages.push({
                sender: sender_id,
                text: message,
            })
            if(chat.userA._id === receiver_id) {
                chat.userA.checked = false
            } else {
                chat.userB.checked = false
            }
            chat.lastUpdated = Date.now()
            await chat.save()

            const from_chatList = await chat_model.find({_id: { $in: from.chats }}).lean()
            io.to(from.socketId).emit('receive message', {message: chat.messages[chat.messages.length - 1], chatList: from_chatList.map(item => {
                const {messages, ...rest} = item
                return {...rest, message: messages.length ? messages[messages.length - 1] : null}
            })})
            
            if(to.socketId) {
                const to_chatList = await chat_model.find({_id: { $in: to.chats }}).lean()
                io.to(to.socketId).emit('receive message', {message: chat.messages[chat.messages.length - 1], chatList: to_chatList.map(item => {
                    const {messages, ...rest} = item
                    return {...rest, message: messages.length ? messages[messages.length - 1] : null}
                })})
            }

        }
    })

    socket.on('message checked', async ({chat_id, receiver_id}) => {
        const chat = await chat_model.findById(chat_id)
        if(chat.userA._id === receiver_id) {
            chat.userA.checked = true
        } else {
            chat.userB.checked = true
        }
        await chat.save()
    })
    
/*4*/
    socket.on('disconnect', async () => {
        await account_model.findOneAndUpdate({ socketId: socket.id }, { socketId: null })
        await chat_model.updateMany(
            {
              $or: [
                { 'userA.socketId': socket.id },
                { 'userB.socketId': socket.id }
              ]
            },
            [{$set: {
                'userA.socketId': {
                    $cond: [{ $eq: ['$userA.socketId', socket.id] },
                                null, '$userA.socketId']
                },
                'userB.socketId': {
                    $cond: [{ $eq: ['$userB.socketId', socket.id] },
                                null, '$userB.socketId']
                }
            }}],
            { strict: false }
        );
    })
})


app.get('/api', (req, res) => {
    res.json({
        nothing: 'here'
    })
})

server.listen(PORT, () => console.log(`app listening on port ${PORT}`))