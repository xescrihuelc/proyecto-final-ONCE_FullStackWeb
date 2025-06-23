const mongoose = require("mongoose");
const { Users } = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const checkImportantFields = async (body) => {
    let err_msg;

    if (!body.email || !body.password) {
        err_msg = "Missing email or password";
        return [false, err_msg];
    }

    if (!body.name || !body.surnames) {
        err_msg = "Missing required name or surnames";
        return [false, err_msg];
    }

    if (!body.roles) {
        err_msg = "Missing required roles";
        return [false, err_msg];
    }

    if (!body.dailyHours) {
        err_msg = "Daily hours required";
        return [false, err_msg];
    } else {
        if (typeof body.dailyHours !== "number" || body.dailyHours < 0) {
            err_msg = "Daily hours must be a number and not negative";
            return [false, err_msg];
        }
    }

    return [true];
};

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

    const arePresentImportantFields = await checkImportantFields(req.body);

    if (arePresentImportantFields[0] == false) {
        const error_msg = arePresentImportantFields[1];
        return res.status(406).json({ error: `${error_msg}` });
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
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        //If exists password field on body, it will be hashed
        if (req.body.password) {
            const newPassword = req.body.password;
            const currentPassword = user.password;
            const isPasswordMatch = bcrypt.compareSync(
                newPassword,
                currentPassword
            );

            // If new password is the same as current password, return error
            if (isPasswordMatch) {
                return res
                    .status(406)
                    .json({ error: "New password is the current password" });
            }
            req.body.password = bcrypt.hashSync(req.body.password);
        }

        const updatedUser = await Users.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await Users.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User deleted successfully",
            user: deletedUser,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
};

module.exports = {
    loginUser: login,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
