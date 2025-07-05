import React, { useEffect, useRef, useState } from 'react'
import SearchIcon from './assets/SearchIcon'
import Pfp from './assets/Pfp'
import { io } from 'socket.io-client'
import CloseIcon from './assets/CloseIcon'
import NotAllowed from './assets/NotAllowed'

export default function ChatList({data, account, setChatInfo}) {
    const [openRequests, setOpenRequests] = useState(false)
    const [selectedContactId, setSelectedContactId] = useState(null);
    return (
        !openRequests ?
        <div className='pt-5 flex flex-col items-start h-[100vh] min-w-[397px] max-w-[397px] border-r border-borders'>
            <div className='w-full flex items-end justify-between px-5 text-white font-semibold text-[1.5rem]'>
                <div>Messages</div>
                <button onClick={() => setOpenRequests(true)} className='cursor-pointer active:opacity-55 text-[1rem] text-[#ffffff6c]'>Requests ({data.Requests.length})</button>
            </div>
            <div className='mt-5 px-3 flex items-center gap-3 self-center p-2 rounded-md w-[92%] bg-[#ffffff2a]'>
                <SearchIcon/>
                <input type="text" className='text-[.9rem] text-white w-full' placeholder='Search'/>
            </div>
            <div className='mt-3 relative flex flex-col overflow-y-auto w-full h-full'>
            {data ?
                (data.Contacts.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).map((item, index) => {
                    const isSelected = item._id === selectedContactId
                    return <div onClick={() => {
                        if (isSelected) return
                        setSelectedContactId(item._id)
                        setChatInfo({ chat_id: item._id, my_id: account._id, user_id: item.others_id, request: false })
                    }} key={index} className={`select-none ${isSelected ? 'bg-white/14' : 'hover:bg-[#ffffff13]'} relative px-4 gap-3 flex items-center w-full min-h-[75px] cursor-pointer`}>
                        <Pfp size='40px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                        <div className='flex flex-col items-start'>
                            <div className='text-white text-[1rem] font-semibold'>{item.name}</div>
                            <div className={`${(item.userA.id === account._id ? item.userA.checked : item.userB.checked) ?
                            'text-[#ffffff6c]' : 'text-white font-semibold'}  text-[.9rem] text-nowrap`}>
                                {item.lastMessage ? 
                                    (item.lastMessage.deletedForBoth ? 
                                        <div className='flex gap-2 items-center text-[#ffffff6c]'>
                                            <NotAllowed size='10px' color='#ffffff6c'/> this message is deleted
                                        </div> 
                                        :
                                        item.lastMessage.message
                                    )
                                    :
                                    "Start the conversation!"
                                }</div>
                        </div>
                        {(() => {
                            if(item.userA.id === account._id) return item.userA.numNotRead
                            if(item.userB.id === account._id) return item.userB.numNotRead
                        })() > 0 ?
                        <div className='flex items-center justify-center absolute right-5 bg-[#3797F0] rounded-full size-[1.5rem] p-1 text-[.8rem] text-white'>
                            { item.userA.id === account._id ? item.userA.numNotRead : item.userB.numNotRead }
                        </div>
                        :
                        <></>
                        }
                    </div>
                }
                ))
                :
                <></>
            }
            </div>
        </div>
        :
        <div className='pt-5 flex flex-col items-start h-[100vh] min-w-[397px] border-r border-borders'>
            <div className='w-full flex items-end gap-2 px-5 text-white font-semibold text-[1.2rem]'>
                <button onClick={() => setOpenRequests(false)}><CloseIcon/></button>
                <div>Requests</div>
            </div>
            <div className='mt-3 relative flex flex-col overflow-y-auto w-full h-full'>
            {data ?
                (data.Requests.map((item, index) => {
                    const isSelected = item._id === selectedContactId
                    return <div onClick={() => {
                        if (isSelected) return
                        setSelectedContactId(item._id)
                        setChatInfo({ chat_id: item._id, my_id: account._id, user_id: item.others_id, request: true })
                    }} key={index} className={`select-none ${isSelected ? 'bg-white/14' : 'hover:bg-[#ffffff13]'} relative px-4 gap-3 flex items-center w-full min-h-[75px] cursor-pointer`}>
                        <Pfp size='40px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                        <div className='flex flex-col items-start'>
                            <div className='text-white text-[1rem] font-semibold'>{item.name}</div>
                            <div className={`${(item.userA.id === account._id ? item.userA.checked : item.userB.checked) ?
                            'text-[#ffffff6c]' : 'text-white font-semibold'}  text-[.9rem]`}>{item.lastMessage ? item.lastMessage.message : "Start the conversation!"}</div>
                        </div>
                        {(() => {
                            if(item.userA.id === account._id) return item.userA.numNotRead
                            if(item.userB.id === account._id) return item.userB.numNotRead
                        })() > 0 ?
                        <div className='flex items-center justify-center absolute right-5 bg-[#3797F0] rounded-full size-[1.5rem] p-1 text-[.8rem] text-white'>
                            { item.userA.id === account._id ? item.userA.numNotRead : item.userB.numNotRead }
                        </div>
                        :
                        <></>
                        }
                    </div>
                }))
                :
                <></>
            }
            </div>
        </div>
    )
}