const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoute = require("./routes/user.route");
require("./config/connect_db")();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
	res.send("Hello");
});

app.use("/api", userRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}@http://localhost:${PORT}`);
});
