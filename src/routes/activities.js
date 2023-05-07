const router = require("koa-router")();
const { getActivityList, getActivityInfo, getMyCollectList } = require("../controller/activity");
const jwt = require("jsonwebtoken");

router.prefix("/api");

// 获取活动列表
router.get("/getActivityList", async (ctx, next) => {
  const type = ctx.request.query.type;
  const feature = ctx.request.query.feature;


  const activityList = await getActivityList(type, feature);
  ctx.body = {
    status: 200,
    data: activityList,
  };
});

// 获取活动详情
router.get("/getActiveInfo", async (ctx, next) => {
  const id = ctx.request.query.activeid;
  const activityInfo = await getActivityInfo(id);
  if (activityInfo) {
    ctx.body = {
      status: 200,
      data: activityInfo,
    };
  } else {
    ctx.body = {
      status: 401,
      message: "活动不存在"
    };
  }

});

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
    activityList.forEach(active => {
      sortActivityList[active._id] = [active.activity_type, active.feature]
    })

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
    // console.log("activeSimilarities---", activeSimilarities);

    async function recommendItems(username) {
      let userCollectActiList = await getMyCollectList(activityList, username)
      let sortUserCollectActiList = []
      userCollectActiList.forEach(active => {
        sortUserCollectActiList.push(active._id)
      })

      // 计算用户已经收藏的物品与其他物品的相似度，存储到一个对象中
      const activeScores = {};
      for (let activeId of sortUserCollectActiList) {
        for (let otherActive in activeSimilarities[activeId]) {
          if (!sortUserCollectActiList.indexOf(otherActive) !== -1) {
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
        .slice(0, 5)
        .map(active => active[0]);
      return recommendedActives;
    }

    const recommendedActives = await recommendItems(username);

    if (recommendedActives.length === 0) {
      const len = activityList.length
      if (len < 5) {
        comdList = activityList
      } else {
        for (let i = 0; i < 5; i++) {
          comdList.push(activityList[getRandomInt(0, len)])
        }
      }
      ctx.body = {
        status: 200,
        data: comdList
      }
    }

    for (const activeId of recommendedActives) {
      const activityInfo = await getActivityInfo(activeId);
      comdList.push(activityInfo);
    }

    ctx.body = {
      status: 200,
      data: comdList
    }

  } else {
    const len = activityList.length
    if (len < 5) {
      comdList = activityList
    } else {
      for (let i = 0; i < 5; i++) {
        comdList.push(activityList[getRandomInt(0, len)])
      }
    }
    ctx.body = {
      status: 200,
      data: comdList
    }
  }
})

module.exports = router;
