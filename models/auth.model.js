const axios = require('axios');

const getAccessToken = async () => {
    try {
        const response = await axios.post(
            'https://developer.api.autodesk.com/authentication/v2/token',
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.APS_CLIENT_ID,
                client_secret: process.env.APS_CLIENT_SECRET,
                scope: 'data:create data:read data:write bucket:create bucket:read bucket:delete viewables:read' // Ajusta según lo que necesites
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error obteniendo el token de Autodesk:', error.response?.data || error.message);
        throw new Error('Error al obtener el token de Autodesk.');
    }
};

module.exports = 
{
    getAccessToken
}