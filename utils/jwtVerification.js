const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.jwtVerification = async (req, res, next) => {
	const { token } = req.headers;

	if (!token) {
		return res
			.status(401)
			.send({ auth: false, message: "No token provided." });
	}

	try {
		const verify = await jwt.verify(token, process.env.JWT);

		if (!verify) {
			return res.status(403).send({
				auth: false,
				message: "Failed to authenticate token.",
			});
		}

		req.user = verify;
		next();
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "Internal server error" });
	}
};
