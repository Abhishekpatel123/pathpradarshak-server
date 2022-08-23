const enrollmodel = require("../../models/Enrollment");
const coursemodel = require("../../models/Course");
const usermodel = require("../../models/User");
const express = require("express");
const lecturemodel = require("../../models/Lecture.js");
const controllers = require("../../controllers");
const auth = require("../../middlewares/auth");
const passport = require("passport");

let router = express.Router();

router.get("/enrollments", (req, res, next) => {
  enrollmodel
    .find()
    .populate({ path: "student", model: "users" })
    .populate({ path: "course", model: "courses", select: "courseName" })

    .exec(function (err, results) {
      if (err) {
        return next(err);
      }
      if (results) {
        return res.json(results);
      }
    });
});

router.get(
  "/enrollmentbystudent",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user);
    enrollmodel
      .find({
        student: req.query.id,
      })
      .populate({ path: "course", model: "courses" })
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
);

router.get("/checkenrollment", async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    console.log(studentId, courseId);
    if (!courseId) throw error;

    const course = await coursemodel
      .findOne({ _id: courseId })
      .populate({ path: "instructor", model: "users" });

    let isUserEnrolled = false;

    if (studentId && studentId !== undefined && studentId !== "undefined") {
      console.log("if con", studentId == undefined, studentId?.length);
      isUserEnrolled = await enrollmodel
        .findOne({ student: studentId, course: courseId })
        .populate({ path: "course", model: "courses", select: "courseName" });
    }

    let lectures = await lecturemodel.find({ course: courseId }).populate({
      path: "course",
      model: "courses",
      select: "courseDescription",
    });

    if (!isUserEnrolled && lectures && lectures.length > 2)
      lectures = lectures.splice(2);
    res.json({ lectures, isUserEnrolled, course });
  } catch (error) {
    console.log(error);
  }
});

router.post("/enroll/add", (req, res) => {
  if (!req.body) {
    return res.status(400).send("request body is missing");
  }
  usermodel.find({ email: req.body.student }, function (error, cat) {
    if (!error && cat) {
      console.log(cat);
      req.body.student = cat[0]._id;
    }
    coursemodel.find({ courseName: req.body.course }, function (error, cat) {
      if (!error && cat) {
        console.log(cat);
        req.body.course = cat[0]._id;
      }

      let model = new enrollmodel(req.body);
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
    });
  });
});

// PAY
router.post("/razorpay/create-order-id", controllers.createOrder);
router.post("/enrollbystudent/create-paid-course", controllers.paidCourse);
router.post("/enrollbystudent/create-free-course", controllers.freeCourse);
router.post("/enrollbystudent/rate-course", controllers.rateCourse);

router.delete("/enrollment", (req, res) => {
  //var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

  enrollmodel
    .findOneAndRemove({
      _id: req.query.id,
    })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
