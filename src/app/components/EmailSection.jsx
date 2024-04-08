'use client';

import React from 'react'
import Link from "next/link";
import Image from "next/image"

const EmailSection = () => {

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Email:', e.target.email.value);
        console.log('Subject:', e.target.subject.value);
        console.log('Message:', e.target.message.value);

        const data = {
            email: e.target.email.value,
            subject: e.target.subject.value,
            message: e.target.message.value,
        }
        const JSONdata = JSON.stringify(data);
        const endpoint = "/api/send";

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSONdata,
        }
        
        const response = await fetch(endpoint, options);
        const resData = await response.json();
        console.log('Response:', resData);
        if (response.status === 'succes') {
            console.log('Message sent.');
        }
    }

    return (
        <section className='grid md:grid-cols-2 my-12 md:my-12 py-24 gap-4' id='contacto'>
            <div>
                <h5 className='text-xl font-bold text-white my-2'>Let's Connect!</h5>
                <p className='text-[#ADB7BE] mb-4 max-w-md'>
                    {""}
                    I'm currently looking for new oppotunities, my inbox is always open. 
                    Wether you have a quiestion or just want to say hi, I'll try my best
                    to get back to you!
                </p>
                <div className='socials flex flex-row gap-2 '>
                    <Link href={"https://github.com/MadLucas"} className='text-white hover:text-orange-700'>GitHub</Link>
                </div>
            </div>
            <div>
                <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                    <label htmlFor="email" type="email" className='text-white block mb-2 text-sm font-medium'>Tu email</label>
                    <input
                        name="email"
                        type="email" 
                        id='email' 
                        required 
                        placeholder='jacob@gmail.com'
                        className='bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 tx-sm rounded-lg block w-full p-2.5'/>
                    
                    <label htmlFor="email" type="subject" className='text-white block mb-2 text-sm font-medium'>Asunto</label>
                    <input
                        name="subject" 
                        type="text" 
                        id='subject' 
                        required 
                        placeholder='Solo pasa a saludar! :)'
                        className='bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 tx-sm rounded-lg block w-full p-2.5'/>
                    <div>
                        <div className='mb-6'>
                            <label 
                                htmlFor="message"
                                className='text-white block text-sm mb-2 font-medium'
                            >Comentarios
                            </label>
                            <textarea 
                                name="message"
                                type="text"
                                id='message'
                                className='bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 tx-sm rounded-lg block w-full p-2.5'
                                placeholder='Hablemos!'
                            />
                        </div>
                    </div>
                    <div>
                        <button 
                            type='submit'
                            className='bg-orange-600 hover:bg-orange-400 text-white font-medium py-2.5 px-5 rounded-lg w-full'
                        >Enviar Mensaje</button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default EmailSection
