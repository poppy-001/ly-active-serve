const User = require("../model/User");

async function getUserInfo(username) {
  const res = await User.findOne({ username });
  return res;
}

async function updataUserInfo(username, userInfo) {
  try {
    if (userInfo.mobile) {
      const hasThisMobile = await User.findOne({ mobile: userInfo.mobile });
      if (hasThisMobile && hasThisMobile.username !== username) return 2
    }

    const oldUserInfo = await User.findOne({ username });
    console.log(oldUserInfo);
    if (!oldUserInfo) return
    if (username === oldUserInfo.username) {
      const updateActiveInfo = await User.findOneAndUpdate({ username }, userInfo, { new: true });
      console.log(updateActiveInfo);
      return updateActiveInfo
    } else {
      return 1
    }
  } catch (error) {
    console.log(error);
    return
  }
}

module.exports = {
  getUserInfo,
  updataUserInfo
};
