const Code = require("../model/Code");

// 存入手机号和验证码
async function saveCode(code, mobile) {

    const info = await Code.findOne({ mobile });
    let res;
    if (info) {
        res = await Code.findOneAndUpdate({ mobile }, { code }, { new: true })
    } else {
        res = await Code.create({ code, mobile });
    }
    if (res) {
        setTimeout(async () => {
            let removeRes = await Code.findOneAndRemove({ mobile });
            console.log("removeRes---", removeRes);
        }, 300000);
    }
    return res;
}

// 获取验证码
async function getCode(mobile) {
    const res = await Code.findOne({ mobile });
    return res;
}
module.exports = {
    saveCode,
    getCode
};
