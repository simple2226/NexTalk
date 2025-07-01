import React, { useEffect } from 'react'
import { useState } from 'react'
import ChatArea from './ChatArea'
import ChatList from './ChatList'
import PersonDetails from './PersonDetails'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Authorise from './Authorise'
import { io } from 'socket.io-client'
import CloseIcon from './assets/CloseIcon'

export default function MainLayout() {
    const [verify, setVerify] = useState(0)
    const [data, setData] = useState(null)
    const [account, setAccount] = useState(null)
    const [addNewContact, setAddNewContact] = useState(false)
    const [newPhone, setNewPhone] = useState('')
    const [firstM, setFirstM] = useState('')
    const [chatInfo, setChatInfo] = useState({ chat_id: null, my_id: null, user_id: null })
    const [socket, setSocket] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const verify = async () => {
        try {
            const response = await axios.post('api/auth/verify', {}, {
                withCredentials: true
            })
            setAccount(response.data)
            setVerify(1)
        } catch (error) {
            navigate('/login')
        }
        }
        verify()
    }, [])
    
    useEffect(() => {
        if(verify === 0) return
        const socketInstance = io('http://localhost:3000', {
            transports: ['websocket'],
            withCredentials: true
        })
        setSocket(socketInstance)
        socketInstance.emit('register', account._id.toString())

        const requestChatList = (obj) => { setData(obj) }
        const receiveUpdatedChatList = (update) => {
            setData(prev => {
                if (!prev) return prev
                return {
                    Contacts: prev.Contacts.map(item => 
                        item._id === update._id ? {...item, ...update} : item
                    ),
                    Requests: prev.Requests.map(item => 
                        item._id === update._id ? {...item, ...update} : item
                    )
                }
            })
        }

        socketInstance.on('receive chatlist', requestChatList)
        socketInstance.on('receive updated chatList', receiveUpdatedChatList)
        
        return () => {
            socketInstance.off('receive chatlist', requestChatList)
            socketInstance.off('receive updated chatList', receiveUpdatedChatList)
            socketInstance.disconnect()
        }
    }, [verify])

    const addContact = async() => {
        try {
            const response = await axios.post('api/auth/addContact', {
                phoneNo: newPhone,
                firstMessage: firstM
            }, {
                withCredentials: true
            })
            setAddNewContact(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        verify == 0 ?
        <Authorise/>
        :
        <div className='relative h-full w-full'>
            <div className='flex'>
                <PersonDetails addNewContact={addNewContact} setAddNewContact={setAddNewContact}/>
                <ChatList data={data} account={account} setChatInfo={setChatInfo}/>
                <ChatArea account={account} chatInfo={chatInfo} socket={socket}/>
            </div>
            {addNewContact ?
                <div className='backdrop-blur-md absolute z-[999999] left-0 top-0 text-white h-full w-full flex items-center justify-center'>
                    <button onClick={(e) => {
                        e.preventDefault()
                        setAddNewContact(false)
                        setNewPhone('')
                        setFirstM('')
                    }} className='absolute left-5 top-5'><CloseIcon/></button>
                    <div className='transition bg-black ease-in-out duration-300 hover:shadow-[0_14px_20px_5px_#ffffffce] relative p-12 flex flex-col gap-5 border border-borders rounded-sm'>
                        <div className='absolute left-4 -top-7 text-[2rem] text-[#ffffffb0] bg-black italic'>Add a new Contact</div>
                        <div className='relative flex flex-col items-start gap-2'>
                            <div className='text-[1.1rem] text-[#ffffffd3]'>User's Phone Number</div>
                            <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type='text'/>
                        </div>
                        <div className='flex flex-col items-start gap-2'>
                            <div className='text-[1.1rem] text-[#ffffffd3]'>First message</div>
                            <input value={firstM} onChange={e => setFirstM(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="text"/>
                        </div>
                        <button onClick={() => addContact()} className='self-center hover:border-white active:border-borders border border-borders w-fit p-3'>Send Invitation</button>
                    </div>
                </div>
                :
                null
            }
        </div>
    )
}