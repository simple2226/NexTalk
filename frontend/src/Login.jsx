import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [phone, setPhone] = useState('')
    const [password, setPasswrod] = useState('')
    const navigate = useNavigate()
    const [show, setShow] = useState(0)
    useEffect(() => {
        const verify = async () => {
        try {
            const response = await axios.post('api/auth/verify', {}, {
                withCredentials: true
            })
            navigate('/')
        } catch (error) {
            setShow(1)
        }
    }
    verify()
}, [])
const isValidIndianPhoneNumber = (input) => {
    const digitsOnly = input.replace(/\s+/g, '')
    const regex = /^(?:\+91|91)?[6-9]\d{9}$/
    return regex.test(digitsOnly);
}
const login = async () => {
    try {
        if(!phone.length || !password.length) {
            console.error('Some empty input')
            return
        }
        if(!isValidIndianPhoneNumber(phone)) {
            console.error('Invalide phone Number')
            return
        }
        const response = await axios.post('api/auth/login', {
            phoneNo : phone.replace(/\s+/g, ''),
            password: password,
            generateTokens: true
        }, {
            withCredentials: true
        })
        navigate('/')
    } catch (error) {}
}
return (
    show ?
    <div className='text-white flex flex-col items-center justify-center h-[100vh] w-full'>
            <div className='transition ease-in-out duration-300 hover:shadow-[0_14px_20px_5px_#ffffffce] relative p-12 flex flex-col gap-5 border border-borders rounded-sm'>
                <div className='absolute left-4 -top-7 text-[2rem] text-[#ffffffb0] bg-black italic'>Login to Account</div>
                <div className='relative flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Your Phone Number</div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type='text'/>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>New Password</div>
                    <input value={password} onChange={e => setPasswrod(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="password"/>
                </div>
                <button onClick={() => login()} className='self-center hover:border-white active:border-borders border border-borders w-fit p-3'>Enter Chat</button>
            </div>
        </div>
        :
        <></>
    )
}