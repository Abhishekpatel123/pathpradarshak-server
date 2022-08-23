const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema(
  {
    no: {
      type: Number,
      default: 1,
      required: false,
    },
    student: { type: Schema.Types.ObjectId, ref: "users" },
    course: { type: Schema.Types.ObjectId, ref: "courses" },
    approved: {
      type: Boolean,
      default: true,
      required: false,
    },
    rating: {
      default: 0,
      type: Number,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = Enrollment = mongoose.model("enrollments", EnrollmentSchema);
