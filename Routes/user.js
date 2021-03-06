const express = require("express");
const { validateUser, updateUser, User } = require("../Models/User");
const auth = require("../Middelware/auth");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");

// Getting the current user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// Find a particular user
router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) return res.status(400).send("User with given ID not found");
  res.send(user);
});

// Registering user
router.post("/SignUp", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already Registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const token = await user.generateAuthToken();

  await user.save();

  res.header("x-auth-token", token).send(_.pick(user, "email", "name"));
});

// Change name
router.put("/name", auth, async (req, res) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { name: req.body.name } },
    { new: true }
  );

  if (!user) return res.status(400).send("The user with given ID not found");

  res.send(_.pick(user, "email", "name"));
});

// Change password
router.put("/password", auth, async (req, res) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  const oldPW = await bcrypt.compare(req.body.password, user.password);
  if (!oldPW) return res.status(400).send("Invalid old password");

  const newUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { password: req.body.newPW } },
    { new: true }
  );

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newUser.password, salt);

  await user.save();

  res.send(_.pick(newUser, "email", "name"));
});

module.exports = router;
