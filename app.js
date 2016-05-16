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
  var shortLink;
  do {
    shortLink = generateLink(url);
  } while (hasADuplicate(shortLink));

  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    db.collection("shortlinks").insert({url: url, shortcut: shortLink});
    console.log('done adding the url ' + shortLink + ' to the db');
  });

  console.log(shortLink);
  res.send('this is the shortened url: ' + shortLink + '<br/> this is the original url: ' + url);
});

/* forward to corresponding URL*/
app.get('/apples/:link', function(req, res){
  var shortLink = req.params.link;
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    db.collection("shortlinks").find({shortcut: shortLink}, function(err, docs) {
    docs.each(function(err, doc) {
        if(doc) {
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

function generateLink(url){
  var chars = '';
  //alpha = "abcdefghjkmnopqrstuvwxyz";
  alpha = "wxyz";
  //nums = "23456789"
  for (i = 0; i < 5; i++){
    chars += alpha.charAt(Math.floor(Math.random()*alpha.length));
  }

  for (i = 0; i < 2; i++){
    //chars += nums.charAt(Math.floor(Math.random()*nums.length));
  }

  return chars;

}

function hasADuplicate(shortLink){
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://localhost:27017/iklico", function(err, db) {
    collection = db.collection("shortlinks");

    // Insert some users
    collection.find({shortcut: shortLink}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {

        console.log("you have a duplicate "+ result.length + "! generating another");
        return true;
      } else {
        console.log("no duplicate!");
        return false;
      }
      //Close connection
      db.close();
    });

  });

  
}



