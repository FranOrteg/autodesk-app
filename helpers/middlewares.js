const { getAccessToken } = require('../models/auth.model');

let cachedToken = null;
let tokenExpiration = null;

const fetchToken = async () => {
    console.log("🔄 Obteniendo nuevo access token...");
    const tokenData = await getAccessToken();
    cachedToken = tokenData.access_token;
    tokenExpiration = Date.now() + tokenData.expires_in * 1000; // Guardar timestamp de expiración
    return cachedToken;
};

const ensureAuthToken = async (req, res, next) => {
    try {
        if (!cachedToken || Date.now() >= tokenExpiration) {
            cachedToken = await fetchToken();
        }
        req.accessToken = cachedToken; // Almacenar el token en la request
        next();
    } catch (error) {
        res.status(500).json({ fatal: "Error obteniendo el Access Token." });
    }
};

module.exports = ensureAuthToken;