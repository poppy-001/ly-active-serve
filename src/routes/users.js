const router = require("koa-router")();
const jwt = require("jsonwebtoken");
const multer = require('@koa/multer');
const path = require('path');
const { getUserInfo, updataUserInfo } = require("../controller/user");


router.prefix("/users");

// 获取用户信息
router.get("/getUserInfo", async function (ctx, next) {
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

    const userInfo = await getUserInfo(tokenItem.username);
    ctx.body = {
      status: 200,
      data: userInfo,
    };
  }
});

let fileName = "";
// 设置文件上传目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/user'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = decodeURIComponent(file.originalname)
    const basename = name.replace(/\.[^/.]+$/, '');
    fileName = `${basename}-${Date.now()}${ext}`
    cb(null, fileName);
  }
});
// 设置文件上传中间件
const upload = multer({ storage: storage });

// 修改个人信息
router.post("/updataUserInfo", upload.single('file'), async (ctx, next) => {
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
    const userInfo = JSON.parse(ctx.request.body.userInfo)
    console.log(fileName);
    // let file = userInfo.user_pic

    if (fileName != "") {
      console.log("有图片");
      let pathh = 'http://localhost:3000/uploads/user/' + fileName
      console.log(pathh);
      userInfo.user_pic = pathh;
    }
    console.log("userInfo.mobile", userInfo.mobile);
    const res = await updataUserInfo(tokenItem.username, userInfo);
    console.log("res========", res);
    if (res instanceof Object) {
      fileName = ""

      ctx.body = {
        status: 201,
        message: "更新成功",
        data: res,
        tokenItem: tokenItem
      };
    } else if (res === 1) {
      ctx.body = {
        status: 401,
        message: "无权限更新",
      };
    }
    else {
      console.log(res);
      ctx.body = {
        status: 401,
        message: "用户不存在，更新失败",
      };
    }
  }
});

router.post("/bindMobile", async (ctx, next) => {
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
    const { mobile } = ctx.request.body
    const mobileInfo = { mobile }

    const res = await updataUserInfo(tokenItem.username, mobileInfo);
    console.log("res========", res);
    if (res instanceof Object) {
      ctx.body = {
        status: 201,
        message: "绑定成功",
        data: res,
      };
    } else if (res === 1) {
      ctx.body = {
        status: 401,
        message: "无权限绑定",
      };
    } else if (res === 2) {
      ctx.body = {
        status: 401,
        message: "该手机号已绑定其他账号，请确认手机号",
      };
    }
    else {
      ctx.body = {
        status: 401,
        message: "用户不存在，绑定失败",
      };
    }
  }



});

module.exports = router;


// 获取活动推荐
router.get("/getcommandActiveList", async (ctx, next) => {

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let token = ctx.request.headers["authorization"];
  const activityList = await getActivityList();
  let comdList = []

  if (token) {
    token = token.replace(/Bearer |<|>/g, "");
    const tokenItem = jwt.verify(token, "screct");
    const username = tokenItem.username
    //协同过滤算法
    let sortActivityList = {}
    let userCollectActiList = getMyCollectList(activityList, username)
    console.log("userCollectActiList===", userCollectActiList);
    userCollectActiList.foreach(active => {
      sortActivityList.active._id = [active.activity_type, active.feature]
    })

    // let userCollectTypeList=
    function jaccardSimilarity(active1, active2) {
      const actives1 = new Set(sortActivityList[active1]);
      const actives2 = new Set(sortActivityList[active2]);
      const intersection = new Set([...actives1].filter(x => actives2.has(x)));
      const union = new Set([...actives1, ...actives2]);
      return intersection.size / union.size;
    }

    // 计算每个活动与其他活动的相似度，存储到一个对象中
    const activeSimilarities = {};
    for (let active1 in sortActivityList) {
      activeSimilarities[active1] = {};
      for (let active2 in sortActivityList) {
        if (active1 !== active2) {
          activeSimilarities[active1][active2] = jaccardSimilarity(active1, active2);
        }
      }
    }
    console.log("activeSimilarities---", activeSimilarities);

    function recommendItems(username) {
      let userCollectActiList = getMyCollectList(activityList, username)
      console.log("userCollectActiList===", userCollectActiList);

      let sortUserCollectActiList = []
      userCollectActiList.foreach(active => {
        sortUserCollectActiList.push(active._id)
      })
      // 计算用户已经收藏的物品与其他物品的相似度，存储到一个对象中
      const activeScores = {};
      for (let activeId of sortUserCollectActiList) {
        for (let otherActive in activeSimilarities[activeId]) {
          if (!sortUserCollectActiList.has(otherActive)) {
            if (activeScores.hasOwnProperty(otherActive)) {
              activeScores[otherActive] += activeSimilarities[activeId][otherActive];
            } else {
              activeScores[otherActive] = activeSimilarities[activeId][otherActive];
            }
          }
        }
      }

      // 将推荐物品按照得分从高到低排序，返回前三个
      const recommendedActives = Object.entries(activeScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(active => active[0]);

      console.log("recommendedActives---", recommendedActives);

      // // 遍历推荐活动类型，找到对应的活动列表，并随机选择一个活动加入推荐列表
      // let recommendedActivities = [];
      // recommendedTypesList.forEach(type => {
      //   let activities = activityList[type];
      //   let randomIndex = Math.floor(Math.random() * activities.length);
      //   recommendedActivities.push(activities[randomIndex]);
      // });

      return recommendedActives;
    }

    comdList = recommendItems(username)

    ctx.body = {
      status: 200,
      data: comdList
    }
  } else {
    const len = activityList.length
    if (len < 3) {
      comdList = activityList
    } else {
      for (let i = 0; i < 3; i++) {
        comdList.push(activityList[getRandomInt(0, len)])
      }
    }
    ctx.body = {
      status: 200,
      data: comdList
    }
  }
})
