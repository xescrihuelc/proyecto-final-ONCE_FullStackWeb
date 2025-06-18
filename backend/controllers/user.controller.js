const { User } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

//
const login = async (req, res) => {
    //
    // Recibir username y passwd
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(404).send("Missing username or password");
        return;
    }
    // Validar que el username exista
    const user = await User.findOne({ username: username });
    if (!user) {
        res.status(404).send("INVALID_CREDENTIALS");
        return;
    }
    // Validar que el password del username sea la misma que el recibido
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
        res.status(404).send("INVALID_CREDENTIALS");
        return;
    }

    // Generar token con el userId en el payload .sign() y un JWT secret
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.send({ Token: accessToken });
};
//
const register = async (req, res) => {
    // Recibir username yb password
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(404).send("Missing username or password");
    }
    // Hashear password
    const hashedPassword = bcrypt.hashSync(password);
    // Añadir usuario en la DB
    try {
        const user = new User({ username: username, password: hashedPassword });
        await user.save();
        res.status(201).send("User registred");
    } catch (error) {
        console.log(error);
        if (error.errorResponse.errmsg) {
            res.status(500).send(error.errorResponse.errmsg);
        } else {
            res.status(500).send("Unexpected error");
        }
    }
};

module.exports = { login, register };
