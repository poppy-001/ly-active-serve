const Comment = require("../model/Comment");

// 创建留言
async function createComment(content, username) {
  const newComment = await Comment.create({
    content,
    username,
  });

  return newComment;
}

//获取留言列表
async function getList(username = "") {
  let allObj = {};
  if (username) {
    allObj.username = username;
  }
  const list = await Comment.find(allObj).sort({ _id: -1 });
  return list;
}

// 删除留言

async function delComment(_id, username) {
  await Comment.findOneAndRemove({
    _id,
    username,
  });
}

// 编辑留言

async function UpdateComment(_id, content, username) {
  const updateCom = await Comment.findOneAndUpdate(
    { _id, username },
    { content },
    { new: true }
  );

  return updateCom;
}

module.exports = {
  createComment,
  getList,
  delComment,
  UpdateComment,
};
