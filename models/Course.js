const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    instructor: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: Schema.Types.String, ref: "Category" },
    thumbnail: { type: String, required: true },
    enrolledUsers: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    price: { type: String, required: true, default: "Free" },
    duration: { type: Array },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = Course = mongoose.model("courses", CourseSchema);
