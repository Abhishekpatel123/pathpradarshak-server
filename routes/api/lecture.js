const express = require("express");
const router = express.Router();
const courseModel = require("../../models/Course.js");
// const fileUpload = require('express-fileupload');
//mongoose
const mongoose = require("mongoose");
var multer = require("multer");
let lectureModel = require("../../models/Lecture.js");
const passport = require("passport");

/*Get videos*/
router.get(
  "/lectures",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    lectureModel
      .find({
        course: req.query.id,
      })
      .populate({
        path: "course",
        model: "courses",
        select: "courseDescription",
      })
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

router.post(
  "/lectures/localupload",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    console.log(req.body);
    const duration = req.body.duration;
    const upload = new lectureModel(req.body);
    await upload.save();

    await courseModel.updateOne(
      { _id: req.body.course },
      { $push: { duration } }
    );

    res.send("this is post route upload");
  }
);

router.post(
  "/lectures/youtubeupload",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (!req.body) {
      return res.status(400).send("request body is missing");
    }

    let model = new lectureModel(req.body);
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

module.exports = router;
