const router = require("koa-router")();

const { getActivityList, createActivity, delActive, updataActivityInfo, getMyCollectList, collectActive } = require("../controller/activity");
const jwt = require("jsonwebtoken");
const multer = require('@koa/multer');
const path = require('path');
const fs = require("fs")

router.prefix("/active");

// 获取我发布的活动列表
router.get("/getMyActivityList", async (ctx, next) => {
  let token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = {
      status: "403",
      message: "token过期，请重新登录"
    }
    return
  } else {

    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");
    console.log(tokenItem);

    const myActivityList = await getActivityList("", "", tokenItem.username);
    ctx.body = {
      status: 200,
      data: myActivityList,
    };
  }
});
let fileName = "";
// 设置文件上传目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/active'));
  },
  filename: function (req, file, cb) {
    console.log("file---------------", file);
    const ext = path.extname(file.originalname);
    const name = decodeURIComponent(file.originalname)
    const basename = name.replace(/\.[^/.]+$/, '');
    fileName = `${basename}-${Date.now()}${ext}`
    cb(null, fileName);
  }
});
// 设置文件上传中间件
const upload = multer({ storage: storage });

// 发布活动
router.post("/createActivity", upload.single('file'), async (ctx, next) => {
  let token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = {
      status: "403",
      message: "token过期，请重新登录"
    }
    return
  } else {

    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");
    const activeInfo = JSON.parse(ctx.request.body.active)
    console.log(activeInfo);
    console.log("fileName123", fileName);


    if (fileName != "") {
      console.log("有图片");
      let pathh = 'http://localhost:3000/uploads/active/' + fileName
      activeInfo.activity_img = pathh;
    }


    const newActivity = await createActivity(activeInfo, tokenItem.username);

    if (newActivity) {
      ctx.body = {
        status: 201,
        message: "发布成功",
        data: newActivity
      };
    } else {
      ctx.body = {
        status: 500,
        message: "创建失败，请稍后再试",
      };
    }
  }
});

// 更新活动信息
router.post("/updataActivityInfo:activeid", upload.single('file'), async (ctx, next) => {
  let token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = {
      status: "403",
      message: "token过期，请重新登录"
    }
    return
  } else {

    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");


    const activeInfo = JSON.parse(ctx.request.body.active)
    const id = activeInfo._id

    console.log("fileName", fileName);


    if (fileName) {
      console.log("有图片");
      let pathh = 'http://localhost:3000/uploads/active/' + fileName
      activeInfo.activity_img = pathh;
    }


    const res = await updataActivityInfo(id, tokenItem.username, activeInfo);
    console.log("res========");
    console.log("res========", res);
    if (res instanceof Object) {
      fileName = ""

      ctx.body = {
        status: 201,
        message: "更新成功",
        data: res
      };
    } else if (res === 1) {
      ctx.body = {
        status: 401,
        message: "无权限更新",
      };
    }
    else {
      ctx.body = {
        status: 401,
        message: "活动不存在，更新失败",
      };
    }
  }
});

// 删除活动
router.post("/delActive", async (ctx, next) => {
  let token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = {
      status: "403",
      message: "token过期，请重新登录"
    }
    return
  } else {

    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");


    const id = ctx.request.body.activeid;
    const res = await delActive(id, tokenItem.username);
    if (res instanceof Object) {
      ctx.body = {
        status: 201,
        message: "删除活动成功"
      };
    } else if (res === 1) {
      ctx.body = {
        status: 402,
        message: "无权限删除"
      };
    } else {
      ctx.body = {
        status: 401,
        message: "活动不存在,删除失败"
      };
    }
  }
});


// 获取我的收藏活动列表
router.get("/getMyCollectActivityList", async (ctx, next) => {
  let token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = {
      status: "403",
      message: "token过期，请重新登录"
    }
    return
  } else {

    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");

    const activityList = await getActivityList();

    const collectList = await getMyCollectList(activityList, tokenItem.username);
    console.log("collectList-----", collectList);
    if (collectList) {
      ctx.body = {
        status: 200,
        data: collectList,
      };
    } else {
      ctx.body = {
        status: 500,
        message: "获取收藏列表失败，请稍后再试",
      };
    }
  }
});


// 收藏活动
router.post("/collectActive:flag", async (ctx, next) => {
  let token = ctx.request.headers["authorization"];
  if (!token) {
    ctx.body = {
      status: "403",
      message: "token过期，请重新登录"
    }
    return
  } else {

    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");

    const id = ctx.request.body.activeid;
    let flag = ctx.params.flag
    if (flag == "true") {
      flag = true
    } else {
      flag = false
    }
    const res = await collectActive(flag, id, tokenItem.username);
    console.log(res);
    if (res instanceof Object) {
      if (flag) {
        ctx.body = {
          status: 200,
          message: "收藏成功"
        };
      } else {
        ctx.body = {
          status: 200,
          message: "取消收藏成功"
        };
      }
    } else if (typeof (res) == String) {
      ctx.body = {
        status: 401,
        message: res,
      };
    } else {
      ctx.body = {
        status: 500,
        message: res,
      };
    }
  }
});


module.exports = router;
