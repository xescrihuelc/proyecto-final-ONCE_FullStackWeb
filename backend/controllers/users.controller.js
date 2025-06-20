const { Users } = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

// backend/controllers/users.controller.js

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

    const token = jwt.sign({ userId: user._id }, "tortilladepatata"); // o tu JWT_SECRET real

    res.json({
        user: {
            id: user._id,
            email: user.email,
            role: user.role || "trabajador", // por si no tiene rol aún
        },
        token,
    });
};

const createUser = async (req, res) => {
    // Recibir email y password
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({ error: "Missing email or password" });
    }
    // Hashear password
    const hashedPassword = bcrypt.hashSync(password);
    // Añadir usuario en la DB
    try {
        const user = new Users({
            _id: new mongoose.Types.ObjectId(),
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

module.exports = {
    loginUser: login,
    login,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
};
