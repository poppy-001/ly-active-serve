const router = require("koa-router")();
const Core = require('@alicloud/pop-core');
const { saveCode, getCode } = require("../controller/code")
const { updataUserInfo } = require("../controller/user");

router.prefix("/api");
// 获取短信验证码
// 阿里云短信验证码配置信息
const config = {
    accessKeyId: 'LTAI5tJK2df8gt4HYUWBswku',
    accessKeySecret: 'IrIMP1BlrPawZ8i9Te1ZYVsjCIsrfa',
    regionId: 'cn-hangzhou',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25',
    signName: '校园文化集市',
    templateCode: 'SMS_276481816',
};

// 处理发送验证码请求
router.post('/send_code', async (ctx) => {
    const { mobile } = ctx.request.body;
    let randomCode = Math.floor(Math.random() * 900000 + 100000)
    console.log("randomCode", randomCode);
    // 阿里云短信验证码 API 参数
    const params = {
        RegionId: config.regionId,
        SignName: config.signName,
        TemplateCode: config.templateCode,
        PhoneNumbers: mobile,
        TemplateParam: JSON.stringify({
            code: randomCode,
        }),
    };

    // 创建阿里云客户端
    const client = new Core({
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        endpoint: config.endpoint,
        apiVersion: config.apiVersion,
    });

    // 调用阿里云短信验证码 API 发送短信
    try {
        const result = await client.request('SendSms', params);
        ctx.body = { status: 200, message: '验证码已发送' };
        const res = await saveCode(randomCode, mobile)
    } catch (err) {
        console.log(err);
        ctx.body = { status: 501, message: '发送验证码失败' };
    }
});

// 校验验证码是否正确
router.post('/compare_code', async (ctx) => {
    let { mobile, code } = ctx.request.body;

    try {
        const res = await getCode(mobile)
        console.log("res------", res);
        if (res) {
            const realCode = res.code
            code = Number(code)
            if (realCode === code) {
                ctx.body = {
                    status: 200,
                    message: "验证码正确"
                }

            } else {
                ctx.body = {
                    status: 401,
                    message: "验证码错误"
                }
            }
        } else {
            ctx.body = {
                status: 501,
                message: "验证码失效，请重新发送"
            }
        }
    } catch (error) {
        ctx.body = {
            status: 503,
            message: "校验失败"
        }
    }



});
module.exports = router;
