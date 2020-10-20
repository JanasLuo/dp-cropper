var express = require('express');
var cropper = require('./cropper')
var path = require('path')
const url = require('url')
var app = express();

var bodyParser = require('body-parser');
app.use(function (req, res, next) {
    delete req.headers['content-encoding']
    next()
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))
/**
 * express允许跨域
 */
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'),
        res.header('Access-Control-Allow-Headers', ''),
        res.header('Access-Control-Allow-Method', 'PUT,POST,GET,DELETE,OPTIONS'),
        res.header('X-Powered-By', '3.2.1');
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.send('首页');
})
app.post('/api/img', async function (req, res) {
  const body = req.body
  const resData = await cropper(body.url)
  console.log('resData', resData)
  if (resData.status === 0 ){
    res.sendFile( __dirname + "/" + resData.data );
  }else {
    res.json(resData)
  }
})
app.get('/api/img', async function (req, res) {
  const params = url.parse(req.url, true).query;//解释url参数部分name=zz&age=11
  const resData = await cropper(params.url)
  if (resData.status === 0 ){
    res.sendFile( __dirname + "/" + resData.data );
  }else {
    res.json(resData)
  }
})

app.post('/login', function (req, res) {
    console.log(req.body);
    res.json({ 'msg': 'post成功' });
})


app.listen(8888, '127.0.0.1', function () {
  console.log('服务已启动，请访问：http://127.0.0.1:8888')
});
