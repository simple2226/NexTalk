import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { EmojiButton } from '@joeattardi/emoji-button'
import EmojiBtn from './assets/EmojiBtn'
import VoiceChatIcon from './assets/VoiceChatIcon'
import VideoChatIcon from './assets/VideoChatIcon'
import UserInfoIcon from './assets/UserInfoIcon'
import CloseIcon from './assets/CloseIcon'
import Pfp from './assets/Pfp'
import Calendar from './assets/Calendar'
import Mutuals from './assets/Mutuals'
import CopyIcon from './assets/CopyIcon'
import ReplyIcon from './assets/ReplyIcon'
import DeleteIcon from './assets/DeleteIcon'
import ChatIcon from './assets/ChatIcon'
import NotAllowed from './assets/NotAllowed'

export default function ChatArea({ connectionVars, isOnCall, setIsOnCall, account, chatInfo, socket }) {
    const [data, setData] = useState(null)
    const dataRef = useRef(null)
    const [status, setStatus] = useState('Offline')
    const [inTheChat, setInTheChat] = useState(false)
    const [input, setInput] = useState('')
    const [selecteds, setSelecteds] = useState([])
    const [deleteMessagesPopup, setDeleteMessagesPopup] = useState(false)
    const [openInfo, setOpenInfo] = useState(false)
    const [arr, setArr] = useState([])
    const [isRequested, setIsRequested] = useState(false)
    const inputRef = useRef(null)
    const buttonRef = useRef(null)
    const pickerRef = useRef(null)
    const chatAreaRef = useRef(null)

    const {
        peerConnectionRef,
        localVideoRef,
        remoteVideoRef,
        callTimeoutRef,
        hangupArgs,
        callerName,
        setHasRemoteStream
    } = connectionVars

    const iceConfig = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
    };
    
    useEffect(() => {
        if(!socket) return
        const socketInstance = socket
        const getChat = (data) => {
            setData(data)
            setIsRequested(data.request)
        }
        const inTheChatfunc = (inTheChat) => { setInTheChat(inTheChat) }
        const updateMessages = ({ids, update}) => {
            const s = new Set(ids)
            setArr(prev => {
                const newArr = [...prev]
                for(let i = newArr.length - 1; i >= 0 && s.size > 0; i--) {
                    if(s.has(newArr[i]._id)) {
                        newArr[i] = { ...newArr[i], ...update }
                        s.delete(newArr[i]._id)
                    }
                }
                return newArr
            })
        }
        const currentStatus = (status) => { setStatus(status) }
        const receiveMessage = (message) => {
            if(dataRef.current && message.doc_id === dataRef.current.chat._id) {
                if(message.sender === account._id && message.isCall.isIt) {
                    callTimeoutRef.current = setTimeout(() => {
                        cleanupConnection();
                        socket.emit('webrtc-missed', { user_id: dataRef.current.user._id, chat_id: dataRef.current.chat._id, message_id: message._id })
                    }, 30000);
                    hangupArgs.current = {...hangupArgs.current, message_id: message._id}
                }
                setArr(prev => [...prev, message])
            }
        }
        socketInstance.on('get chat', getChat)
        socketInstance.on('in the chat?', inTheChatfunc)
        socketInstance.on('update messages', updateMessages)
        socketInstance.on('current status', currentStatus)
        socketInstance.on('receive message', receiveMessage)
        
        socketInstance.on("webrtc-ice-candidate", async ({ candidate }) => {
            const pc = peerConnectionRef.current;
            if (!pc.remoteDescription || pc.remoteDescription.type === "") { // Remote description not set yet – queue the candidate
                return
            } else {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding received ice candidate", err);
                }
            }
        });

        socketInstance.on("webrtc-answer", async ({ answer }) => {
            clearTimeout(callTimeoutRef.current);
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
            }
        });

        socketInstance.on("webrtc-rejected", async () => {
            cleanupConnection()
        })

        socketInstance.on('webrtc-hangup', async () => {
            cleanupConnection()
        })
    }, [socket])

    const cleanupConnection = () => {
        clearTimeout(callTimeoutRef.current);
        setIsOnCall(false)

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
    
        if (remoteVideoRef.current?.srcObject) {
            remoteVideoRef.current.srcObject = null;
        }
        setHasRemoteStream(false)
    };

    const startCall = async () => {
        setIsOnCall(true)
        const peerConnection = new RTCPeerConnection(iceConfig);
        peerConnectionRef.current = peerConnection;

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        const iceCandidates = []
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) iceCandidates.push(event.candidate)
        }
    
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if(remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                setHasRemoteStream(true)
            }
        };

        await peerConnection.setLocalDescription(await peerConnection.createOffer());
        
        // ✅ Wait for ICE gathering to complete
        await new Promise(resolve => {
            const checkIce = () => {
                if (peerConnection.iceGatheringState === 'complete') {
                    resolve()
                } else {
                    setTimeout(checkIce, 100)
                }
            }
            checkIce()
        })

        return {
            offer: peerConnection.localDescription,
            iceCandidates
        }
    }

    const answerCall = async (message_id, offer) => {
        setIsOnCall(true)

        const peerConnection = new RTCPeerConnection(iceConfig);
        peerConnectionRef.current = peerConnection;

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });
        
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc-ice-candidate', {
                  user_id: data.user._id,
                  candidate: event.candidate,
                });
            }
        };

        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if(remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                setHasRemoteStream(true)
            }
        };

        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer.offer)
        );

        // ✅ Loop through and add each ICE candidate individually
        for (const candidate of offer.iceCandidates) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding ICE candidate", err);
            }
        }

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);


        socket.emit("webrtc-answer", {
            user_id: data.user._id,
            answer,
            chat_id: data.chat._id,
            message_id
        })
    }
    
    useEffect(() => {
        if(!data) return
        hangupArgs.current = { user_id: data.user._id, chat_id: data.chat._id }
        dataRef.current = data
        setArr(data.chat.messages.filter(item => !item.deletedForOne.includes(account._id)).map(item => { return { ...item, selected: false } }))
    }, [data])


    useEffect(() => {
        setOpenInfo(false)
        setInput('')
        setSelecteds([])
        setArr([])
        setData(null)
        setInTheChat(false)
        setStatus('Offline')
        setIsRequested(false)
        setDeleteMessagesPopup(false)

        if(socket && chatInfo.chat_id && chatInfo.my_id && chatInfo.user_id)
            socket.emit('request chat', { prev_chat_id: data ? data.chat._id : null, ...chatInfo })
    }, [chatInfo])

    useEffect(() => {
        if(!chatInfo.chat_id && !chatInfo.my_id && !chatInfo.user_id) return
        const picker = new EmojiButton({
            autoHide: false,
            showPreview: false,
            showRecents: true,
        });
        pickerRef.current = picker
        picker.on('emoji', emoji => {
            setInput(prev => prev + emoji.emoji)
        })
        const togglePicker = () => {
            picker.togglePicker(buttonRef.current)
        }
        const button = buttonRef.current
        button?.addEventListener('click', togglePicker)

        const input = inputRef.current
        const autoType = (e) => {
            const active = document.activeElement

            if (
                active?.tagName === 'INPUT' ||
                active?.tagName === 'TEXTAREA' ||
                active?.isContentEditable
            ) return

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key.length === 1 && !e.key.match(/\s/)) {
                input?.focus()
                if (input?.value === "") {
                    e.preventDefault()
                    setInput(e.key)
                }
            }
        }
        document.addEventListener("keydown", autoType)

        return () => {
            button?.removeEventListener('click', togglePicker)
            document.addEventListener("keydown", autoType)
        }
    }, [inputRef.current, buttonRef.current, pickerRef.current])
    
    useLayoutEffect(() => {
        if(chatAreaRef.current) {
            chatAreaRef.current.scrollTo({
                top: chatAreaRef.current.scrollHeight,
            })
        }
    }, [chatAreaRef.current])
    
    useEffect(() => {
        if(!chatAreaRef.current) return
        chatAreaRef.current.scrollTo({
            top: chatAreaRef.current.scrollHeight,
            behavior: 'smooth'
        })
    }, [arr.length, chatAreaRef.current])

    return ((chatInfo.chat_id && chatInfo.my_id && chatInfo.user_id) ? (
        data ?
        <div className={`animate-showUp relative flex flex-col h-[100vh] w-[calc(100vw-397px)] min-w-[277px]`}>
            <div className={`${selecteds.length ? 'bg-[#ffffff11]' : ''} px-4 flex justify-between items-center w-full min-h-[75px] border-b border-borders`}>
                {!selecteds.length ? (
                    <><div className='gap-4 flex items-center'>
                        <Pfp size='45px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                        <div className='flex-col items-start'>
                            <div className='text-white text-[1.2rem] font-semibold'>{data.user.username}</div>
                            {!isRequested ?
                                <div className={`text-start transition ease-linear duration-200 ${inTheChat ? 'opacity-100' : 'size-0 opacity-0'} text-[.7rem] text-[#ffffffb6] text-nowrap`}>Currently in the chat</div>
                                :
                                <></>
                            }
                        </div>
                    </div>
                    <div className='flex gap-4 items center justify-self-end'>
                        {!isRequested ?
                        <>
                        <button className='active:opacity-55 cursor-pointer'><VoiceChatIcon size='24'/></button>
                        <button onClick={async () => {
                            if(isOnCall) return
                            callerName.current = data.user.username
                            const callOffer = await startCall()
                            socket.emit('send message', {sender_id: account._id, receiver_id: chatInfo.user_id, chat_id: data.chat._id, callOffer, message: input.trim()})
                        }} className={`${isOnCall ? 'opacity-55' : 'active:opacity-55'} cursor-pointer`}><VideoChatIcon/></button>
                        <button onClick={() => setOpenInfo(true)} className='active:opacity-55 cursor-pointer'><UserInfoIcon/></button>
                        </>
                            :
                        <></>
                        }
                    </div></>)
                    :
                    (<><div>
                        <button onClick={() => {
                            setSelecteds([])
                            setArr(prev => prev.map(e => { return { ...e, selected: false } }))
                        }} className='active:opacity-55'><CloseIcon/></button>
                    </div>
                    <div className='flex gap-4 items center justify-self-end'>
                        {selecteds.length == 1 ? <>
                        <button className='active:opacity-55'><ReplyIcon/></button>
                        <button className='active:opacity-55'><CopyIcon/></button>
                        </> : <></>}
                        <button onClick={() => setDeleteMessagesPopup(true)} className='active:opacity-55'><DeleteIcon/></button>
                    </div></>)
                }
            </div>

            <div ref={chatAreaRef} className='relative overflow-x-hidden pt-3 flex flex-col gap-2 overflow-y-auto w-full h-full'>
                {arr.map((item, index) => (
                    <div onClick={() => {
                        if(selecteds.length) {
                            if(!item.selected) {
                                setSelecteds(prev => [...prev, {message_id: item._id, sender: item.sender, deletedForBoth: item.deletedForBoth}])
                                setArr(prev => {
                                    const newArr = [...prev]
                                    newArr[index] = {...newArr[index], selected: true}
                                    return newArr
                                })
                            } else {
                                setSelecteds(prev => prev.filter(e => e.message_id !== item._id))
                                setArr(prev => {
                                    const newArr = [...prev]
                                    newArr[index] = {...newArr[index], selected: false}
                                    return newArr
                                })
                            }
                        }
                    }} key={index} className={`px-5 py-2 ${selecteds.length ? 'cursor-pointer' : ''} ${item.selected ? 'bg-[#ffffff2d]' : ''} w-full group relative flex flex-col ${item.sender !== account._id ? 'items-start self-start' : 'items-end self-end'}`}>
                        <h1 style={{
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                        }} className={`flex items-center relative font-[100] px-4 p-3 text-left text-[.8rem] max-w-[350px] bg-[#3797F0] text-white rounded-2xl ${item.sender !== account._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                            <button onClick={() => {
                                setSelecteds(prev => [...prev, {message_id: item._id, sender: item.sender, deletedForBoth: item.deletedForBoth}])
                                setArr(prev => {
                                    const newArr = [...prev]
                                    newArr[index] = {...newArr[index], selected: true}
                                    return newArr
                                })
                            }} className={`hidden ${selecteds.length ? '' : 'group-hover:block'} absolute ${item.sender !== account._id ? '-right-10' : '-left-[2.3rem]'} text-[.8rem] font-normal text-[#ffffff7a] hover:text-white`}>More</button>
                            {!item.isCall.isIt || item.deletedForBoth ?
                                <div className={`${item.deletedForBoth ? 'italic' : ''}`}>
                                    {item.deletedForBoth ?
                                        <div className='flex items-center'><NotAllowed size='10px' color='#ffffff'/> this message is deleted</div>
                                        :
                                        item.message
                                    }
                                </div>
                                :
                                <div className='flex flex-col gap-1 items-start'>
                                    <div className='text-[.9rem] font-[400]'>{item.isCall.typeOfCall} Call : <b>Invite Sent</b></div>
                                    {item.isCall.status === null ?
                                        (item.isCall.caller !== account._id ?
                                        <div className='p-2 flex justify-center gap-2 rounded-md bg-[#286aa8]'>
                                            <button
                                                className='px-3 py-1 rounded-sm text-[.9rem] bg-[#ffffff3b]'
                                                onClick={() => {
                                                    if(isOnCall) return
                                                    hangupArgs.current = {...hangupArgs.current, message_id: item._id}
                                                    answerCall(item._id, item.isCall.callOffer)
                                                }}
                                            >Answer</button>
                                            <button
                                                className='px-3 py-1 rounded-sm text-[.9rem] bg-[#ff000057]'
                                                onClick={() => {
                                                    if(isOnCall) return
                                                    socket.emit('webrtc-rejected', { user_id: data.user._id, chat_id: data.chat._id, message_id: item._id })
                                                }}
                                            >Decline</button>
                                        </div>
                                        :
                                        <></>
                                        )
                                        :
                                        <div className='p-2 flex justify-center gap-2 rounded-md bg-[#286aa8]'>
                                            <div className='px-3 py-1 rounded-sm text-[.9rem] bg-[#ffffff3b]'>{item.isCall.status}</div>
                                        </div>
                                    }
                                </div>
                            }
                        </h1>
                        <h1 className='text-[0.8rem] font-semibold text-gray-500'>{
                            (new Date(item.sentWhen)).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }).toString()
                        }</h1>
                        {(() => {
                            if(index === arr.length - 1 && item.sender === account._id && item.seen === true) {
                                return <div className='text-white/50 text-[0.8rem]'>Seen</div>
                                const dtb = chatAreaRef.current.scrollHeight - chatAreaRef.current.scrollTop - chatAreaRef.current.clientHeight
                                if(dtb <= 25) {
                                    chatAreaRef.current.scrollTo({
                                        top: chatAreaRef.current.scrollHeight,
                                        behavior: 'smooth'
                                    })
                                }
                            }
                        })()}
                    </div>
                ))}
            </div>


            <div className={`${!selecteds.length ? '' : 'opacity-40 pointer-events-none'} flex items-center relative p-3 w-full min-h-[70px]`}> {
                !isRequested ?
                <div className='flex px-3 gap-3 items-center text-[.9rem] border-[1px] border-borders rounded-full h-full w-full'>
                    <button ref={buttonRef} className='cursor-pointer active:opacity-55'><EmojiBtn/></button>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        type="text"
                        placeholder='Message...'
                        className='text-white w-full outline-1'
                    />
                    <button onClick={e => {
                        if(input.length == 0) return
                        socket.emit('send message', {sender_id: account._id, receiver_id: chatInfo.user_id, chat_id: data.chat._id, callOffer: null, message: input.trim()})
                        setInput('')
                    }} className='text-[#3797F0] px-2 cursor-pointer active:opacity-55'>Send</button>
                </div>
                :
                <div className='py-5 w-full flex justify-center text-white'>
                    <div className='flex flex-col font-[100] text-[1.2rem]'>
                        <div>Accept invite from <b className='font-bold'>{data.user.username}</b>?</div>
                        <button onClick={() => {
                            socket.emit('send invite', { my_id: account._id, phoneNo: data.user.phoneNo, firstMessage: null })
                            setIsRequested(false)
                        }} className='hover:underline underline-offset-4 text-[#3797F0]'>Accept.</button>
                    </div>
                </div>
            }</div>


            {!isRequested ?
                <div className={`pt-10 flex flex-col gap-2 items-center transition ease-in-out duration-500 ${openInfo ? 'translate-x-0' : 'translate-x-[382px]'} absolute right-0 h-full w-[382px] border-l border-borders bg-black text-white`}>
                <button onClick={() => setOpenInfo(false)} className='absolute left-[10px] top-[10px]'><CloseIcon/></button>
                <div>
                    <Pfp size='250px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                </div>
                <div className='text-[2rem]'>{data.user.username}</div>
                <div className='font-[200] mt-7 flex flex-col w-[80%] gap-2 text-[.9rem]'>
                    <div className='w-fit font-bold text-[1.3rem]'>Details :</div>
                    <div className='opacity-70 flex items-center w-[80%] gap-2 text-[.9rem]'>
                        <Calendar/>
                        <h1>Account created on <b className='font-bold'>{(() => {
                            const isoDate = data.user.createdOn
                            const date = new Date(isoDate)
                            
                            const options = { day: 'numeric', month: 'long', year: 'numeric' }
                            const formatted = date.toLocaleDateString('en-GB', options)
                            
                            return formatted
                        })()}</b></h1>
                    </div>
                    <div className='px-[1px] flex items-center w-[80%] gap-2 text-[.9rem]'>
                        <div className={`size-[10px] rounded-full ${status === 'Online' ? 'bg-[#05df72b6]' : 'bg-gray-500'}`}></div>
                        <h1 className='opacity-70'>Current Status &nbsp;<b>-</b></h1><h1 className='font-bold'>{status}</h1>
                    </div>
                    <div className='px-[1px] flex items-center w-[80%] gap-2 text-[.9rem]'>
                        <Mutuals/>
                        <h1 className='opacity-70'>Mutual Friends &nbsp;<b>-</b></h1><h1 className='font-bold'>{(() => {
                            const set = new Set(data.user.contacts)
                            const intersection = account.contacts.filter(x => set.has(x))
                            return intersection.length
                        })()}</h1>
                    </div>
                    <div className='px-[1px] flex items-center w-[80%] gap-2 text-[.9rem]'>
                        <div className='opacity-70'><VoiceChatIcon size='11.5'/></div>
                        <h1 className='opacity-70'>Contact Number &nbsp;<u className='underline-offset-4'>{data.user.phoneNo}</u></h1>
                    </div>
                </div>
                <div className='mt-14 w-[80%] gap-1 items-start flex flex-col font-[100] text-[1.2rem] text-red-500'>
                    <button className='underline-offset-4 hover:underline'>Delete Chat</button>
                    <button className='underline-offset-4 hover:underline'>Block <b className='font-semibold'>{data.user.username}</b></button>
                </div>
            </div>
            :
            <></>
            }
            {deleteMessagesPopup ?
            <div className='animate-showUp flex items-center justify-center absolute w-full h-full bg-black/50'>
                <div className='p-4 text-white flex flex-col gap-5 items-center bg-gray-800 rounded-md'>
                    <button onClick={() => setDeleteMessagesPopup(false)} className="absolute left-4.5 top-5.5"><CloseIcon/></button>
                    <div className='text-[1.3rem] font-[100]'>Delete the messages?</div>
                    <div className='flex items-center gap-4'>
                        {(() => {
                            for(let i of selecteds) {
                                if(i.sender != account._id || i.deletedForBoth) return false
                            }
                            return true
                        })() ?
                            <button onClick={() => {
                                setArr(prev => 
                                    prev.map((e) => 
                                        selecteds.some(f => f.message_id === e._id) ? 
                                        {...e, deletedForBoth: true, selected: false} : 
                                        {...e, selected: false}
                                    )
                                )
                                setDeleteMessagesPopup(false)
                                socket.emit('delete for everyone', { chat_id: data.chat._id, my_id: account._id,
                                his_id: data.user._id, selecteds})
                                setSelecteds([])
                            }} className='p-1 px-2 text-[.9rem] text-white/70 bg-white/10 rounded-sm font-[100]'>Delete for everyone</button>
                            :
                            <></>
                        }
                        <button onClick={() => {
                            setArr(prev => prev.filter(e => !selecteds.some(f => f.message_id === e._id)))
                            setDeleteMessagesPopup(false)
                            socket.emit('delete for me', { chat_id: data.chat._id, my_id: account._id, selecteds })
                            setSelecteds([])
                        }} className='p-1 px-2 text-[.9rem] text-white/70 bg-white/10 rounded-sm font-[100]'>Delete for me</button>
                    </div>
                </div>
            </div>
            :
            <></>
            }
        </div>
        :
        <div className={`text-[1.5rem] animate-pulse font-[100] text-white flex flex-col gap-2 items-center justify-center h-[100vh] w-full`}>
            Loading
            <div className='w-[3rem] border-t animate-ping'></div>
        </div>
        )
        :
        <div className='flex flex-col gap-1 items-center justify-center h-[100vh] w-full text-white'>
            <div><ChatIcon/></div>
            <div className='text-[4vh] text-[#ffffff33] font-light text-nowrap'>No opened chat</div>
        </div>
    )
}