import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import ChatArea from './ChatArea'
import ChatList from './ChatList'
import PersonDetails from './PersonDetails'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Authorise from './Authorise'
import { io } from 'socket.io-client'
import CloseIcon from './assets/CloseIcon'
import LoadingChats from './LoadingChats'
import { motion } from "framer-motion"
import VideoChatIcon from './assets/VideoChatIcon'
import MicIcon from './assets/MicIcon'
import HangUpIcon from './assets/HangUpIcon'

export default function MainLayout() {
    const [verify, setVerify] = useState(0)
    const [dataFetched, setDataFetched] = useState(0)
    const [data, setData] = useState(null)
    const [account, setAccount] = useState(null)
    const [addNewContact, setAddNewContact] = useState(false)
    const [newPhone, setNewPhone] = useState('')
    const [firstM, setFirstM] = useState('')
    const [invErr, setInvErr] = useState(null)
    const [settings, setSettings] = useState(false)
    const fileRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [file, setFile] = useState(null)
    const [chatInfo, setChatInfo] = useState({ chat_id: null, my_id: null, user_id: null })
    const [socket, setSocket] = useState(null)
    const navigate = useNavigate()
    const AppRef = useRef(null)
    const [isOnCall, setIsOnCall] = useState(false)
    const [hasRemoteStream, setHasRemoteStream] = useState(false)
    const [dateNow, setDateNow] = useState(Date.now())

    const peerConnectionRef = useRef(null)
    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const callTimeoutRef = useRef(null)
    const userCallArgs = useRef(null)
    const callerName = useRef(null)
    const [localCamOn, setLocalCamOn] = useState(true)
    const [localMicOn, setLocalMicOn] = useState(true)
    const [remoteCamOn, setRemoteCamOn] = useState(true)
    const [remoteMicOn, setRemoteMicOn] = useState(true)

    const uploadPfp = async () => {
        try {
            if (!file) {
                alert('Please select a file and enter a name');
                return;
            }
            setUploading(true)
            const formData = new FormData();
            formData.append('image', file);
            formData.append('name', account._id);
            await axios.post('api/auth/uploadPfp', formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
        } catch(err) {
            console.error(err)
        } finally {
            setUploading(false)
            setFile(null)
            setSettings(false)
        }
    }

    const toggleMic = () => {
        if(!hasRemoteStream || localVideoRef.current === null) return;
        const audioTrack = localVideoRef.current.srcObject?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setLocalMicOn(audioTrack.enabled);
            socket.emit('webrtc-toggle-mic', {my_id: account._id, user_id: userCallArgs.current.user_id, audio: audioTrack.enabled})
        }
    };
    
    const toggleCam = () => {
        if(!hasRemoteStream || localVideoRef.current === null) return;
        const videoTrack = localVideoRef.current.srcObject?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setLocalCamOn(videoTrack.enabled);
            socket.emit('webrtc-toggle-cam', {my_id: account._id, user_id: userCallArgs.current.user_id, video: videoTrack.enabled})
        }
    };

    useEffect(() => {
        if(!socket) return;
        const handleBeforeUnload = () => {
            if (peerConnectionRef.current) {
                socket.emit('webrtc-hangup', {my_id: account._id, ...userCallArgs.current});
            }
            socket.off()
            setTimeout(() => {
                socket.disconnect();
            }, 100);
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [socket]);

    useEffect(() => {
        if(remoteVideoRef.current) remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current.play().catch(console.error);
        }
    }, [remoteVideoRef.current])

    useEffect(() => {
        window.remoteRef = remoteVideoRef;
    }, []);

    useEffect(() => {
        document.title = 'NexTalk'
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
        const socketInstance = io('https://nextalk-production.up.railway.app', {
            transports: ['websocket'],
            withCredentials: true
        })
        setSocket(socketInstance)
        socketInstance.emit('register', { my_id: account._id.toString(), firstTime: true })

        const receiveChatList = (obj) => { setData(obj) }
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
        const callRegister = () => socketInstance.emit('register', { my_id: account._id.toString(), firstTime: false })
        const catchInvErr = (err) => setInvErr(err)

        socketInstance.on('receive chatlist', receiveChatList)
        socketInstance.on('receive updated chatList', receiveUpdatedChatList)
        socketInstance.on('repopualate chatList', callRegister)
        socketInstance.on('invitation error', catchInvErr)

        socketInstance.on('webrtc-toggle-mic', ({ user_id, audio }) => {
            if(userCallArgs.current && userCallArgs.current.user_id === user_id)
                setRemoteMicOn(audio)
        })
        socketInstance.on('webrtc-toggle-cam', ({ user_id, video }) => {
            if(userCallArgs.current && userCallArgs.current.user_id === user_id)
                setRemoteCamOn(video)
        })
    }, [verify])

    useEffect(() => {
        if(data) setDataFetched(1)
        setAddNewContact(false)
    }, [data])

    useEffect(() => {
        setInvErr(null)
    }, [newPhone, firstM])

    useEffect(() => {
        setAddNewContact(false)
        setNewPhone('')
        setFirstM('')
    }, [data])

    const isValidIndianPhoneNumber = (input) => {
        const digitsOnly = input.replace(/\s+/g, '')
        const regex = /^[6-9]\d{9}$/
        return regex.test(digitsOnly);
    }

    return (
        verify == 0 ?
        <Authorise/>
        :
        (dataFetched == 0 ?
            <LoadingChats/>
            :
            <div ref={AppRef} className='animate-outToIn relative h-full w-full'>
                <div className='flex'>
                    <PersonDetails
                        account={account}
                        setAddNewContact={setAddNewContact}
                        setSettings={setSettings}
                        dateNow={dateNow}
                    />

                    <ChatList
                        data={data}
                        account={account}
                        setChatInfo={setChatInfo}
                        dataNow={dateNow}
                    />

                    <ChatArea
                        connectionVars={{
                            peerConnectionRef,
                            localVideoRef,
                            remoteVideoRef,
                            callTimeoutRef,
                            userCallArgs,
                            callerName,
                            setLocalMicOn,
                            setRemoteMicOn,
                            setLocalCamOn,
                            setRemoteCamOn,
                            setHasRemoteStream,
                        }}
                        isOnCall={isOnCall}
                        setIsOnCall={setIsOnCall}
                        account={account}
                        chatInfo={chatInfo}
                        socket={socket}
                        dataNow={dateNow}
                    />
                </div>
                {addNewContact ?
                    <div className='animate-showUp bg-black backdrop-blur-md absolute z-[999999] left-0 top-0 text-white h-full w-full flex items-center justify-center'>
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
                                <div className='text-[.7rem] text-red-500'>{(() => {
                                    if(newPhone.length && !isValidIndianPhoneNumber(newPhone)) return 'Invalid Phone number'
                                    if(invErr) {
                                        if(invErr[0] === 1 || invErr[0] === 2 || invErr[0] === 404 || invErr[0] === 409) return invErr[1]
                                    }
                                })()}</div>
                            </div>
                            <div className='flex flex-col items-start gap-2'>
                                <div className='text-[1.1rem] text-[#ffffffd3]'>First message</div>
                                <input value={firstM} onChange={e => setFirstM(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="text"/>
                                <div className='text-[.7rem] text-red-500'>{(() => {
                                    if(invErr) {
                                        if(invErr[0] === 3) return invErr[1]
                                    }
                                })()}</div>
                            </div>
                            <button onClick={() => {
                                if(!isValidIndianPhoneNumber(newPhone)) {
                                    setInvErr([1, 'Invalid Phone number'])
                                    return
                                }
                                if(newPhone.replace(/\s+/g, '') === account.phoneNo) {
                                    setInvErr([2, 'You want to talk to yourself? Wierd'])
                                    return
                                }
                                if(!firstM.trim().length) {
                                    setInvErr([3, 'This field cannot be empty'])
                                    return
                                }
                                socket.emit('send invite', { my_id: account._id.toString(), phoneNo: newPhone.replace(/\s+/g, ''), firstMessage: firstM.trim() })
                            }} className='flex self-center hover:border-white active:border-borders border border-borders w-fit p-3 relative'>
                            Send Invitation
                            <div className='left-0 absolute w-full -bottom-6 text-[.7rem] text-red-500'>{(() => {
                                if(invErr) {
                                    if(invErr[0] === 500) return invErr[1]
                                }
                            })()}</div></button>
                        </div>
                    </div>
                    :
                    null
                }

                {settings ?
                    <div className='animate-showUp bg-black backdrop-blur-md absolute z-[999999] left-0 top-0 text-white h-full w-full flex items-center justify-center'>
                        <button onClick={(e) => {
                            if(uploading) return
                            e.preventDefault()
                            setSettings(false)
                            setFile(null)
                        }} className='absolute left-5 top-5'><CloseIcon/></button>
                        <div className='transition bg-black ease-in-out duration-300 hover:shadow-[0_14px_20px_5px_#ffffffce] relative p-18 flex flex-col items-center gap-2 border border-borders rounded-sm'>
                            <div className='absolute left-4 -top-7 text-[2rem] text-[#ffffffb0] bg-black italic'>Settings</div>
                            <button onClick={() => {
                                fileRef.current.click();
                            }} className='max-w-[264.31px] break-all text-[1.2rem] text-white/70 rounded-sm px-5 py-2 hover:bg-white/10'>
                                {file ? file.name : 'Change you Profile Picture'}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.bmp"
                                    onChange={e => {
                                        const file = e.target.files[0]
                                        if(file) setFile(file)
                                    }}
                                    className='hidden'
                                />
                            </button>
                            {file?<button onClick={() => uploadPfp()} className='transition duration-100 ease-linear px-3 p-1 hover:text-[#3797F0] w-fit text-[.9rem]'>Upload This as new pfp?</button>:<></>}
                            {uploading?<div className='w-[3rem] border-t animate-ping'></div>:<></>}
                        </div>
                    </div>
                    :
                    null
                }

                <div className={`animate-showUp flex flex-col ${!isOnCall ? 'hidden' : ''} z-[9999999999] absolute top-0 left-0 h-[100vh] w-[100vw] rounded-4xl`}
                    style={{
                        backgroundImage: 'radial-gradient(circle, #5d5c6e, #575668, #515062, #4c4b5c, #464556, #424151, #3d3c4b, #393846, #343340, #302f3a, #2b2a35, #27262f)'
                    }}
                >
                    {!remoteMicOn ?
                        <div className='absolute top-[30px] right-[30px]'>
                            <div className='flex items-center justify-center relative rounded-full px-1'>
                                <div className='rotate-45 self-center left-[calc(54%-2px)] absolute h-[80%] w-[2px] rounded-full bg-white'></div>
                                <MicIcon/>
                            </div>
                        </div>
                        :
                        <></>
                    }
                    <motion.div
                        className='bg-[#1f1e1a] rounded-xl'
                        drag
                        dragConstraints={AppRef}
                        style={{
                            zIndex: 99999999,
                            width: 300,
                            height: 150,
                            position: "absolute",
                            bottom: '30px',
                            right: '30px',
                        }}
                    >
                        <video className='h-full w-full rounded-xl' ref={localVideoRef} autoPlay playsInline></video>
                    </motion.div>
                    <div className={`${hasRemoteStream && remoteCamOn ? 'hidden' : ''} h-full py-10 flex flex-col items-center justify-between`}>
                        <div className='flex flex-col text-[#ffffffe0]'>
                            <div className='text-[3rem] font-semibold'>{callerName.current}</div>
                            <div className='font-[100]'>{!hasRemoteStream ? 'Calling...' : 'Connected'}</div>
                        </div>
                    </div>
                    <video className={`bg-black ${!hasRemoteStream || !remoteCamOn ? 'hidden' : ''} h-full w-full`} ref={remoteVideoRef} autoPlay playsInline></video>
                    <div className='absolute self-center bottom-10 flex gap-10 px-10 py-4 rounded-full text-white w-fit bg-[#0000006e]'>
                        <button onClick={() => toggleCam()} className={`flex relative rounded-full p-3 ${!hasRemoteStream ? 'opacity-50' : 'hover:bg-[#ffffff2a]'}`}>
                            {!localCamOn ? <div className='rotate-45 self-center left-[calc(54%-2px)] absolute h-[80%] w-[2px] rounded-full bg-white'></div> : <></>}
                            <VideoChatIcon/>
                        </button>
                        <button onClick={() => toggleMic()} className={`flex items-center justify-center relative rounded-full px-1 ${!hasRemoteStream ? 'opacity-50' : 'hover:bg-[#ffffff2a]'}`}>
                            {!localMicOn ? <div className='rotate-45 self-center left-[calc(54%-2px)] absolute h-[80%] w-[2px] rounded-full bg-white'></div> : <></>}
                            <MicIcon/>
                        </button>
                        <button className={`${!isOnCall ? 'opacity-50' : ''} rounded-full p-3 bg-red-500`}
                            onClick={() => {
                                if(!userCallArgs.current || !userCallArgs.current.message_id) return
                                socket.emit('webrtc-hangup', {my_id: account._id, ...userCallArgs.current})
                            }}
                        >
                            <HangUpIcon/>
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}