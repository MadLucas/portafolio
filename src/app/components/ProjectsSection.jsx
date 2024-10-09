
import React from 'react'
import ProjectsCard from './ProjectsCard'

const projectsData = [
    {
        id: 1,
        title: "Landing page",
        description: "Landing page para un hotel de mascotas",
        image: "static/images/landing_page.png",
        tag: ["All", "Web"],
        gitUrl:"https://github.com/MadLucas/landing_page1",
        previewUrl:"https://unrivaled-kringle-82dc30.netlify.app"
    },
    {
        id: 2,
        title: "Bookstore",
        description: "Marketplace de libros",
        image: "/static/images/Bookstore.png",
        tag: ["All", "Web"],
        gitUrl:"https://github.com/MadLucas/e-comerceudd-backend",
        previewUrl:"https://regal-chimera-e19bc1.netlify.app"
    },
    {
        id: 3,
        title: "Dashboard Cripto",
        description: "Consumo de api para crear dashboard",
        image: "/static/images/dashboard_cripto.png",
        tag: ["All", "Web"],
        gitUrl:"https://github.com/MadLucas/dashboard_entrega_3",
        previewUrl:"https://stellular-pegasus-ba45a8.netlify.app/"
    },
    {
        id: 4,
        title: "Crud",
        description: "Crud con operaciones basicas",
        image: "/static/images/Crud.png",
        tag: ["All", "Web"],
        gitUrl:"https://github.com/MadLucas/aplicacion_crud",
        previewUrl:"https://cosmic-khapse-1a8f2c.netlify.app"
    },
    {
        id: 4,
        title: "RestaruantApp",
        description: "Web para Restaurant",
        image: "/static/images/micocinarestaurant.png",
        tag: ["All", "Web"],
        gitUrl:"https://github.com/MadLucas/proyecto-restaurant-entrega4",
        previewUrl:"https://tourmaline-cranachan-dd23b5.netlify.app"
    },
    {
        id: 5,
        title: "Cotizador Roller",
        description: "App, Fullstack, para cotizar rollers con base de datos sql",
        image: "/static/images/cotizador.png",
        tag: ["All", "Web"],
        gitUrl:"",
        previewUrl:"https://cotizadorweb-prisma.vercel.app/"
    }

]

const ProjectsSection = () => {
    return (
        <>
        <section id='proyectos'>
        <h2 className='text-center text-4xl font-bold text-white mt-4 mb-4 '>Mis proyectos</h2>
            <div className='grid md:grid-cols-3 gap-8 md:gap-12'>
                {projectsData.map((project) =>
                    <ProjectsCard
                        key={project.id}
                        title={project.title}
                        description={project.description}
                        imgUrl={project.image}
                        gitUrl={project.gitUrl} 
                        previewUrl={project.previewUrl}/>)}
            </div>
        </section>
        </>

    )
}

export default ProjectsSection
