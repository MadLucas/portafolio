
import React from 'react'
import ProjectsCard from './ProjectsCard'

const projectsData = [
    {
        id: 1,
        title: "Landing page",
        description: "Landing page para un hotel de mascotas",
        image: "/images/landing_page.png",
        tag: ["All", "Web"]
    },
    {
        id: 2,
        title: "Bookstore",
        description: "Marketplace de libros",
        image: "/images/Bookstore.png",
        tag: ["All", "Web"]
    },
    {
        id: 3,
        title: "Dashboard Cripto",
        description: "Consumo de api para crear dashboard",
        image: "/images/dashboard_cripto.png",
        tag: ["All", "Web"]
    },
    {
        id: 4,
        title: "Crud",
        description: "Crud con operaciones basicas",
        image: "/images/Crud.png",
        tag: ["All", "Web"]
    }
]

const ProjectsSection = () => {
    return (
        <>
            <h2>Mis proyectos</h2>
            <div className='grid md:grid-cols-3 gap-8 md:gap-12'>
                {projectsData.map((project) =>
                    <ProjectsCard
                        key={project.id}
                        title={project.title}
                        description={project.description}
                        imgUrl={project.image} />)}
            </div>
        </>

    )
}

export default ProjectsSection
