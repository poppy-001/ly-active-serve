const mongoose = require("../db/db");

const ActivitySchema = mongoose.Schema(
  {
    activity_title: {
      type: String,
      required: true,
    },
    activity_img: {
      type: Object,
      required: true,
    },
    activity_publisher_username: String,
    activity_desc: {
      type: String,
      required: true,
      default: "快来参加吧",
    },
    activity_type: {
      type: Number,
      default: 0, //0其他1学院类2社团类3校园类
      enum:[0,1,2,3]
    },
    activity_starttime: {
      type: String,
      required: true,
    },
    activity_address: {
      type: Array,
      required: true,
    },
    activity_detailAddress: String,
    collect_userList: {
      type: Array,
      default: [],
    },
    signUp:{
      type:String,
      required:true
    },
    status: {
      type: Number,
      default: 0, //0未开始1进行中2已结束
    },
    feature: String
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model("activity", ActivitySchema);
module.exports = Activity;
