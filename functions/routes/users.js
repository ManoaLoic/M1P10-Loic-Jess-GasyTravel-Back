const auth = require("../middleware/auth");
const { User, validate } = require("../model/Users");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.post("/device-token", async (req, res) => {
    try {
        const { id, deviceToken } = req.body;

        if (!id || !deviceToken) {
            return res.status(400).json({ error: "id and deviceToken are required." });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        user.deviceToken = deviceToken;
        await user.save();

        return res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred." });
    }
});

router.post("/", async (req, res) => {
    try {
        req.body.userType = {
            "_id":"64c8fc1787e1047a870d2f37"
        };
        console.log('body',req.body);
        const { error } = validate(req.body);
        if (error) return res.status(500).send(error.details[0].message);

        const user = new User(req.body);

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        res.send(user);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }
});


module.exports = router;

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -__v");
        res.send(user);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }
});

module.exports = router;