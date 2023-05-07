const mongoose = require("../db/db");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20
    },
    stu_num: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 10
    },
    password: {
      type: String,
      required: true,
    },
    age: Number,
    city: String,
    gender: {
      type: Number,
      default: 0, //0保密1男2女
      enum: [0, 1]
    },
    user_pic: {
      type: String,
      default: "http://localhost:3000/uploads/user/person.png"
    },
    mobile: {
      type: Number,
      unique: true,
    },
    grade: String,
    college: String,
    major: String
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);
module.exports = User;
