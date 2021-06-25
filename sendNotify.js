/*
 * @Author: lxk0301 https://gitee.com/lxk0301
 * @Date: 2020-08-19 16:12:40 
 * @Last Modified by: lxk0301
 * @Last Modified time: 2021-3-29 11:52:54
 */
/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本脚本免费使用 By：https://gitee.com/lxk0301/jd_docker`
 * @returns {Promise<unknown>}
 */
const querystring = require("querystring");
const $ = new Env();
//=======================================企业微信应用消息通知设置区域===========================================
/*
此处填你企业微信应用消息的值(详见文档 https://work.weixin.qq.com/api/doc/90000/90135/90236)
环境变量名 QYWX_AM依次填入 corpid,corpsecret,touser(注:多个成员ID使用|隔开),agentid,消息类型(选填,不填默认文本消息类型)
注意用,号隔开(英文输入法的逗号)，例如：wwcff56746d9adwers,B-791548lnzXBE6_BWfxdf3kSTMJr9vFEPKAbh6WERQ,mingcheng,1000001,2COXgjH2UIfERF2zxrtUOKgQ9XklUqMdGSWLBoW_lSDAdafat
可选推送消息类型(推荐使用图文消息（mpnews）):
- 文本卡片消息: 0 (数字零)
- 文本消息: 1 (数字一)
- 图文消息（mpnews）: 素材库图片id, 可查看此教程(http://note.youdao.com/s/HMiudGkb)或者(https://note.youdao.com/ynoteshare1/index.html?id=1a0c8aff284ad28cbd011b29b3ad0191&type=note)
 */
let QYWX_AM = '';

//==========================云端环境变量的判断与接收=========================

if (process.env.QYWX_AM) {
  QYWX_AM = process.env.QYWX_AM;
}
//==========================云端环境变量的判断与接收=========================

let QYWX_TOUSER = [process.env.QYWX_TOUSER1, process.env.QYWX_TOUSER2, process.env.QYWX_TOUSER3, process.env.QYWX_TOUSER4, process.env.QYWX_TOUSER5, process.env.QYWX_TOUSER6, process.env.QYWX_TOUSER7, process.env.QYWX_TOUSER8, process.env.QYWX_TOUSER9, process.env.QYWX_TOUSER10, process.env.QYWX_TOUSER11, process.env.QYWX_TOUSER12, process.env.QYWX_TOUSER13, process.env.QYWX_TOUSER14, process.env.QYWX_TOUSER15, process.env.QYWX_TOUSER16, process.env.QYWX_TOUSER17, process.env.QYWX_TOUSER18, process.env.QYWX_TOUSER19, process.env.QYWX_TOUSER20];

/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本脚本免费使用 By：https://gitee.com/lxk0301/jd_docker`
 * @returns {Promise<unknown>}
 */
async function sendNotify(text, desp, params = {}) {
  //由于上述两种微信通知需点击进去才能查看到详情，故text(标题内容)携带了账号序号以及昵称信息，方便不点击也可知道是哪个京东哪个活动
  text = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text;
  await Promise.all([
    qywxamNotify(text, desp, params), //企业微信应用消息推送
  ])
}

function getUserId(params) {
  if (params) {
    return QYWX_TOUSER[params.index - 1];
  } else {
    return "";
  }
}

function qywxamNotify(text, desp, params) {
  return new Promise(resolve => {
    if (QYWX_AM) {
      let userId = getUserId(params);
      if (userId == "") {
        userId = process.env.QYWX_TOUSER1;
      }
      if (userId) {
        const QYWX_AM_AY = QYWX_AM.split(',');
        const options_accesstoken = {
          url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken`,
          json: {
            corpid: `${QYWX_AM_AY[0]}`,
            corpsecret: `${QYWX_AM_AY[1]}`,
          },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        };
        $.post(options_accesstoken, (err, resp, data) => {
          html = desp.replace(/\n/g, "<br/>")
          var json = JSON.parse(data);
          accesstoken = json.access_token;
          let options;

          switch (QYWX_AM_AY[3]) {
            case '0':
              options = {
                msgtype: 'textcard',
                textcard: {
                  title: `${text}`,
                  description: `${desp}`,
                  url: 'https://www.aliyun.com/minisite/goods?userCode=kogtge4l',
                  btntxt: '阿里云'
                }
              }
              break;

            case '1':
              options = {
                msgtype: 'text',
                text: {
                  content: `${text}\n\n${desp}`
                }
              }
              break;

            default:
              options = {
                msgtype: 'mpnews',
                mpnews: {
                  articles: [
                    {
                      title: `${text}`,
                      thumb_media_id: `${QYWX_AM_AY[3]}`,
                      author: `智能助手`,
                      content_source_url: ``,
                      content: `${html}`,
                      digest: `${desp}`
                    }
                  ]
                }
              }
          };
          if (!QYWX_AM_AY[3]) {
            //如不提供第四个参数,则默认进行文本消息类型推送
            options = {
              msgtype: 'text',
              text: {
                content: `${text}\n\n${desp}`
              }
            }
          }
          options = {
            url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accesstoken}`,
            json: {
              touser: `${userId}`,
              agentid: `${QYWX_AM_AY[2]}`,
              safe: '0',
              ...options
            },
            headers: {
              'Content-Type': 'application/json',
            },
          }

          $.post(options, (err, resp, data) => {
            try {
              if (err) {
                console.log('成员ID:' + getUserId(params) + '企业微信应用消息发送通知消息失败！！\n');
                console.log(err);
              } else {
                data = JSON.parse(data);
                if (data.errcode === 0) {
                  console.log('成员ID:' + getUserId(params) + '企业微信应用消息发送通知消息成功🎉。\n');
                } else {
                  console.log(`${data.errmsg}\n`);
                }
              }
            } catch (e) {
              $.logErr(e, resp);
            } finally {
              resolve(data);
            }
          });
        });
      }
    } else {
      console.log('您未提供企业微信应用消息推送所需的QYWX_AM，取消企业微信应用消息推送消息通知🚫\n');
      resolve();
    }
  });
}





module.exports = {
  sendNotify
}
//prettier-ignore
function Env(t, s) { return new class { constructor(t, s) { this.name = t, this.data = null, this.dataFile = "box.dat", this.logs = [], this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise(s => { $.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise(e => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = s && s.timeout ? s.timeout : o; const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" } }; $.post(r, (t, s, i) => e(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}, t)[s[s.length - 1]] = e, t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? "null" === h ? null : h || "{}" : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), e = this.setval(JSON.stringify(s), i) } catch (s) { const h = {}; this.lodash_set(h, o, t), e = this.setval(JSON.stringify(h), i) } } else e = $.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? (this.data = this.loaddata(), this.data[s] = t, this.writedata(), !0) : this.data && this.data[s] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), s.cookieJar = this.ckjar } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t))) } post(t, s = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) $httpClient.post(t, (t, e, i) => { !t && e && (e.body = i, e.statusCode = e.status), s(t, e, i) }); else if (this.isQuanX()) t.method = "POST", $task.fetch(t).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then(t => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, t => s(t)) } } time(t) { let s = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = t => !t || !this.isLoon() && this.isSurge() ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; $.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 ? this.logs = [...this.logs, ...t] : console.log(this.logs.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : $.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(s => setTimeout(s, t)) } done(t = {}) { const s = (new Date).getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, s) }
