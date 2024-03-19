const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userModel = require("../models/user.model");
const { jwtVerification } = require("../utils/jwtVerification");

const Router = require("express").Router();

Router.route("/signup").post(
	[
		body("username").notEmpty(),
		body("email").isEmail(),
		body("password").isLength({ min: 3 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		const { username, email, password } = req.body;

		if (!errors.isEmpty()) {
			return res.status(400).json({ error: "Invalid data", errors });
		}

		try {
			let existingUser = await userModel.findOne({
				$or: [{ username }, { email }],
			});

			if (existingUser) {
				if (existingUser.username === username) {
					return res
						.status(409)
						.json({ error: "Username already exists." });
				} else {
					return res
						.status(409)
						.json({ error: "Email already exists." });
				}
			}
		} catch (e) {
			console.log(e);
			return res.status(500).json({
				error: "Internal server error",
				section: "find existing user",
			});
		}

		try {
			const salt = await bcrypt.genSalt();
			const hash = await bcrypt.hash(password, salt);

			const nUser = await userModel.create({
				username: username,
				email: email,
				password: hash,
			});

			const token = jwt.sign(
				{
					id: nUser.id,
				},
				process.env.JWT,
				{ expiresIn: "1h" },
			);

			return res.status(200).json({ error: null, token: token });
		} catch (e) {
			console.log(e);
			return res.status(500).json({
				error: "Internal server error",
				section: "create user",
			});
		}
	},
);

Router.post(
	"/login",
	[body("identifier").notEmpty(), body("password").notEmpty()],
	async (req, res) => {
		const errors = validationResult(req);
		const { identifier, password } = req.body;

		if (!errors.isEmpty()) {
			return res.status(400).json({ error: "Invalid data", errors });
		}

		try {
			const user = await userModel.findOne({
				$or: [{ email: identifier }, { username: identifier }],
			});

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				return res.status(401).json({ error: "Incorrect password" });
			}

			const token = jwt.sign(
				{ userId: user._id },
				process.env.JWT_SECRET,
				{
					expiresIn: "1h",
				},
			);

			res.status(200).json({ token });
		} catch (e) {
			console.error(e);
			res.status(500).json({ error: "Internal server error" });
		}
	},
);

Router.route("/authVerificationTest").get(jwtVerification, (req, res) => {
	res.send("You're authorized");
});

module.exports = Router;
