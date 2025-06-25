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
            <div className='border border-borders size-[35px] bg-borders rounded-full' 
            style={{
                backgroundImage: 'url(https://scontent.cdninstagram.com/v/t51.75761-19/502396379_17846840958486842_7848883373300275011_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=106&ccb=1-7&_nc_sid=f7ccc5&_nc_ohc=stEBJL29lNMQ7kNvwEqHax_&_nc_oc=AdmiJboLlvGiDvRPxLXh-0zodWaUQi04pCrzCrUbqJk0QmagLd8io-oRHS9i4UeBKpxp10svGH02rsVM4QjSxapk&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=J0b7BPGGLjj1zVrSwmo3RA&oh=00_AfNv26brlbhzCabjAMJt0PWL7GHYWWZxKQE-hqd9pCOB5Q&oe=68587560)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundRosition: 'center',
            }}></div>
            <div className='flex flex-col gap-3'>
                <button className='group relative flex items-center p-2 hover:bg-gray-800 rounded-sm'>
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