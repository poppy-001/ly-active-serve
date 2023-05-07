const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017";
const dbName = "ly_active";

mongoose.connect(`${url}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;

conn.on("error", (err) => {
  console.error("mongoose连接出错了", err);
});

module.exports = mongoose;
