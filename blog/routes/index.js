var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//module.exports = router;
module.exports = function(app){
  app.get('/',function(req,res){
      Post.get(null,function(err,posts){
          if(err){
              posts = [];
          }
          res.render('index',{
            title:'主页',
            user:req.session.user,
            posts:posts,
            success:req.flash('success').toString(),
            error:req.flash('error').toString(),
          });
      });
  });
  app.get('/reg',checkNotLogin);
  app.get('/reg',function(req,res){
      res.render('reg',{
        title:'注册',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
  });
  app.post('/reg',checkNotLogin);
  app.post('/reg',function(req,res){
      var name = req.body.name,
          password = req.body.password,
          password_re = req.body['password-repeat'];
      if(password != password_re){
          req.flash('error','两次输入的密码不一致');
          return res.redirect('/reg');
      }
      //生成密码的MD5
      var md5 = crypto.createHash('md5');
          password = md5.update(password).digest('hex');
      var newUser = new User({
          name:name,
          password:password,
          email:req.body.email
      });
      User.get(newUser.name,function(err,user){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          if(user){
              req.flash('error',err);
              return res.redirect('/reg');
          }
          newUser.save(function(err,user){
              if(err){
                  req.flash('error',err);
                  return res.redirect('/reg');
              }
              req.session.user = user;
              req.flash('success','注册成功');
              res.redirect('/');
          });
      });
  });
  app.get('/login',checkNotLogin);
  app.get('/login',function(req,res){
      res.render('login',{
        title:'登录',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
  });
  app.post('/login',checkNotLogin);
  app.post('/login',function(req,res){
    //处理登录操作
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name,function(err,user){
        if(!user){
            req.flash('用户不存在！');
            //用户不存在，则跳转到登录页面
            return res.redirect('/login');
        }
        if(password != user.password){
            req.flash('密码错误!');
            //密码错误则跳转到登录界面
            return res.redirect('/login');
        }
        //过了前面两个验证之后 登录成功
        req.session.user = user;
        req.flash('success','登录成功');
        res.redirect('/');
    });
  });
  app.get('/post',checkLogin);
  app.get('/post',function(req,res){
      res.render('post',{
        title:'发布',
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
  });
  app.post('/post',function(req,res){
      var currentUser  = req.session.user,
          post = new Post(currentUser.name,req.body.title,req.body.post);
      post.save(function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          req.flash('success','发布成功');
          res.redirect('/');//发表成功
      });
  });
  app.get('/logout',checkLogin);
  app.get('/logout',function(req,res){
      req.session.user = null;
      req.flash('success','登出成功');
      res.redirect('/');
  });
  function checkLogin(req,res,next)
  {
      if(!req.session.user){
          req.flash('error','未登录');
          return res.redirect('/login');
      }
      return next();
  }
  function checkNotLogin(req,res,next)
  {
      if(req.session.user){
          req.flash('error','已登录');
          return res.redirect('back');
      }
      return next();
  }
};
