/*
*
*文章模型
*对文章数据处理
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name,title,post)
{
    this.name = name;
    this.title = title;
    this.post = post;
}


module.exports = Post;

Post.prototype.save = function(callback){
    var date = new Date();
    //存储各种时间格式、方便以后扩展
    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() + "-" + (date.getMonth() + 1),
        day:date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate(),
        minute:date.getFullYear() + "-" + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
    };
    //要存入数据库的文档
    var post = {
        name:this.name,
        title:this.title,
        time:time,
        post:this.post,
        //增加评论入库
        comments:[]
    };

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入到集合中
            collection.insert(post,{
                safe:true
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null); //插入成功返回null
            });
        });
    });
};
//读取文章以及相关信息
//增加分页效果  skip 和limit  实际运用不推荐？
Post.getTen = function(name,page,callback){
    //参数带回调函数 现在node的封装函数都是按照 参数一 作为err 参数二 才是可操作的
    mongodb.open(function(err,db){
      //判断参数err是否存在  不存在一般会设置成null
      if(err){
          return callback(err);
      }
      //读取集合 进行判断 以及数据保存等操作
      db.collection('posts',function(err,collection){
          if(err){
              mongodb.close();
              return callback(err);
          }
          var query = {};
          if(name){
              query.name = name;
          }
          //使用count返回特定查询文档数
          collection.count(query,function(err,total){
              //根据query对象查询，并跳过前(page-1)*10个结果
              collection.find(query,{
                  skip:(page-1)*10,
                  limit:10
              }).sort({
                  time:-1
              }).toArray(function(err,docs){
                  mongodb.close();
                  if(err){
                      return callback(err);
                  }
                  //解析mardown为html
                  docs.forEach(function(doc){
                      doc.post = markdown.toHTML(doc.post);
                  });
                  callback(null,docs,total);
              });
          });
          //根据query对象查询数据
          // collection.find(query).sort({
          //     time:-1
          // }).toArray(function(err,docs){
          //     //插入完成 关闭数据库以及后续结果操作处理
          //     mongodb.close();
          //     if(err){
          //         return callback(err);
          //     }
          //     docs.forEach(function(doc){
          //         doc.post = markdown.toHTML(doc.post);
          //     });
          //     //插入很共返回null 和文档
          //     callback(null,docs);
          // });
      });
    });
};
//添加获取一篇文章的操作
Post.getOne = function(name,day,title,callback){
  //打开数据库
  mongodb.open(function(err,db){
      if(err){
          return callback(err);
      }
      //读取posts
      db.collection('posts',function(err,collection){
          if(err){
              mongodb.close();
              return callback(err);
          }
          //根据用户名 发表日期 以及文章名查询
          collection.findOne({
              "name":name,
              "title":title,
              "time.day":day
          },function(err,doc){
              mongodb.close();
              if(err){
                  return callback(err);
              }
              //解析 md 为 html  返回文章对象
              // doc.post = markdown.toHTML(doc.post);
              // 让评论功能也支持markdown
              if(doc){
                  doc.post = markdown.toHTML(doc.post);
                  if(doc.comments){
                    doc.comments.forEach(function(comment){
                        comment.content = markdown.toHTML(comment.content);
                    });
                  }else{
                    doc.comments = "";
                  }

              }
              callback(null,doc);
          });
      });
  });
};
Post.edit = function(name,day,title,callback){
    //打开数据库 找到数据 然后进行修改
    mongodb.open(function(err,db){
        if(err){
            return callback();
        }
        //读取数据
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "name":name,
                "time.day":day,
                "title":title,
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
};

Post.update = function(name,day,title,post,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
              "name":name,
              "time.day":day,
              "title":title,
            },{
                $set:{post:post}
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
Post.remove = function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
              "name":name,
              "time.day":day,
              "title":title,
            },{
                w:1
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
