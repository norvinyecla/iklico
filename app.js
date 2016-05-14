var express = require('express');
var app = express();
var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/* first page to send */
app.get('/', function (req, res){
  fs.readFile('form.html', function(err, data){
    res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length });
    res.write(data);
    res.end();
  });
});

// POST http://localhost:8080/add
// parameters sent with
app.post('/add', function(req, res){
  var url = req.body;
  console.log(req.body);
  res.send('this is the original url ' + url);
});

/* forward to corresponding URL*/
app.get('/apples/:link', function(req, res){
  var shortLink = req.params.link;
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    db.collection("shortlinks").find({shortcut: shortLink}, function(err, docs) {
    docs.each(function(err, doc) {
        if(doc) {
          console.log(doc);
          res.redirect(301, 'http://' + doc.url);
        }
        else {
          res.end();
        }
      });
    });      
  });      
});

app.listen(3000, function(){
  console.log("Example app listening on port 3000!");
});

