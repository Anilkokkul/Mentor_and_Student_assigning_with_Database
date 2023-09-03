const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter the student name"],
    },
    email: {
      type: String,
      unique: [true, "email already exist"],
      required: [true, "please enter the email"],
    },
    course: {
      type: String,
      required: [true, "please enter the course name"],
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
