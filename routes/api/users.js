const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//Load user model for email exist checking
const keys = require("../../config/keys");
const User = require("../../models/User");
const ContactUs = require("../../models/ContactUs");
const passport = require("passport");
const Hogan = require("hogan.js");
const fs = require("fs");
const sendMail = require("../../emails/sendMail");
const auth = require("../../middlewares/auth");
const adminAuth = require("../../middlewares/adminAuth");
//Load input  validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

var changePassword = fs.readFileSync(
  __dirname + "/views/changePassword.hjs",
  "utf-8"
);
var compiledChangePassword = Hogan.compile(changePassword);

// @route  GET   api/users/register
// @desc   Register users route
// @access Public

var verificationMail = fs.readFileSync(
  __dirname + "/views/verficationMail.hjs",
  "utf-8"
);
var compiledVerificationMail = Hogan.compile(verificationMail);

router.post("/users/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    errors.message = "Email already exists";
    return res.status(400).json(errors);
  }
  const payload = { ...req.body };
  try {
    let token = await jwt.sign(payload, keys.secretOrKey, {
      expiresIn: 3600,
    });

    const activationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

    // non blocking process
    await sendMail(
      req.body.email,
      "Account Activation Email",
      compiledVerificationMail.render({ url: activationUrl })
    );

    res
      .status(200)
      .send({ message: "Check you email for activate your account" });
  } catch (error) {
    console.log(error, "error");
    return res.status(500).send({ message: "Server erro" });
  }
});

router.post("/verifying-email", async (req, res) => {
  const { token } = req.body;
  console.log(token, "token");
  if (!token) return res.status(400).send({ message: "bad request" });

  try {
    const user = await jwt.verify(token, keys.secretOrKey);
    console.log(user, "user");
    if (!user) return res.status(400).send({ message: "Invalid token" });

    const newUser = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: user.password,
      role: user.role,
    });

    const hash = bcrypt.hashSync(newUser.password, 10);
    newUser.password = hash;
    await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    return res.status(400).send({ message: "Invalid token" });
  }
});

// change password
router.post("/users/change-password", async (req, res) => {
  let errors = {};
  const { oldPassword, newPassword, email } = req.body;
  if (!newPassword || !oldPassword) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    //Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      errors.email = "User not found";
      return res.status(404).json({ message: "bad request" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log(isMatch);

    if (!isMatch) {
      errors.password = "Password incorrect";
      return res.status(400).json({});
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    let savedUser = await user.save();
    console.log(req.body, savedUser);
    res.json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errors);
  }
});

// change password2
router.post("/users/change-password2", async (req, res) => {
  let errors = {};
  console.log(req.body);
  const { password, token } = req.body;
  if (!password || !token) {
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    //Find user by email
    const { email } = await jwt.verify(token, keys.secretOrKey);
    const user = await User.findOne({ email });

    if (!user) {
      errors.email = "User not found";
      return res.status(404).json({ message: "bad request" });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    let savedUser = await user.save();
    console.log(req.body, savedUser);
    res.json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json(errors);
  }
});

// @route  GET   api/users/login
// @desc   Login users route => returning jwt token
// @access Public

router.post("/users/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email }).then((user) => {
    console.log(req.body, user);
    if (!user) {
      errors.message = "User not found";
      return res.status(404).json(errors);
    }
    //check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //User Match

        //Create jt payload
        const payload = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
          role: user.role,
          email: user.email,
        };
        //Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
            });
          }
        );
      } else {
        errors.message = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// forgot password
router.post("/users/forgot-password", async function (req, res) {
  let errors = {};
  console.log(req.body, "email ");
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    //Create jt payload
    const payload = { email: user.email };

    //Sign token
    let token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 });
    console.log(token, user);
    const changePasswordUrl = `${process.env.CLIENT_URL}/change-password/${token}`;

    // non blocking process
    await sendMail(
      user?.email,
      "Forgot Password email",
      compiledChangePassword.render({ url: changePasswordUrl })
    );

    res.json({
      success: true,
      token: "Bearer " + token,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  } catch (error) {
    return res.status(400).json(errors);
  }
});
// @route  GET   api/users/current
// @desc   Return/retrive the current user from the token
// @access Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // res.json(req.user);
    res.json({
      id: req.user.id,
      first_name: req.user.first_name,
      email: req.user.email,
    });
  }
);

router.get("/users", adminAuth, (req, res) => {
  User.find()
    .then((doc) => {
      // res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
      res.setHeader("Content-Range", "users 0-5/5");
      res.json(doc);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.post(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (!req.body) {
      return res.status(400).send("request body is missing");
    }

    let model = new User(req.body);
    model
      .save()
      .then((doc) => {
        if (!doc || doc.length === 0) {
          return res.status(500).send(doc);
        }
        res.status(200).send(doc);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.headers["authorization"], "auth", req.user);
    res.status(200).send(req.user);
    // User.findOne({
    //   _id: req.query.id,
    // })
    //   .then((doc) => {
    //     res.json(doc);
    //   })
    //   .catch((err) => {
    //     res.status(500).json(err);
    //   });
  }
);

// update user
router.put(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true })
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

router.delete(
  "/user",
  passport.authenticate("jwt", { session: false }),

  (req, res) => {
    User.findOneAndRemove({
      _id: req.query.id,
    })
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

// contact us
router.post("/contact-us", async (req, res) => {
  try {
    const data = new ContactUs(req.body);
    let saved = await data.save();
    console.log(saved, "saved");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
