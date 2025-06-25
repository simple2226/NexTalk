import React, { useEffect, useState } from 'react'
import SearchIcon from './assets/SearchIcon'
import Pfp from './assets/Pfp'
import { io } from 'socket.io-client'
import CloseIcon from './assets/CloseIcon'

export default function ChatList(attrs) {
    const { data, setData } = attrs.vars
    const { requestChatArea } = attrs.funcs
    const [openRequests, setOpenRequests] = useState(false)
    return (
        !openRequests ?
        <div className='pt-5 flex flex-col items-start h-[100vh] min-w-[397px] border-r border-borders'>
            <div className='w-full flex items-end justify-between px-5 text-white font-semibold text-[1.5rem]'>
                <div>Messages</div>
                <button onClick={() => setOpenRequests(true)} className='cursor-pointer active:opacity-55 text-[1rem] text-[#ffffff6c]'>Requests</button>
            </div>
            <div className='mt-5 px-3 flex items-center gap-3 self-center p-2 rounded-md w-[92%] bg-[#ffffff2a]'>
                <SearchIcon/>
                <input type="text" className='text-[.9rem] text-white w-full' placeholder='Search'/>
            </div>
            <div className='mt-3 relative flex flex-col overflow-y-auto w-full h-full'>
            {data ?                
                (data.Contacts.map((item, index) =>
                    <div onClick={() => requestChatArea(item._id, item.others_id)} key={index} className='px-4 gap-3 flex items-center w-full min-h-[75px] hover:bg-[#ffffff17] cursor-pointer'>
                        <Pfp size='40px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                        <div className='flex flex-col items-start'>
                            <div className='text-white text-[1rem] font-semibold'>{item.name}</div>
                            <div className='text-[#ffffff6c] text-[.9rem]'>{item.lastMessage.message}</div>
                        </div>
                    </div>
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
                (data.Requests.map((item, index) =>
                    <div key={index} className='px-4 gap-3 flex items-center w-full min-h-[75px] hover:bg-[#ffffff17] cursor-pointer'>
                        <Pfp size='40px' url='url(https://scontent.cdninstagram.com/v/t51.75761-19/505432788_18081790582816553_1268032086364561825_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=qmxJ_5-UinEQ7kNvwFCNS_A&_nc_oc=AdmIXu8mEQhIitYQtvtet_bTHTYZYT-nDXVoVc1u6sHprRDAe9Mtkdb0dvFEXxlZcOkJhMwLF8s1XxaH0SolAfNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=SKVnChxPP1rv6otItJg7jw&oh=00_AfP9fDjH-Ct--T7FE4yF2sMTuvlun4giq5Ucs0_IEqA_7Q&oe=68585D75)'/>
                        <div className='flex flex-col items-start'>
                            <div className='text-white text-[1rem] font-semibold'>{item.name}</div>
                            <div className='text-[#ffffff6c] text-[.9rem]'>{item.lastMessage.message}</div>
                        </div>
                    </div>
                ))
                :
                <></>
            }
            </div>
        </div>
    )
}