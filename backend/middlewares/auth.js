const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { User } = require("../models/user.model");

const auth = async (req, res, next) => {
    // Recoger token del Header Autorization
    const token = req.headers.authorization;

    // No Token => 401
    if (!token) {
        res.status(401).send("Missing auth header");
        return;
    }
    // Verificar Token con jwt secret
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload) {
        res.status(401).send("Invalid auth header");
    }

    // Obtener userId del payload
    const userId = payload.userId;

    // Prevenir edge case: Find del userId
    const user = await User.findById(userId);
    if (!user) {
        res.status(401).send("Invalid user");
    }
    // Guardo userId en la request para recogerlo en los controllers
    //  e identificar el usuario que hizo request
    req.user = user;
    next();
};

module.exports = { auth };
