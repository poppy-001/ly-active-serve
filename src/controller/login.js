const User = require("../model/User");
const bcrypt = require("bcryptjs");

// 注册用户
async function register(userInfo) {
  const res = await User.find({
    $or: [{ username: userInfo.username }, { stu_num: userInfo.stu_num }],
  });
  if (res.length > 0) {
    return false;
  } else {
    const newUser = await User.create(userInfo);

    return newUser;
  }
}

// 用户登录
async function login(username, password) {
  console.log(11111111111111);

  const res = await User.findOne({
    $or: [{ username: username }, { stu_num: username }],
  });
  console.log(11111111111111);

  console.log("res=======", res);

  if (res == null) {
    return false;
  } else {
    const compareResult = bcrypt.compareSync(password, res.password);
    if (compareResult) {
      return res;
    } else {
      return "用户密码错误";
    }
  }
}

async function resetpwd(mobile, newPwd, oldPwd, flag) {
  // 验证旧密码是否匹配
  let user;
  if (flag) {
    console.log(123);
    user = await User.findOne({
      username: mobile
    });
  } else {
    user = await User.findOne({
      mobile
    });
  }
  if (user == null) {
    return {
      status: 404,
      message: "用户不存在"
    }
  }

  if (oldPwd) {

    const isMatch = await bcrypt.compare(oldPwd, user.password);
    if (!isMatch) {
      return {
        status: 400,
        message: "用户密码错误"
      };
    }
  }
  const isEqual = await bcrypt.compare(newPwd, user.password);
  if (isEqual) {
    return {
      status: 400,
      message: "密码未更改"
    };
  }
  // 对新密码进行哈希处理
  const hashedPassword = bcrypt.hashSync(newPwd, 10);

  // 更新数据库中该用户的密码信息
  let res;
  if (flag) {
    res = await User.findOneAndUpdate({ username: mobile }, { password: hashedPassword }, { new: true });

  } else {
    res = await User.findOneAndUpdate({ mobile }, { password: hashedPassword }, { new: true });

  }

  return {
    status: 201,
    data: res
  }

}

module.exports = {
  register,
  login,
  resetpwd

};
