
var express = require('express');
var MClient = require('mongodb').MongoClient;
var MServer = require('mongodb').Server;
var multer = require('multer');
var http = require('http');
var uuid = require('node-uuid');


var accounts, mongoClient;
var app = express();
app.use(multer({dest:'./uploads/'}));

app.get('/', function (req, res) {
  console.log('HERE');
  res.send('Hello World!');
});
app.post('/upload', function(req,res) {
  var jsonresp = {'response':{}, 'status':{'success':false, 'error':""}};
  //Check for empty object
  if (!Object.keys(req.files).length) {
    jsonresp.status.error = "No file uploaded";
    res.status(400).send(JSON.stringify(jsonresp));
  } else {
    jsonresp.status.success = true;
    res.status(200).send(JSON.stringify(jsonresp));
  }
});

app.post('/register', function(req,res) {
  res.type('application/json');
  var jsonresp = {'response': {}, 'status':{'success':false, 'error':""}};
  if (req.param('user') && req.param('pass')) {
    var uexist = accounts.find({"user":req.param('user')});
    uexist.count(function(err,count) {
      console.log(count);
      if (count > 0) {
        jsonresp.status.error = "ERR1 User already exists";
        res.status(404).send(JSON.stringify(jsonresp));
      } else {
        jsonresp.status.success = true;
        jsonresp.response = {"user":req.param('user'), "pass":req.param("pass"), "token":uuid.v1()};
        res.status(201).send(JSON.stringify(jsonresp));
      }
    });
  } else {
    jsonresp.status.error = "ERR0 Username or password not provided";
    res.status(400).send(JSON.stringify(jsonresp));
  }
});

var server = http.createServer(app).listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
  mongoClient = new MClient(new MServer('localhost', 27017), {w:0});
  mongoClient.open(function(err, mongoClient) {
    accounts = mongoClient.db("RTVT").collection('accounts');

  });
});

process.on ('SIGINT', function() { mongoClient.close(); process.exit();});
