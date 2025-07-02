import React from 'react'

export default function LoadingChats() {
    return (
        <div className={`text-[1.5rem] animate-pulse font-[100] text-white flex flex-col gap-2 items-center justify-center h-[100vh] w-full`}>
            Loading chats
            <div className='w-[3rem] border-t animate-ping'></div>
        </div>
    )
}