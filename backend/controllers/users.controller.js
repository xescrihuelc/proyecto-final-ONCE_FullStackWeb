const { mongoose } = require("mongoose");
const { Users } = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

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
    // Recibir email, password, name, surnames, roles, dailyHours, assignedTasks
    const {
        email,
        password,
        name,
        surnames,
        roles,
        dailyHours,
        assignedTasks,
    } = req.body;
    if (!email || !password) {
        return res.status(404).json({ error: "Missing email or password" });
    }

    if (!name || !surnames) {
        return res
            .status(404)
            .json({ error: "Missing required name or surnames" });
    }

    if (!roles) {
        return res.status(404).json({ error: "Missing required roles" });
    }

    if (!dailyHours) {
        return res.status(404).json({ error: "Daily hours required" });
    } else {
        if (typeof dailyHours !== "number" || dailyHours < 0) {
            return res.status(406).json({
                error: "Daily hours must be a number and not negative",
            });
        }
    }

    // Hashear password
    const hashedPassword = bcrypt.hashSync(password);
    // Añadir usuario en la DB
    try {
        const user = new Users({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            surnames: surnames,
            password: hashedPassword,
            email: email,
            roles: roles,
            dailyHours: dailyHours,
            assignedTasks: assignedTasks,
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
