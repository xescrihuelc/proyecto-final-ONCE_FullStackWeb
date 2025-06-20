const { Users } = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { default: mongoose } = require("mongoose");

const login = async (req, res) => {
    //
    // Recibir username y passwd
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({ error: "Missing email or password" });
    }
    // Validar que el email exista
    const user = await Users.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ error: "INVALID_CREDENTIALS" });
    }
    // Validar que el password del email sea la misma que el recibido
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
        return res.status(404).json({ error: "INVALID_CREDENTIALS" });
    }

    // Generar token con el userId en el payload .sign() y un JWT secret
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.send({ Token: accessToken });
};

const createUser = async (req, res) => {
    // Recibir email, password y name
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(404).json({ error: "Missing email or password" });
    }
    if (!name) {
        return res.status(404).json({ error: "Missing required name" });
    }
    // Hashear password
    const hashedPassword = bcrypt.hashSync(password);
    // Añadir usuario en la DB
    try {
        const user = new Users({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            email: email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).send("User created");
    } catch (error) {
        console.log(error);
        if (error.errorResponse.errmsg) {
            return res.status(500).json({ error: error.errorResponse.errmsg });
        } else {
            return res.status(500).json({ error: "Unexpected error" });
        }
    }
};

const getAllUsers = async (req, res) => {
    const users = await Users.find();
    res.json(users);
};

const getUserById = async (req, res) => {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
};

const updateUser = async (req, res) => {
    const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
};

module.exports = { login, createUser, getAllUsers, getUserById, updateUser };
