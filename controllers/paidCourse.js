const crypto = require("crypto");
const enrollmodel = require("../models/Enrollment");
const coursemodel = require("../models/Course");

module.exports = async (req, res) => {
  //req.body
  const { payment, student, course, approved } = req.body;
  if (
    !payment ||
    !payment.razorpay_payment_id ||
    !payment.razorpay_order_id ||
    !payment.razorpay_signature ||
    !student ||
    !course ||
    !approved
  )
    return res.status(400).send("request body is missing");

  try {
    let hmac = crypto.createHmac("sha256", process.env.RAZORYPAY_SECRET);
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    console.log(generated_signature, payment.razorpay_signature);
    if (payment.razorpay_signature !== generated_signature) {
      res.json({ success: false, message: "Payment verification failed" });
    }
    const doc = await enrollmodel.findOneAndUpdate(
      { student, course },
      { rating: 0, approved: true },
      { upsert: true, new: true }
    );
    await coursemodel.findOneAndUpdate(
      { _id: req.body.course },
      { $inc: { enrolledUsers: 1 } }
    );
    res.status(200).send(doc);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Someting went wrong", err: err });
  }
};
