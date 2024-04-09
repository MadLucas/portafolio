'use client'

import React, { useState } from 'react';
import Link from "next/link";

const EmailSection = () => {
    const [successMessage, setSuccessMessage] = useState(null); // creamos mensajes de exito y error para informar al usuario
    const [errorMessage, setErrorMessage] = useState(null); // este corresponde al mensaje de error y definmos sus respectivos estados
    const [formData, setFormData] = useState({ // definimos los estado del formData, para los campos para email, subject y message / de esta manera podemos resetear el formulario una vez enviado el mensaje
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => { // con esta funcion, podemos actualizar formData
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => { // funcion para enviar el formulario
        e.preventDefault();

        const JSONdata = JSON.stringify(formData);
        const endpoint = "/api/send";

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSONdata,
        }

        try {
            const response = await fetch(endpoint, options);
            const resData = await response.json();

            if (resData.success) {
                setSuccessMessage(resData.message);
                setErrorMessage(null);
                setFormData({
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                setErrorMessage(resData.message);
                setSuccessMessage(null);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Hubo un error al enviar el mensaje.");
            setSuccessMessage(null);
        }
    }

    return (
        <section className='grid md:grid-cols-2 my-12 md:my-12 py-24 gap-4' id='contacto'>
            <div>
                <h5 className='text-xl font-bold text-white my-2'>Let's Connect!</h5>
                <p className='text-[#ADB7BE] mb-4 max-w-md'>
                    {"Actualmente estoy buscando nuevas oportunidades, mi inbox siempre está abierto. Ya sea que tengas una pregunta o simplemente quieras saludar, haré todo lo posible por responder."}
                </p>
                <div className='socials flex flex-row gap-2 '>
                    <Link href={"https://github.com/MadLucas"} className='text-white hover:text-orange-700'>GitHub</Link>
                </div>
            </div>
            <div>
                {successMessage && (
                    <div className="bg-green-500 text-white px-4 py-2 mb-4 rounded-md">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="bg-red-500 text-white px-4 py-2 mb-4 rounded-md">
                        {errorMessage}
                    </div>
                )}
                <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                    <label htmlFor="email" className='text-white block mb-2 text-sm font-medium'>Tu email</label>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder='jacob@gmail.com'
                        className='bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 tx-sm rounded-lg block w-full p-2.5' />

                    <label htmlFor="subject" className='text-white block mb-2 text-sm font-medium'>Asunto</label>
                    <input
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder='Solo pasa a saludar! :)'
                        className='bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 tx-sm rounded-lg block w-full p-2.5' />

                    <label htmlFor="message" className='text-white block mb-2 text-sm font-medium'>Comentarios</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder='Hablemos!'
                        className='bg-[#18191E] border border-[#33353F] placeholder-[#9CA2A9] text-gray-100 tx-sm rounded-lg block w-full p-2.5' />

                    <button
                        type='submit'
                        className='bg-orange-600 hover:bg-orange-400 text-white font-medium py-2.5 px-5 rounded-lg w-full'
                    >Enviar Mensaje</button>
                </form>
            </div>
        </section>
    )
}

export default EmailSection;
