import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [phone, setPhone] = useState('')
    const [password, setPasswrod] = useState('')
    const navigate = useNavigate()
    const [invPh, setInvPh] = useState(false)
    const [user404, setUser404] = useState(false)
    const [emptyInpPh, setEmptyInpPh] = useState(false)
    const [emptyInpP, setEmptyInpP] = useState(false)
    const [wrongPass, setWrongPass] = useState(false)
    const [connectErr, setConnectErr] = useState(false)
    const [show, setShow] = useState(0)
    useEffect(() => {
        const verify = async () => {
            try {
                await axios.post('api/auth/verify', {}, {
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
        const regex = /^[6-9]\d{9}$/
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
        } catch (error) {
            if(error.response.status === 404) setUser404(true)
            if(error.response.status === 401) setWrongPass(true)
            if(error.response.status === 500) setConnectErr(true)
        }
    }

    useEffect(() => {
        if(phone.length && !isValidIndianPhoneNumber(phone)){setInvPh(true)}
        if(phone.length && isValidIndianPhoneNumber(phone)) {setInvPh(false)}
        if(!phone.length) {setInvPh(false)}
        setUser404(false)
        setEmptyInpPh(false)
        setConnectErr(false)
    }, [phone])
    
    useEffect(() => {
        setEmptyInpP(false)
        setWrongPass(false)
        setConnectErr(false)
    }, [password])

    return (
        show ?
        <div className='text-white flex flex-col items-center justify-center h-[100vh] w-full'>
            <div className='transition ease-in-out duration-300 hover:shadow-[0_14px_20px_5px_#ffffffce] relative p-12 flex flex-col gap-5 border border-borders rounded-sm'>
                <div className='absolute left-4 -top-7 text-[2rem] text-[#ffffffb0] bg-black italic'>Login to Account</div>
                <div className='relative flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Your Phone Number</div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type='text'/>
                    <div className='text-[.7rem] text-red-500'>{(() => {
                        if(user404) return 'User not found'
                        if(emptyInpPh) return 'This field cannot be empty'
                        if(invPh) return 'Invalid phone number'
                    })()}</div>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Password</div>
                    <input value={password} onChange={e => setPasswrod(e.target.value)} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="password"/>
                    <div className='text-[.7rem] text-red-500'>{(() => {
                        if(wrongPass) return 'Password is incorrect'
                        if(emptyInpP) return 'This field cannot be empty'
                    })()}</div>
                </div>
                <button onClick={() => {
                    if(!phone) {setEmptyInpPh(true);return;}
                    if(invPh) return
                    if(!password) {setEmptyInpP(true);return;}
                    login()
                }} className='self-center hover:border-white relative active:border-borders border border-borders w-fit p-3'>
                    Enter Chat
                    <div className='left-0 absolute w-full -bottom-6 text-[.7rem] text-red-500'>{(() => {
                        if(connectErr) return 'Connection Error'
                    })()}</div>
                </button>
            </div>
        </div>
        :
        <></>
    )
}