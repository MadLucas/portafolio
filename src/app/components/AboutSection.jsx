'use client'
import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import TabButton from './TabButton';

const TAB_DATA = [
    {
        title: "skills",
        id: "skills",
        content: (
            <ul>
                <li>node.js</li>
                <li>Express</li>
                <li>Javascrip</li>
                <li>MongoDB</li>
                <li>HTML5</li>
                <li>CSS</li>
                <li>Bootstrap</li>
                <li>Tailwind</li>
                <li>React</li>
                <li>Nextjs</li>
            </ul>
        )
    },
    {
        title: "educacion",
        id: "educacion",
        content: (
            <ul>
                <li>Universidad Del Desarrollo</li>
            </ul>
        )
    }
];

const AboutSection = () => {
    const [tab, setTab] = useState("skills");
    const [isPending, startTransition] = useTransition();

    const handleTabChange = (id) => {
        startTransition(() => {
            setTab(id);
        });
    };

    return (
        <section className='text-white'>
            <div className='md:grid md:grid-cols-2 gap-8 items-center py-8 px-4 xl:gap-16 sm:py-16 sm:px-16'>
                <div className='mb-5'>
                <Image
                    className='rounded'
                    src="/static/images/pcsetup.png"
                    alt="hero image"
                    width={500}
                    height={500}
                />
                </div>

                
                <div className='mt-4 md:mt-0 text-left flex flex-col h-full'>
                    <h2 className='text-4xl font-bold text-white mb-4'>Acerca de mí</h2>
                    <p className='text-base md:text-lg'>
                        Soy un desarrollador fullstack apasionado por crear aplicaciones interactivas y responsivas. Mi experiencia abarca Javascript, React, MongoDB, HTML, CSS, Next.js, Node.js, Express y Git. Mi capacidad de aprendizaje rápido me impulsa a expandir continuamente mi conocimiento y conjunto de habilidades. Disfruto trabajando en equipo y enfocándome en el desarrollo de aplicaciones web con altos estándares de calidad y las mejores prácticas de la industria.
                    </p>
                    <div className='mt-8'>
                        <div className='flex flex-row'>
                            <TabButton
                                selectTab={() => handleTabChange("skills")}
                                active={tab === "skills"}
                            >
                                Skills
                            </TabButton>
                            <TabButton
                                selectTab={() => handleTabChange("educacion")}
                                active={tab === "educacion"}
                            >
                                Educacion
                            </TabButton>
                        </div>
                        <div className='mt-8'>{TAB_DATA.find((t) => t.id === tab).content}</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
