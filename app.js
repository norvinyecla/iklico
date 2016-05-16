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
  var url = req.body.url;
  do {
    console.log('generating link');
    shortLink = generateLink(url);

  } while (hasADuplicate(shortLink));

  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    db.collection("shortlinks").insert({url: url, shortcut: shortLink});
    console.log('done adding the url to the db');
  });

  console.log(shortLink);
  res.send('this is the shortened url: ' + shortLink + '<br/> this is the original url' + url);
});

/* forward to corresponding URL*/
app.get('/apples/:link', function(req, res){
  var shortLink = req.params.link;
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    db.collection("shortlinks").find({shortcut: shortLink}, function(err, docs) {
    docs.each(function(err, doc) {
        if(doc) {
          res.send('original URL is '+shortLink);
          console.log(doc);
          //res.redirect(301, 'http://' + doc.url);
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

function generateLink(url){
  var chars = '';
  alpha = "abc";
  nums = "23456789"
  for (i = 0; i < 2; i++){
    chars += alpha.charAt(Math.floor(Math.random()*alpha.length));
  }

  // for (i = 0; i < 2; i++){
  //   chars += nums.charAt(Math.floor(Math.random()*nums.length));
  // }

  return chars;

}

function hasADuplicate(shortLink){
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    db.collection("shortlinks").find({shortcut: shortLink}, function(err, docs) {
      if (docs.count() > 0) {
        console.log("has a duplicate.");
        return true;
      }
      else {
        console.log(docs);
        return false;
      }
    });
  });
}



