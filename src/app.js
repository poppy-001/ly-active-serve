const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("koa2-cors");
const koaBody = require('koa-body');
const static = require('koa-static');

const index = require("./routes/index");
const users = require("./routes/users");
const login = require("./routes/login");
const activities = require("./routes/activities");
const userActive = require("./routes/userActive");
const code = require("./routes/code");

// error handler
onerror(app);

// 服务端支持跨域
app.use(
  cors({
    origin: "*", //支持前端哪个域跨域 （budaicookie的话 *都可以跨）
    credentials: true,
  })
);

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  await next();
});

// // middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);


//token验证
const checkToken = require("./middlewares/checkToken.js");
app.use(checkToken);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(login.routes(), login.allowedMethods());
app.use(code.routes(), code.allowedMethods());
app.use(activities.routes(), activities.allowedMethods());
app.use(userActive.routes(), userActive.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
