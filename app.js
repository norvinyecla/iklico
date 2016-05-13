var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var MongoClient = require('mongodb').MongoClient;

/* first page to send */
app.get('/', function (req, res){
  res.send("Hello World!");
});

// POST http://localhost:8080/add
// parameters sent with
app.post('/add', function(req, res){
  var url = req.body.url;

  res.send('this is the original url ' + url);
});

/* forward to corresponding URL*/
app.get('/:link', function(req, res){
  var shortLink = req.params.link;

  MongoClient.connect('mongodb://localhost:27017/iklico', function(err, db) {
  if (err) {
    throw err;
  }
  db.collection('shortlinks').find({shortcut: shortLink}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
  realUrl = result[0].url; 
  console.log(realUrl); 
  res.redirect(301, 'http://' + realUrl);
  });
});

});

app.listen(3000, function(){
  console.log("Example app listening on port 3000!");
});

