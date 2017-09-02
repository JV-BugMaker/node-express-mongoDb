var mongodb = require('./db');

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;
//存储用户信息
User.prototype.save = function(callback){

    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/"+email_MD5+"?s=48";
    //要存入数据库的用户文档 数据 对象
    var user = {
        name:this.name,
        password:this.password,
        email:this.email,
        head:head
    };
    //打开数据库
    mongodb.open(function(err,db){
      if(err){
        return callback(err);
      }
      //读取users集合
      db.collection('users',function(err,collection){
          if(err){
            //将资源关闭
            mongodb.close();
            return  callback(err);
          }
          //插入数据 user 是对象
          collection.insert(user,{
            safe:true
          },function(err,user){
            mongodb.close();
            if(err){
                //错误返回错误信息
                return callback(err);
            }
            //返回user对象
            //成功 err为null 并返回存储后的用户文档
            callback(null,user);
          });
      });
    });
};

//读取用户信息
User.get = function(name,callback){
  //打开数据库
  mongodb.open(function(err,db){
    if(err){
        return callback(err);
    }
    //读取 users 集合
    db.collection('users',function(err,collection){
        if(err){
            mongodb.close();
            return callback(err);
        }
        //查找用户名 name键 值为 name一个文档
        collection.findOne({
          name:name,
        },function(err,user){
          mongodb.close();
          if(err){
            return callback(err);
          }
          callback(null,user);
        });
    });
  });
};
