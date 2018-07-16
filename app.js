// 引入框架
let express=require('express');
// 引入验证码模块
let svgCaptcha = require('svg-captcha');

// 引入seccession存储模块
let session = require('express-session')

//引入bodyParser解析器url中间件
let bodyParser = require('body-parser');
// 引入Mongo数据库模块
const MongoClient = require('mongodb').MongoClient;
 const url = 'mongodb://localhost:27017';
 // Database Name
 const dbName = 'SZHM19';

// 创建App
let app=express();
// 使用bodyParser中间件
app.use(bodyParser.urlencoded({extended: false }))

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
	req.session.captcha = captcha.text.toLocaleLowerCase();
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
    res.status(200).send(captcha.data);
    // console.log(captcha.text);
})

//路由三 验证用户登录
app.post('/login',(req,res)=>{
    // console.log(req.body);
    // 接收数据
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    let code=req.body.code;
    // 判断验证码是否正确
    if(code==req.session.captcha){
        // 验证码正确 调到首页
    //   console.log("验证码正确");
    req.session.userinfo={
        userName,
        userPass
    }
      res.redirect("/index");
    }else{
        // console.log("验证码错误");  
        res.setHeader('content-type','text/html;charset=utf-8');   
        res.end("<script>alert('验证码错误');window.location.href='/login'</script>");
    }

});

// 路由四登录成功后直接读取首页并返回
app.get('/index',(req,res)=>{
    // console.log("登录成功");
    // 判断一下是否登录
    if(req.session.userinfo){
        // 登录了
        res.sendFile(path.join(__dirname,"static/views/index.html"));
    }else
    {  //没有登录
        res.setHeader('content-type','text/html;charset=utf-8');   
        res.end("<script>alert('请先登录');window.location.href='/login'</script>");
    }
   
})
// 路由5 点击注册直接读取文件并返回
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/register.html'));
})

//路由6 点击注册判断是否已经注册
app.post('/register',(req,res)=>{
    // console.log(req.body);
    // 接收数据
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    console.log(userName);
    console.log(userPass);
 
// Use connect method to connect to the server
MongoClient.connect(url,(err, client)=> {
 
  const db = client.db(dbName);

  let collection = db.collection('userList');

  collection.find({
      userName
  }).toArray((err, docs)=> {
    // console.log(docs);
    if(docs.length==0){
        //  没有数据就新增
        // 插入数据
        collection.insertOne(
            {userName,
            userPass
            },(err, result)=>{
        //    注册成功
        if(err) console.log(err);
       
        res.setHeader('content-type','text/html;charset=utf-8');   
        res.end("<script>alert('注册成功');window.location.href='/login'</script>");
        });
        // client.close();
    }else{
        // 就是有这个名字
        res.setHeader('content-type','text/html;charset=utf-8');   
        res.end("<script>alert('已经被注册了，换一个试试');window.location.href='/register'</script>");
    }
    // callback(docs);
  });

  
});
})

// 路由7，登出就删除sseccion 调到登录页
app.get('/loginOut',(req,res)=>{
    delete req.session.userinfo;
   res.redirect('/login');
})


// 监听
app.listen(8848,'127.0.0.1',()=>{
    console.log('success');
})