require("express-async-errors");
const express = require("express");
const app = express();
const winston = require("winston");
const mongoose = require("mongoose");
const user = require("./Routes/user");
const auth = require("./Routes/auth");
const book = require("./Routes/book");
const keys = require("./Config/keys");
const cors = require("cors");

mongoose
  .connect(keys.mongoURI)
  .then(() => console.log("Connected to Book-Store DB"))
  .catch(err => console.log("Error while connecting DB", err));

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const corsOptions = {
  exposedHeaders: "x-auth-token"
};

app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use("/api/users", user);
app.use("/api/auth", auth);
app.use("/api/books", book);

module.exports = server;
