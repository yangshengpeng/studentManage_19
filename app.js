// 引入框架
let express=require('express');
// 引入验证码模块
let svgCaptcha = require('svg-captcha');

// 引入seccession存储模块
let session = require('express-session')
// 创建App
let app=express();
// 使用存储库
app.use(session({
    secret: 'keyboard cat',  
  }))

// 引入路径
let path=require('path');

// 创建静态资源服务器
app.use(express.static('static'));

// 路由1只要访问登录页就读取文件并返回
app.get('/login',(req,res)=>{
  res.sendFile(path.join(__dirname,'/static/views/login.html'));
})

// 路由2生成验证码
app.get('/login/verification.png',(req,res)=>{
    let captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
})
// 监听
app.listen(8848,'127.0.0.1',()=>{
    console.log('success');
})