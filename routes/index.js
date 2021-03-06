var express = require('express');
var router = express.Router();
var connection = require('../mysql/goods').connection; //引入链接
//引入上传中间件模块
var multer  = require('multer');
var cheerio = require('cheerio');

var superagent = require('superagent');
router.get('/getData',(req,res,next)=>{
	superagent.get('http://www.dashen28.com/?tdsourcetag=s_pctim_aiomsg')
    .end(function (err, sres) {
      if (err) {
        return next(err);
      }
    /**
     *这里的sres.text就是爬取页面的html，可以在下方打印
     */
	//   console.log('页面的html：', sres.text)
      /**
       *cheerio也就是nodejs下的jQuery  将整个文档包装成一个集合，定义一个变量$接收
       */
      var $ = cheerio.load(sres.text);
	  var items = [];
	  var NewItems = {}
        /**
         * 可以先看看页面结构，找出你想爬取的数据，餐后操作dom取得数据
         */
      $('.result').each(function (idx, element) {
		var $element = $(element);
		// console.log('element:', element)
       /**
         * 拼装数据
         */
		var c = new Date().getTime()
		var now = formatDate(c)
        items.push({
          title: $element.text().replace(/\s/g,'') + '  ' + now
		});
        //这里的items就是我们要的数据
	  })
		var c = new Date().getTime()
		var now = formatDate(c)
		NewItems.title = $('.result').eq(2).text().replace(/\s/g,'') + '  ' + now
	    /**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
		console.log('NewItems:', NewItems)
		res.send(NewItems)
	})
})
function formatDate(time){
    var date = new Date(time);

    var year = date.getFullYear(),
        month = date.getMonth() + 1,//月份是从0开始的
        day = date.getDate(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    var newTime = year + '-' +
                month + '-' +
                day + ' ' +
                hour + ':' +
                min + ':' +
                sec;
    return newTime;         
}
//初始化上传目录,自定义本地保存的路径
//var upload = multer({ dest: './files/' }); //使用storage时不需要单独制定目录，storage中有目录设置
var uploadFolder='./public/images'; //放入静态资源目录才能正常显示 页面路径一定要正确 我擦  坑啊！！！！

// 通过storage的 filename 属性定制上传文件名称
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建如果不存在会报错
  },
  filename: function (req, file, cb) {
    //将保存文件名设置为 前缀+时间戳+文件扩展名
    var extName=file.originalname.substring(file.originalname.lastIndexOf(".")); //.jpg
    cb(null, file.fieldname + '_' + new Date().getTime() + extName);
  }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage });

router.get('/test',function(req,res,next){
	/**设置响应头允许ajax跨域访问**/
	res.setHeader("Access-Control-Allow-Origin","*");
	/*星号表示所有的异域请求都可以接受，*/
  res.setHeader("Access-Control-Allow-Methods","GET,POST");
	res.send('2')
})

router.post('/postTest', (req,res,next)=>{
	res.send('3')
})

/* 文件上传的api */
router.post('/upload',upload.single("uploadFile"), function(req, res, next) {
  var fileInfo = req.file; //multer会将文件的信息写到 req.file上
  console.log('文件类型：', fileInfo.mimetype);
  console.log('原始文件名：', fileInfo.originalname);
  console.log('文件大小：', fileInfo.size);
  console.log('文件保存路径：', fileInfo.path);
  //返回图片的相对路径
  //res.send(fileInfo.path);
  /**设置响应头允许ajax跨域访问**/
  res.setHeader("Access-Control-Allow-Origin","*");
	/*星号表示所有的异域请求都可以接受，*/
  res.setHeader("Access-Control-Allow-Methods","GET,POST");
  console.log('查看返回的数据：', fileInfo.path.toString().replace("public","").replace(/\\/g,"/"))
  res.send(fileInfo.path.toString().replace("public","").replace(/\\/g,"/"));
});

/* 图片地址储存进入数据库  */
router.post('/toSql', function(req, res, next) {
//	console.log('req.body:', req.body.id)
	var id = req.body.id
	var img_url = req.body.url
	console.log('img_url:', img_url)
	var sql = "UPDATE nideshop_goods SET primary_pic_url = '"+ img_url +"' WHERE id = '"+ id +"' "
	connection.query(sql, function(error, results, fields) {
		try{
				if(error) throw error;
				console.log('更改数据的结果：', results)
				res.send('1')
			}catch(e){
				console.log('错误：', e)
				res.send('0')
			}
	})
})

/* GET home page. */
router.get('/test', function(req, response, next) {
	Promise.all([test(), test1(), test2(), test3(),test4(),test5()])//这种方法还可以
		.then(function(result){
			var keys = {data:{},errmsg:"",errno:0}
			for (var i = 0; i < result.length; i++){
				for (var key in result[i]) {
					console.log('key:', key, result[i][key])
					keys.data[key] = result[i][key]
				}
			}
			response.send(keys)
		})
});

router.post('/regiester',function(req,response,next){
	console.log('req.body:', req.body)
	var sql = "INSERT INTO my_user (name, password) VALUES ('" + req.body.name + "', '" + req.body.pass + "')"//值用单引号包括
		connection.query(sql, function(error, results, fields) {
			try{
				if(error) throw error;
				console.log('添加数据的结果：', results)
				response.send('1')
			}catch(e){
				console.log('错误：', e)
				response.send('0')
			}
		});
	
})
//login
router.post('/login',function(req,response,next){
	console.log('req.body:', req.body)
	var sql = "SELECT count(1) as nums FROM my_user WHERE name = '" + req.body.name + "'AND password = '" + req.body.pass + "'"//值用单引号包括
//	console.log('sql:', sql)
	connection.query(sql, function(error, results, fields) {
		if(error) throw error;
		if (parseInt(results[0].nums) > 0){
			response.send('1')
		} else {
			response.send('0')
		}
		
	});
})

//获得所有用户信息 分页
router.post('/getUsers',function(req,res,next){
	var pageIndex = req.body.pageIndex//当前页数
	console.log('后台接收的页数：', pageIndex)
	var limit = 15*pageIndex - 15//从多少页开始
	var sql = "SELECT * FROM my_user limit "+ limit +",15"
	var sql2 = "SELECT count(1) as nums FROM my_user"
	connection.query(sql, function(error, results, fields) {
		try{
			if(error) throw error;
			connection.query(sql2, function(err2, res2, fil2) {
				console.log('查询出来总的条数：', Math.ceil(res2[0].nums / 15))
				var pageAll = Math.ceil(res2[0].nums / 15)
				var resData = {total:pageAll,conut:results}
				res.send(resData)
			})
		}catch(e){
			res.send('0')
		}
	});
})


//更新用户信息 分页
router.post('/editUser',function(req,res,next){
	var id = req.body.id
	var name = req.body.name
	var character = req.body.character
	var sql = "UPDATE my_user SET name = '"+ name +"',character1 = '"+ character + "' WHERE id = '"+ id +"'"
	console.log('sql:', sql)
	connection.query(sql, function(error, results, fields) {
		try{
			if(error) throw error;
			console.log('更改用户信息：', results)
			res.send('1')
		}catch(e){
			res.send('0')
		}
	});
})

//删除用户
router.post('/deletUser',function(req,res,next){
	var id = req.body.id
	var sql = "DELETE FROM my_user WHERE id = '"+ id +"' "
	connection.query(sql,function(err, results, fields){
		try{
			if(err) throw err
			res.send('1')
		}catch(e){
			res.send('0')
		}
	})
})

//查询商品列表
router.post('/getGoodsList', function(req, res, next) {
	var pageIndex = req.body.pageIndex//当前页数
	var limit = 5*pageIndex - 5//从多少页开始
	var sql = "SELECT G.id, G.name,G.goods_brief,G.primary_pic_url,G.promotion_desc,C.name AS category FROM nideshop_goods AS G, nideshop_category AS C WHERE G.category_id = C.id limit "+ limit +",5"
	var sql2 = "SELECT count(1) as nums FROM nideshop_goods"
	connection.query(sql, function(err, results, fields) {
		try{
			if (err) throw err
			connection.query(sql2, function(err2, res2, fields2) {
				try{
					if(err2) throw err2
					var pageAll = Math.ceil(res2[0].nums / 5)
					var resData = {total:pageAll,conut:results}
					res.send(resData)
				}catch(e){
					res.send('0')
				}
			})
		}catch(e){
			res.send('0')
		}
	})
})
// 查找分类商品
function test() {
	return new Promise(function(resolve, reject) {
		var sql = 'select a.id, a.name, count(b.category_id) from nideshop_category a inner join nideshop_goods b on a.id = b.category_id group by b.category_id having count(b.category_id) > 5 '
		connection.query(sql, function(error, results, fields) {
			if(error) throw error;
			for(let id in results) {//循环结果的次数 注意let
				var sql2 = 'SELECT * FROM nideshop_goods WHERE category_id = ' + results[id].id + ' limit 0,5'//得到当前的sql
				connection.query(sql2, function(error2, results2, fields2) {
					if(error2) throw error2;
					var newData = []
					for(var i = 0; i < results2.length; i++) {//循环结果，并添加到数组中
						newData.push(results2[i])
					}
					results[id].goodsList = newData
					if(id == results.length - 1) {//如果是最后一次  那么返回结果
//						var now = {data:{categoryList:results},errmsg:"",errno:0}
//						console.log('查看当前的值：', now)
						var now = {categoryList:results}
						resolve(now)
					}
				});
			}
		});
	})
}
//查找制造商商品
function test1() {
	return new Promise(function(resolve, reject) {
		var sql = 'SELECT * FROM `nideshop_brand` WHERE new_pic_url != "" '
		connection.query(sql, function(error, results, fields) {
			if(error) throw error;
//			var now = {data:{brandList:results},errmsg:"",errno:0}
			var now = {brandList:results}
			resolve(now)
		});
	})
}

//查找banner图
function test2() {
	return new Promise(function(resolve, reject) {
		mysql.createConnection(function(err) {
			if(err) {
				console.error('error connecting:' + err.stack)
				reject(err.stack)
			}
			console.log('connected as id ' + connection.threadId);
		})
		var sql = 'SELECT * FROM `nideshop_ad`'
		connection.query(sql, function(error, results, fields) {
			if(error) throw error;
//			var now = {data:{brandList:results},errmsg:"",errno:0}
			var now = {banner:results}
			resolve(now)
		});
	})
}

//查找channel
function test3() {
	return new Promise(function(resolve, reject) {
		mysql.createConnection(function(err) {
			if(err) {
				console.error('error connecting:' + err.stack)
				reject(err.stack)
			}
			console.log('connected as id ' + connection.threadId);
		})
		var sql = 'SELECT * FROM `nideshop_channel`'
		connection.query(sql, function(error, results, fields) {
			if(error) throw error;
//			var now = {data:{brandList:results},errmsg:"",errno:0}
			var now = {channel:results}
			resolve(now)
		});
	})
}
// 查找推荐nideshop_goods
function test4() {
	return new Promise(function(resolve, reject) {
		mysql.createConnection(function(err) {
			if(err) {
				console.error('error connecting:' + err.stack)
				reject(err.stack)
			}
			console.log('connected as id ' + connection.threadId);
		})
		var sql = 'SELECT * FROM nideshop_goods WHERE is_new = 1 limit 0,4'
		connection.query(sql, function(error, results, fields) {
			if(error) throw error;
			var now = {newGoodsList:results}
			resolve(now)
		});
	})
}
// 查找推荐nideshop_topic
function test5() {
	return new Promise(function(resolve, reject) {
		mysql.createConnection(function(err) {
			if(err) {
				console.error('error connecting:' + err.stack)
				reject(err.stack)
			}
			console.log('connected as id ' + connection.threadId);
		})
		var sql = 'SELECT * FROM nideshop_topic'
		connection.query(sql, function(error, results, fields) {
			if(error) throw error;
			var now = {topicList:results}
			resolve(now)
		});
	})
}
/**
 *nodej 使用mysql, 只要mysql.createConnection 就可操作 不須再用 connection.connect connection.end connection.start 否則可能會有 Cannot enqueue Handshake after invoking quit 的錯誤
 */
// 查找
function banner() {
	return new Promise(function(resolve, reject) {
		mysql.createConnection(function(err) {
			if(err) {
				console.error('error connecting:' + err.stack)
				reject(err.stack)
			}
			console.log('connected as id ' + connection.threadId);
		})

		/***
		 * SELECT id FROM nideshop_ad where id = 1
		 * 1.查询  2.查询的字段名，*为所有字段  3.来自什么表  4.表名  5.条件过滤  6.具体的条件是什么
		 */
		connection.query('SELECT * FROM nideshop_ad limit 0,10', function(error, results, fields) {
			if(error) throw error;
			//	        console.log('The solution is:', results);
			resolve(results)
		});
		//	    connection.end();
	})
}



//排序  查询结尾有DESC那么为降序排  没有为升序排列
function pauxu() {
	return new Promise(function(resolve, reject) {
		mysql.createConnection(function(err) {
			if(err) {
				reject(err.stack)
			}
		})
		/**
		 * SELECT * FROM nideshop_product ORDER BY retail_price DESC
		 * 1.查询  2.查询字段名，*为所有字段 3.来自什么表 4.表名 5.ORDER BY 排序固定写法 6.查询排序的字段名 7.是否降序排列，有DESC为降序，没有为升序
		 */
		connection.query('SELECT * FROM nideshop_product ORDER BY retail_price DESC', function(error, results, fields) {
			resolve(results)
		});
		//		connection.end();
	})
}

router.post('/postTest', function(req, res, next) {
	console.log('页面接收的值:', req.body)
	res.send('2')
})
module.exports = router;