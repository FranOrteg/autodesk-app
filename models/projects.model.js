const axios = require('axios');

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

        return response.data
    } catch (error) {
        throw new Error(`Error al listar los proyectos del Hub ${hubId}`);

    }
}

module.exports = {
    listProjects
}