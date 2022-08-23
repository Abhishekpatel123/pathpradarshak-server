const shortid = require("shortid");
const Razorpay = require("razorpay");
const coursemodel = require("../models/Course");


const instance = new Razorpay({
  key_id: process.env.RAZORYPAY_KEY,
  key_secret: process.env.RAZORYPAY_SECRET,
});

module.exports = async (req, res) => {
  const { courseId, data } = req.body;
  if (!data.student || !data.course || !data.approved || !courseId) {
    return res.status(404).send({ message: "bad request!" });
  }

  try {
    const course = await coursemodel.findOne({ _id: courseId });
    var options = {
      amount: (course.price * 100).toString(), // amount in the smallest currency unit
      currency: "INR",
      receipt: shortid.generate(),
      payment_capture: 1,
    };
    result = await instance.orders.create(options);
    res.status(200).send({
      payment: {
        id: result.id,
        currency: result.currency,
        amount: result.amount,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: "soming went wrong", error: error });
  }
};
