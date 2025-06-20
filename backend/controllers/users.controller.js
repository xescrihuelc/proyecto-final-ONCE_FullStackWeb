const { Users } = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const mongoose = require("mongoose");

// Login
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Faltan datos" });
    }

    const user = await Users.findOne({ email: email });
    if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({
        user: {
            id: user._id,
            email: user.email,
            role: user.roles?.[0] || "user",
        },
        token,
    });
};

// Crear usuario
const createUser = async (req, res) => {
    const {
        name,
        surnames,
        email,
        password,
        roles = ["user"],
        dailyHours,
        isActive = true,
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: "Faltan campos obligatorios (name, email, password)",
        });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = new Users({
            _id: new mongoose.Types.ObjectId(),
            name,
            surnames,
            email,
            password: hashedPassword,
            roles,
            dailyHours,
            isActive,
        });

        await user.save();
        res.status(201).send("Usuario creado con éxito");
    } catch (error) {
        console.error("Error al crear usuario:", error);

        const mensaje =
            error.code === 11000
                ? "Ya existe un usuario con ese email"
                : error.message || "Error inesperado";

        res.status(500).json({ error: mensaje });
    }
};

const getAllUsers = async (req, res) => {
    const users = await Users.find().select("-password");
    res.json(users);
};

const getUserById = async (req, res) => {
    const user = await Users.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
};

const updateUser = async (req, res) => {
    const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
};

module.exports = {
    loginUser: login,
    login,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
};
