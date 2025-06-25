import React from 'react'

export default function Pfp({size, url}) {
    return (
        <div className='border border-borders bg-borders rounded-full' 
        style={{
            height: size,
            width: size,
            minWidth: size,
            backgroundImage: url,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundRosition: 'center',
        }}></div>
    )
}