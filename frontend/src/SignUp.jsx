import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function SignUp() {
    const [phone, setPhone] = useState('')
    const [username, setUsename] = useState('')
    const [password, setPasswrod] = useState('')
    const [invPhE, setInvPhE] = useState(false)
    const [PhE, setPhE] = useState(false)
    const [NE, setNE] = useState(false)
    const [PswE, setPswE] = useState(false)
    const [FourONine, setFourONine] = useState(false)
    const [CnE, setCnE] = useState(false)
    const nav = useNavigate()

    const isValidIndianPhoneNumber = (input) => {
        const digitsOnly = input.replace(/\s+/g, '')
        const regex = /^[6-9]\d{9}$/
        return regex.test(digitsOnly);
    }

    const getStarted = async () => {
        try {
            if(!phone.length) {
                setPhE(true)
                return
            }
            if(!isValidIndianPhoneNumber(phone)) {
                setInvPhE(true)
                return
            }
            if(!username.length) {
                setNE(true)
                return
            }
            if(!password.length) {
                setPswE(true)
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
            if(error.response.status === 500) setCnE(true)
            if(error.response.status === 404) setFourONine(true)
        }
    }
    return (
        <div className='text-white flex flex-col items-center justify-center h-[100vh] w-full'>
            <div className='transition ease-in-out duration-300 hover:shadow-[0_14px_20px_5px_#ffffffce] relative p-12 flex flex-col gap-5 border border-borders rounded-sm'>
                <div className='absolute left-4 -top-7 text-[2rem] text-[#ffffffb0] bg-black italic'>Create a new Account</div>
                <div className='relative flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Your Phone Number</div>
                    <div className='flex flex-col gap-1 items-start'>
                        <input value={phone} onChange={e => {
                            setPhone(e.target.value)
                            setInvPhE(false)
                            setPhE(false)
                            setFourONine(false)
                            setCnE(false)
                            if(e.target.value.length && !isValidIndianPhoneNumber(e.target.value)) setInvPhE(true)
                        }} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type='text'/>
                        {FourONine ? <div className='text-[.7rem] text-red-500'>This number is not available</div> : <></>}
                        {PhE ? <div className='text-[.7rem] text-red-500'>This field cannot be empty</div> : <></>}
                        {invPhE ? <div className='text-[.7rem] text-red-500'>Invalid Phone number</div> : <></>}
                    </div>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>Full Name</div>
                    <div className='flex flex-col gap-1 items-start'>
                        <input value={username} onChange={e => {
                            setUsename(e.target.value)
                            setNE(false)
                            setCnE(false)
                        }} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="text"/>
                        {NE ? <div className='text-[.7rem] text-red-500'>This field cannot be empty</div> : <></>}
                    </div>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <div className='text-[1.1rem] text-[#ffffffd3]'>New Password</div>
                    <div className='flex flex-col gap-1 items-start'>
                        <input value={password} onChange={e => {
                            setPasswrod(e.target.value)
                            setPswE(false)
                            setCnE(false)
                        }} placeholder='Enter here' className='bg-[#ffffff2a] rounded-sm p-2.5 w-[350px]' type="password"/>
                        {PswE ? <div className='text-[.7rem] text-red-500'>This field cannot be empty</div> : <></>}
                    </div>
                </div>
                <button onClick={() => getStarted()} className='self-center hover:border-white active:border-borders border border-borders w-fit p-3'>Get Started</button>
                {CnE ? <div className='absolute bottom-[20px] self-center text-[.7rem] text-red-500'>Connection Error</div>: <></>}
            </div>
        </div>
    )
}