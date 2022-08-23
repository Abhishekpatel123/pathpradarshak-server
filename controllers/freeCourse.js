const coursemodel = require("../models/Course");
const enrollmodel = require("../models/Enrollment");

module.exports = async (req, res) => {
  const { student, course, approved } = req.body;

  if (!student || !course || !approved) {
    return res.status(404).send({ message: "bad request!" });
  }

  try {
    const courseData = await coursemodel.findOne({ _id: course });
    if (courseData.price === "Free") {
      try {
        await enrollmodel.findOneAndUpdate(
          { student, course },
          { rating: 0, approved },
          { upsert: true, new: true }
        );
        await coursemodel.findOneAndUpdate(
          { _id: req.body.course },
          { $inc: { enrolledUsers: 1 } }
        );
        return res.status(200).send({
          message: "successfully enrolled course",
          payment: {
            amount: "Free",
          },
        });
      } catch (error) {
        return res.status(500).send({ message: "server error" });
      }
    }
    return res.status(400).send({ message: "course is paid" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "server error" });
  }
};
