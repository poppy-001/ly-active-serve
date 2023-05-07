const Activity = require("../model/Activity");

// 获取活动列表
async function getActivityList(type = "", feature = "", username = "") {
  let allObj = {};
  if (type) {
    allObj.activity_type = type;
  }
  if (feature) {
    allObj.feature = feature;
  }
  if (username) {
    allObj.activity_publisher_username = username;
  }
  const list = await Activity.find(allObj
  ).sort({ _id: -1 });
  return list;
}

// 获取活动详情
async function getActivityInfo(id) {
  try {
    const list = await Activity.findOne({ _id: id });
    return list;
  } catch (error) {
    return
  }
}



// 发布活动
async function createActivity(activeInfo, username) {
  activeInfo.activity_publisher_username = username
  const newActivity = await Activity.create(activeInfo)
  return newActivity
}

// 删除活动
async function delActive(id, username) {
  try {
    const activeInfo = await Activity.findOne({ _id: id });
    if (!activeInfo) return
    if (username === activeInfo.activity_publisher_username) {
      const removeActiveInfo = await Activity.findOneAndRemove({ _id: id });
      console.log(removeActiveInfo);
      return removeActiveInfo
    } else {
      return 1
    }
  } catch (error) {
    return
  }

}

//更新活动信息
async function updataActivityInfo(id, username, activeInfo) {
  console.log("id---");
  console.log("id---", id);
  try {
    const active = await Activity.findOne({ _id: id });
    console.log(active);
    if (!active) return
    if (username === active.activity_publisher_username) {
      const updateActiveInfo = await Activity.findOneAndUpdate({ _id: id }, activeInfo, { new: true });
      console.log("-----------------------", updateActiveInfo);
      return updateActiveInfo
    } else {
      return 1
    }
  } catch (error) {
    console.log("error");
    console.log(error);
    return
  }
}

//获取我收藏的活动
async function getMyCollectList(activityList, username) {
  let collectList = []
  activityList.forEach(active => {
    active.collect_userList.forEach(name => {
      if (name === username) {
        collectList.push(active)
      }
    })
  });

  return collectList
}

// 收藏活动
async function collectActive(flag, id, username) {
  const activeInfo = await Activity.findOne({ _id: id });
  console.log("activeInfo---------", activeInfo);
  let new_collect_userList = activeInfo.collect_userList
  if (flag) {
    if (new_collect_userList.indexOf(username) !== -1) {
      return "已收藏，无法重复收藏"
    }
    new_collect_userList.push(username)
  } else {
    if (new_collect_userList.indexOf(username) === -1) {
      return "暂未收藏，无法取消"
    }
    new_collect_userList = new_collect_userList.filter(name => name !== username)
  }
  const res = await Activity.findOneAndUpdate(
    { _id: id },
    { collect_userList: new_collect_userList },
    { new: true }
  )
  return res

}

module.exports = {
  getActivityList,
  createActivity,
  getActivityInfo,
  delActive,
  updataActivityInfo,
  getMyCollectList,
  collectActive
};
