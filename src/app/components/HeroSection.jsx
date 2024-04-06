'use client'

import React from 'react'
import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation';

const HeroSection = () => {
    return (
        <section>
            <div className="grid grid-cols-1 lg sm:grid-cols-12">
                <div className='col-span-7 place-self-center text-center sm:text-left'>
                    <h1 className='text-white mb-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold'><span className='text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-700 to-red-600 '>Hola, soy {""}</span>
                        <br></br>
                        <TypeAnimation
                            sequence={[
                                // Same substring at the start will only be typed out once, initially
                                'Lucas!',
                                1000, // wait 1s before replacing "Mice" with "Hamsters"
                                'Fullstack web developer',
                                1000,
                            ]}
                            wrapper="span"
                            speed={30}
                            repeat={Infinity} />
                    </h1>
                    <p className='text-white text-lg lg:text-xl mb-6'>Bienvenidos a mi sitio web! Soy <span className='text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-700 to-red-700'>Lucas</span>, un desarrollador web Fullstack. En este espacio, podrás explorar algunos de mis proyectos más recientes y conocer más acerca de mi trayectoria y habilidades. Desde aplicaciones web dinámicas hasta interfaces intuitivas, mi enfoque se centra en ofrecer experiencias digitales que impacten y resuelvan necesidades del mundo real. Te invito a navegar por las diferentes secciones para descubrir cómo puedo ayudarte a materializar tus ideas y proyectos en el mundo digital.







                    </p>
                    <div>
                        <button className="px-6 py-3 w-full sm:w-fit rounded-full mr-4 bg-gradient-to-br from-orange-500 via-orange-700 to-red-600 hover:bg-slate-200 text-white">
                            Open to work!
                        </button>
                        <button className="px-6 py-3 w-full sm:w-fit rounded-full mr-4 bg-transparent hover:bg-slate-800 text-white border border-white mt-3">
                            Dercaga cv
                        </button>
                    </div>
                </div>
                <div className='col-span-5 place-self-center mt-4 lg:mt-0'>
                    <div className='w-[250px] h-[250px] lg:w-[400px] lg:h-[400px]'>
                        <Image
                            className='rounded-full'
                            src="/static/images/portafolioimage.png"
                            alt="hero image"
                            width={500}
                            height={500} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
