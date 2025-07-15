import React from 'react'
import SettingsIcon from './assets/SettingsIcon'
import AddUser from './assets/AddUser'
import axios from 'axios'
import Logout from './assets/Logout'
import { useNavigate } from 'react-router-dom'

export default function PersonDetails(vars) {
    const nav = useNavigate()
    const logout = async () => {
    try {
        await axios.post('api/auth/logout', {}, {
            withCredentials: true
        })
        nav('/login')
    } catch (error) {}
    }
    return (
        <div className='pt-6 flex flex-col gap-10 items-center min-w-[70px] border-r border-borders'>
            <div className='border border-[#646464] size-[35px] bg-borders rounded-full' 
            style={{
                backgroundImage: `url(https://res.cloudinary.com/drzswoizu/image/upload/uploads/${vars.account._id}.png?v=${vars.dateNow})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '35px',
                height: '35px',
                overflow: 'hidden'
            }}></div>
            <div className='flex flex-col gap-3'>
                <button onClick={() => vars.setSettings(true)} className='group relative flex items-center p-2 hover:bg-gray-800 rounded-sm'>
                    <SettingsIcon/>
                    <div className='bg-gray-800 p-2 border border-borders rounded-lg z-[9999] text-[.7rem] left-[120%] absolute hidden group-hover:flex text-white text-nowrap'>Settings</div>
                </button>
                <button onClick={() => vars.setAddNewContact(true)} className='group relative flex items-center p-2 hover:bg-gray-800 rounded-sm'>
                    <AddUser/>
                    <div className='bg-gray-800 p-2 border border-borders rounded-lg z-[9999] text-[.7rem] left-[120%] absolute hidden group-hover:flex text-white text-nowrap'>Add a new User</div>
                </button>
                <button onClick={() => logout()} className='group relative flex items-center p-2 hover:bg-[#fb2c362d] rounded-sm'>
                    <Logout/>
                    <div className='bg-[#2e090b] p-2 border border-borders rounded-lg z-[9999] text-[.7rem] left-[120%] absolute hidden group-hover:flex text-white text-nowrap'>Logout</div>
                </button>
            </div>
        </div>
    )
}