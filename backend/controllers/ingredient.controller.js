const { Ingredient } = require("../models/ingredient.model");

const createIngredient = async (req, res) => {
    //
    try {
        const createdIngredient = new Ingredient({
            ...req.body,
            userId: req.user._id,
        });
        await createdIngredient.save();
        res.send(createdIngredient);
    } catch (error) {
        // TODO: Improbe error building
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};
//

const patchIngredient = async (req, res) => {
    // $url/:id
    try {
        const patchedIngredient = await Ingredient.updateOne(req.body).where({
            _id: req.params.id,
        });
        console.log(patchedIngredient);
        res.send(patchedIngredient);
    } catch (error) {
        // TODO: Improbe error building
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};

const deleteIngredient = async (req, res) => {
    // $url/:id
    try {
        console.log(req.body);
        const patchedIngredient = await Ingredient.deleteOne({
            _id: req.params.id,
        });
        console.log(patchedIngredient);
        res.send(patchedIngredient);
    } catch (error) {
        // TODO: Improbe error building
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};

const getIngredient = async (req, res) => {
    try {
        const obtainedIngredient = await Ingredient.find();
        res.send(obtainedIngredient);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};

module.exports = {
    createIngredient,
    patchIngredient,
    deleteIngredient,
    getIngredient,
};
