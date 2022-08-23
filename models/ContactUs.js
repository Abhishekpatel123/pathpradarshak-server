const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactUsSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
); //automatically add while insert or update the object

module.exports = ContactUs = mongoose.model("contact-us", ContactUsSchema);
