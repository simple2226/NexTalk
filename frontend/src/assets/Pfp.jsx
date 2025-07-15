import React from 'react'

export default function Pfp({size, url}) {
    return (
        <div className='border border-[#646464] bg-borders rounded-full' 
        style={{
            backgroundImage: url,
            height: size,
            width: size,
            minWidth: size,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            overflow: 'hidden'
        }}></div>
    )
}