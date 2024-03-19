const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
	},
	email: {
		type: String,
	},
	password: {
		type: String,
	},
	addedOn: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("User", UserSchema);
