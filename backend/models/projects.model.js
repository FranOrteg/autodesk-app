const axios = require('axios');

const listProjectsFiltered = async (accessToken,hubId) => {
    try {
        const response = await axios.get(
            `https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects`,
            {
                headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
                }
            }
        )

        // Extraer solo ID y Nombre de cada proyecto
        const filteredProjects = response.data.data.map(project => ({
            id: project.id,
            name: project.attributes?.name || "Sin nombre",
            rootFolder: project.relationships.rootFolder.data.id || "Sin carpeta raíz"
        }));

        return filteredProjects;
    } catch (error) {
        throw new Error(`Error al listar los proyectos del Hub ${hubId}`);

    }
}

const listProjects = async (accessToken,hubId) => {
    try {
        const response = await axios.get(
            `https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects`,
            {
                headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
                }
            }
        )

        return response.data;
    } catch (error) {
        throw new Error(`Error al listar los proyectos del Hub ${hubId}`);

    }
}

const getProjectById = async (accessToken, hubId, projectId) => {
    try {
        const response = await axios.get(
            `https://developer.api.autodesk.com/project/v1/hubs/${hubId}/projects/${projectId}`,
            {
                headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
                }
            }
        )

        return response.data
    } catch (error) {
        throw new Error(`Error al obtener el proyecto ${projectId} del Hub ${hubId}`);

    }
}

module.exports = {
    listProjectsFiltered,
    listProjects,
    getProjectById
}