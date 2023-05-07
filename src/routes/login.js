const router = require("koa-router")();
const { register, login, resetpwd } = require("../controller/login");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.prefix("/api");

// 登录
router.post("/login", async (ctx, next) => {
  let { username, password } = ctx.request.body;
  console.log("username, password------", username, password);
  //验证用户名和密码的合法性
  if (!username || !password) {
    return (ctx.body = {
      status: 400,
      message: "用户名或密码不能为空",
    });
  }

  const res = await login(username, password);

  if (res) {
    let stu_num = res.stu_num
    username = res.username
    console.log(res);
    console.log(username);
    //用户注册了
    if (res instanceof Object) {
      let payload = {
        stu_num,
        username,
        password,
        time: new Date().getTime(),
        timeout: 1000 * 60 * 60 * 12,
      };
      let token = jwt.sign(payload, "screct");

      // 返回信息
      ctx.body = {
        status: 200,
        token: token,
        message: "登陆成功!",
      };
    } else {
      //密码错误
      ctx.body = {
        status: 400,
        message: "用户密码错误!",
      };
    }
  } else {
    //用户未注册
    ctx.body = {
      status: 404,
      message: "用户未注册，请先注册",
    };
  }
});

//注册
router.post("/register", async function (ctx, next) {
  const userInfo = ctx.request.body;

  //验证用户名和密码的合法性
  if (!userInfo.username || !userInfo.password || !userInfo.stu_num) {
    return (ctx.body = {
      status: 400,
      message: "用户名或密码不能为空",
    });
  } else {
    // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
    userInfo.password = bcrypt.hashSync(userInfo.password, 10);

    try {
      const newUser = await register(userInfo);

      if (newUser) {
        ctx.body = {
          status: 201,
          data: newUser,
        };
      } else {
        ctx.body = {
          status: 400,
          message: "用户已存在，可直接登录哦",
        };
      }
    } catch (error) {
      console.error("注册失败，请稍后再试", error);
      ctx.body = {
        status: 501,
        message: error,
      };
    }
  }
});


// 修改密码
router.post("/resetpwd:flag", async function (ctx, next) {

  let flag = ctx.params.flag
  if (flag == "true") {
    flag = true
  } else {
    flag = false
  }

  console.log("===========", flag);
  if (flag) {
    console.log("5555555555555555555555");
    const { username, newPwd, oldPwd } = ctx.request.body;
    if (!username || !newPwd || !oldPwd) {
      return ctx.body = {
        status: 401,
        message: '请填写完整',
      };
    }



    // 验证用户身份
    let token = ctx.request.headers["authorization"] || "";
    if (!token) {
      ctx.body = {
        status: "403",
        message: "token过期，请重新登录"
      }
      return
    } else {

      token = token.replace(/Bearer |<|>/g, "");
      const tokenItem = jwt.verify(token, "screct");
      if (!token) {
        ctx.body = {
          status: 401,
          message: '未登录',
        };
        return;
      }

      if (tokenItem.username !== username && tokenItem.stu_num !== username) {
        ctx.body = {
          status: 401,
          message: { error: 'Unauthorized' },
        };
        return;
      }

      try {
        const res = await resetpwd(username, newPwd, oldPwd, true);
        ctx.body = res;
      } catch (err) {
        console.log(err);
        ctx.body = {
          status: 401,
          message: "重设失败"
        };
      }
    }
  } else {
    const { mobile, newPwd } = ctx.request.body;
    if (mobile === "" || newPwd === "") return

    try {
      const res = await resetpwd(mobile, newPwd);
      ctx.body = res;
    } catch (err) {
      console.log(err);
      ctx.body = {
        status: 401,
        message: "重设失败"
      };
    }
  }



});


module.exports = router;
