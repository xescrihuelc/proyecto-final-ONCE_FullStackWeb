const { Template } = require("../models/template.model");

const createTemplate = async (req, res) => {
    //
    try {
        const createdTemplate = new Template({
            ...req.body,
            userId: req.user._id,
        });
        await createdTemplate.save();
        res.send(createdTemplate);
    } catch (error) {
        // TODO: Improbe error building
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};
//

const patchTemplate = async (req, res) => {
    // $url/:id
    try {
        const patchedTemplate = await Template.updateOne(req.body).where({
            _id: req.params.id,
        });
        console.log(patchedTemplate);
        res.send(patchedTemplate);
    } catch (error) {
        // TODO: Improbe error building
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};

const deleteTemplate = async (req, res) => {
    // $url/:id
    try {
        console.log(req.body);
        const patchedTemplate = await Template.deleteOne({
            _id: req.params.id,
        });
        console.log(patchedTemplate);
        res.send(patchedTemplate);
    } catch (error) {
        // TODO: Improbe error building
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};

const getTemplate = async (req, res) => {
    try {
        const obtainedTemplate = await Template.find();
        res.send(obtainedTemplate);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.name, message: error._message });
    }
};

module.exports = {
    createTemplate,
    patchTemplate,
    deleteTemplate,
    getTemplate,
};
