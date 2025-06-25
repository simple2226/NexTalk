import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function SignUp() {
    const [phone, setPhone] = useState('')
    const [username, setUsename] = useState('')
    const [password, setPasswrod] = useState('')
    const nav = useNavigate()

    const isValidIndianPhoneNumber = (input) => {
        const digitsOnly = input.replace(/\s+/g, '')
    
        const regex = /^(?:\+91|91)?[6-9]\d{9}$/
        return regex.test(digitsOnly);
    }

    const getStarted = async () => {
        try {
            if(!phone.length || !username.length || !password.length) {
                console.error('Some empty input')
                return
            }
            if(!isValidIndianPhoneNumber(phone)) {
                console.error('Invalide phone Number')
                return
            }
            const response = await axios.post('api/accounts/add', {
                phoneNo : phone.replace(/\s+/g, ''),
                username: username.trim(),
                password: password
            }, {
                withCredentials: true
            })
            nav('/')
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <div className='text-white flex flex-col items-center justify-center h-[100vh] w-full'>
            <div className='transition ease-in-out duration-300 hover:shadow-[0_14px_20px_5px_#ffffffce] relative p-12 flex flex-col gap-5 border border-borders rounded-sm'>
                <div className='absolute left-4 -top-7 text-[2rem] text-[#ffffffb0] bg-black italic'>Create a new Account</div>
                <div className='relative flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Your Phone Number</div>
                    <div className='flex items-center'>
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type='text'/>
                        <button className='absolute right-4 text-[.7rem] hover:underline underline-offset-4 active:opacity-55'>Send Otp</button>
                    </div>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Otp</div>
                    <input placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="text"/>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Full Name</div>
                    <input value={username} onChange={e => setUsename(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="text"/>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>New Password</div>
                    <input value={password} onChange={e => setPasswrod(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="password"/>
                </div>
                <button onClick={() => getStarted()} className='self-center hover:border-white active:border-borders border border-borders w-fit p-3'>Get Started</button>
            </div>
        </div>
    )
}