function getTokenItem() {
  console.log("getTokenItem()11111111111111111111111111111111");

  let token = ctx.request.headers["authorization"];
  token = token.replace(/Bearer |<|>/g, "");
  const tokenItem = jwt.verify(token, "screct");
  return tokenItem;
}
module.exports = getTokenItem;
