import React, { useEffect, useRef, useState } from 'react'
import { EmojiButton } from '@joeattardi/emoji-button'
import EmojiBtn from './assets/EmojiBtn'
import chat_history from '../chat_history.json'
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

export default function ChatArea({account, chatInfo, socket}) {
    const [data, setData] = useState(null)
    const [input, setInput] = useState('')
    const [numSelected, setNumSelected] = useState(0)
    const [openInfo, setOpenInfo] = useState(false)
    const [arr, setArr] = useState([])
    const inputRef = useRef(null)
    const buttonRef = useRef(null)
    const pickerRef = useRef(null)
    const chatAreaRef = useRef(null)

    const getChatReady = (chat) => {
        setArr(chat.messages)
    }
    
    useEffect(() => {
        if(!socket) return
        const socketInstance = socket
        socketInstance.on('get chat', (data) => {
            setData(data)
        })
        return () => {
            socketInstance.off()
        }
    }, [socket])

    useEffect(() => {
        if(!data) return
        setArr(data.chat.messages)
    }, [data])

    useEffect(() => {
        setOpenInfo(false)
        setInput('')
        setNumSelected(0)
        setArr([])
        setData(null)

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

    useEffect(() => {
        chatAreaRef.current?.scrollTo({
            top: chatAreaRef.current.scrollHeight,
            behavior: 'smooth'
        })
    }, [chatAreaRef.current])

    return ((chatInfo.chat_id && chatInfo.my_id && chatInfo.user_id) ? (
        data ?
        <div className={`animate-showUp relative flex flex-col h-[100vh] w-[calc(100vw-397px)] min-w-[277px]`}>
            <div className={`${numSelected ? 'bg-[#ffffff11]' : ''} px-4 flex justify-between items-center w-full min-h-[75px] border-b border-borders`}>
                {!numSelected ? (
                    <><div className='gap-4 flex items-center'>
                        <Pfp size='45px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                        <div className='hidden lg:block md:hidden sm:hidden text-white text-[1.2rem] font-semibold'>{data.user.username}</div>
                    </div>
                    <div className='flex gap-4 items center justify-self-end'>
                        <button className='active:opacity-55 cursor-pointer'><VoiceChatIcon size='24'/></button>
                        <button className='active:opacity-55 cursor-pointer'><VideoChatIcon/></button>
                        <button onClick={() => setOpenInfo(true)} className='active:opacity-55 cursor-pointer'><UserInfoIcon/></button>
                    </div></>)
                    :
                    (<><div>
                        <button onClick={() => {
                            // setChatArea(prev => {
                            //     let temp = JSON.parse(JSON.stringify(prev))
                            //     temp.Chat.messages.forEach(m => {
                            //         m.selected = false
                            //     })
                            //     return temp
                            // })
                            // setNumSelected(0)
                        }} className='active:opacity-55'><CloseIcon/></button>
                    </div>
                    <div className='flex gap-4 items center justify-self-end'>
                        {numSelected == 1 ? <>
                        <button className='active:opacity-55'><ReplyIcon/></button>
                        <button className='active:opacity-55'><CopyIcon/></button>
                        </> : <></>}
                        <button className='active:opacity-55'><DeleteIcon/></button>
                    </div></>)
                }
            </div>

            <div ref={chatAreaRef} className='pt-3 flex flex-col gap-2 overflow-y-auto w-full h-full'>
                {arr.map((item, index) => (
                        <div onClick={() => {
                            // if(numSelected) {
                            //     if(!item.selected) {
                            //         setNumSelected(prev => prev + 1)
                            //         setChatArea(prev => {
                            //                 // prev.map((item, i) => 
                            //                 //     i === index ? { ...item, selected: true } : item
                            //                 // )
                            //                 let temp = JSON.parse(JSON.stringify(prev))
                            //                 temp.Chat.messages[index].selected = true
                            //                 return temp
                            //             }
                            //         )
                            //     } else {
                            //         setNumSelected(prev => prev - 1)
                            //         setChatArea(prev => {
                            //                 // prev.map((item, i) => 
                            //                 //     i === index ? { ...item, selected: false } : item
                            //                 // )
                            //                 let temp = JSON.parse(JSON.stringify(prev))
                            //                 temp.Chat.messages[index].selected = false
                            //                 return temp
                            //             }
                            //         )
                            //     }
                            // }
                        }} key={index} className={`px-5 py-2 ${numSelected ? 'cursor-pointer' : ''} ${item.selected ? 'bg-[#ffffff2d]' : ''} w-full group relative flex flex-col ${item.sender !== account._id ? 'items-start self-start' : 'items-end self-end'}`}>
                            <h1 style={{
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word',
                            }} className={`flex items-center relative font-[100] px-4 p-3 text-left text-[.8rem] max-w-[350px] bg-[#3797F0] text-white rounded-2xl ${item.sender !== account._id ? 'rounded-bl-none' : 'rounded-br-none'}`}>
                                <button onClick={() => {
                                    // setNumSelected(prev => prev + 1)
                                    // setChatArea(prev => {
                                    //     // prev.map((item, i) => 
                                    //     //     i === index ? { ...item, selected: true } : item
                                    //     // )
                                    //     let temp = JSON.parse(JSON.stringify(prev))
                                    //     temp.Chat.messages[index].selected = true
                                    //     return temp
                                    // })
                                }} className={`hidden ${numSelected ? '' : 'group-hover:block'} absolute ${item.sender !== account._id ? '-right-10' : '-left-[2.3rem]'} text-[.8rem] font-normal text-[#ffffff7a] hover:text-white`}>More</button>
                                {item.message}
                            </h1>
                            <h1 className='text-[0.8rem] font-semibold text-gray-500'>{
                                (new Date(item.sentWhen)).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }).toString()
                            }</h1>
                        </div>
                    )
                )}
            </div>


            <div className='flex items-center relative p-3 w-full min-h-[70px]'>
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
                    <button onClick={() => {
                        // console.log(input)
                        // if(input.length == 0) return
                        // setArr(prev => {
                        //     let temp = [...prev]
                        //     temp.push({
                        //         message_id: prev.length + 1,
                        //         sender: "Alice",
                        //         timestamp: Date(),
                        //         message: input,
                        //         selected: false
                        //     })
                        //     return temp
                        // })
                        // setInput('')
                    }} className='text-[#3797F0] px-2 cursor-pointer active:opacity-55'>Send</button>
                </div>
            </div>


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
                        <div className='size-[10px] rounded-full bg-green-400'></div>
                        <h1 className='opacity-70'>Current Status &nbsp;<b>-</b></h1><h1 className='font-bold'>Online</h1>
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