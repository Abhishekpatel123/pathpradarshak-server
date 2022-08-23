const coursemodel = require("../models/Course");
const enrollmodel = require("../models/Enrollment");

module.exports = async (req, res) => {
  const { student, course, approved, rating } = req.body;
  if (!student || !course || !approved || !rating)
    return res.status(400).send("request body is missing");

  try {
    const doc = await enrollmodel.findOneAndUpdate(
      { student, course },
      { rating: rating || 0, approved: true },
      { upsert: true, new: true }
    );

    const enrolledUsers = await enrollmodel.find({ course });
    let totalRating = 0;
    let ratedUser = 0;
    enrolledUsers.forEach((curr) => {
      if (curr?.rating) {
        totalRating += curr.rating;
        ratedUser++;
      }
    });
    const Frating = totalRating / ratedUser;
    await coursemodel.findOneAndUpdate(
      { _id: req.body.course },
      { rating: Frating }
    );
    res.status(200).send(doc);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "something went wrong" });
  }
};
