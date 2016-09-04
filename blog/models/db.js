var settings = require('../settings'),
Db = require('mongodb').Db,
Connection = require('mongodb').Connection,
Server = require('mongodb').Server;
//到处mongodb的实例  直接操作mongodb数据库
module.exports = new Db(settings.db,new Server(settings.host,settings.port),{safe:true});
