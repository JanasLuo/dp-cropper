var express = require('express');

var app = express();

var bodyParser = require('body-parser');
app.use(function (req, res, next) {
    delete req.headers['content-encoding']
    next()
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.post('/login', function (req, res) {
    console.log(req.body);
    res.json({ 'msg': 'post成功' });
})

app.get('/api/news', function (req, res) {
    res.json({ 'msg': '这是新闻数据' });
})
