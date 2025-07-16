// src/controllers/users.controller.js

const mongoose = require("mongoose");
const { Users } = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config-local");

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

  if (body.dailyHours == null) {
    err_msg = "Daily hours required";
    return [false, err_msg];
  } else {
    if (typeof body.dailyHours !== "number" || body.dailyHours < 0) {
      err_msg = "Daily hours must be a number and not negative";
      return [false, err_msg];
    }
  }

  if (!body.sesameEmployeeId) {
    err_msg = "Missing Sesame Employee ID";
    return [false, err_msg];
  }

  return [true];
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({ error: "Missing email or password" });
  }

  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "INVALID_CREDENTIALS" });
  }

  const isPasswordMatch = bcrypt.compareSync(password, user.password);
  if (!isPasswordMatch) {
    return res.status(404).json({ error: "INVALID_CREDENTIALS" });
  }

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.json({
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      surnames: user.surnames,
      email: user.email,
      roles: user.roles,
      dailyHours: user.dailyHours,
      sesameEmployeeId: user.sesameEmployeeId,
      assignedTasks: user.assignedTasks,
      imageProfileURL: user.imageProfileURL,
      jobChargeName: user.jobChargeName,
      signature: user.signature,
    },
  });
};

const createUser = async (req, res) => {
  const {
    email,
    password,
    name,
    surnames,
    roles,
    dailyHours,
    sesameEmployeeId,
    imageProfileURL,
    jobChargeName,
    signature,
  } = req.body;

  const [ok, error_msg] = await checkImportantFields(req.body);
  if (!ok) {
    return res.status(406).json({ error: error_msg });
  }

  const hashedPassword = bcrypt.hashSync(password);
  try {
    const user = new Users({
      _id: new mongoose.Types.ObjectId(),
      name,
      surnames,
      password: hashedPassword,
      email,
      roles,
      dailyHours,
      sesameEmployeeId,
      imageProfileURL,
      jobChargeName,
      signature: {},
    });
    await user.save();
    res.status(201).send("User created");
  } catch (error) {
    console.error(error);
    if (error.errorResponse && error.errorResponse.errmsg) {
      return res.status(500).json({ error: error.errorResponse.errmsg });
    }
    return res.status(500).json({ error: "Unexpected error" });
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

// const updateUser = async (req, res) => {
//   try {
//     const user = await Users.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Si viene password, lo hasheamos si es distinto
//     if (req.body.password) {
//       const newPassword = req.body.password;
//       const isSame = bcrypt.compareSync(newPassword, user.password);
//       if (isSame) {
//         return res
//           .status(406)
//           .json({ error: "New password is the current password" });
//       }
//       req.body.password = bcrypt.hashSync(newPassword);
//     }

//     const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(updatedUser);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const replaceUser = async (req, res, next) => {
  try {
    // guarantee the signature field is always present
    if (req.body.signature === undefined) {
      req.body.signature = {};
    }

    const replaced = await Users.findOneAndReplace(
      { _id: req.params.id },
      req.body,
      {
        new: true, // return the new doc
        overwrite: true, // full replace
        runValidators: true,
      }
    );

    if (!replaced) return res.status(404).send("User not found");
    res.json(replaced);
  } catch (err) {
    next(err);
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
    console.error(error);
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
  replaceUser,
  deleteUser,
};
