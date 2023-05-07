const jwt = require("jsonwebtoken");
async function check(ctx, next) {
  // split('?')[0]把字符串分割成字符串数组——拿到url值
  let url = ctx.url.split("?")[0];
  let reg = /^\/api\/.*?/;
  if (reg.test(url)) {
    await next();
  } else {
    //获取到token
    console.log(url);
    console.log(12312);

    let token = ctx.request.headers["authorization"];

    if (token) {
      token = token.replace(/Bearer |<|>/g, "");

      //  如果有token的话解析
      const tokenItem = jwt.verify(token, "screct");
      //    把创建时间和过期时间析构出来
      const { time, timeout } = tokenItem;
      // 拿到当前时间
      let NewTime = new Date().getTime();
      if (NewTime - time <= timeout) {
        // 说明没过期
        await next();
      } else {
        ctx.body = {
          status: 405,
          message: "token 已过期，请重新登陆",
        };
      }
    } else {
      ctx.body = {
        status: 405,
        message: "请登录再进行操作",
      };
    }
  }
}
module.exports = check;
