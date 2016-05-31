var express = require('express');
var app = express();
var fs = require('fs');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

/* first page to send */
app.get('/', function (req, res){
  res.render('form');
});

/* successfully added to db */
app.post('/success', function(req, res){
  var url = req.body.url;
  var shortLink;
  do {
    shortLink = generateLink(url);
  } while (hasADuplicate(shortLink));

  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://192.168.17.135:56565/iklico", function(err, db) {
    db.collection("shortlinks").insert({url: url, shortcut: shortLink});
  });

  res.render('success', {shortlink: shortLink});  });

/* forward to corresponding URL*/
app.get('/:link', function(req, res){
  var shortLink = req.params.link;
  var MongoClient = require('mongodb').MongoClient;

  MongoClient.connect("mongodb://192.168.17.135:56565/iklico", function(err, db) {
    db.collection("shortlinks").find({shortcut: shortLink}, function(err, docs) {
    docs.each(function(err, doc) {
        if(doc) {
          res.redirect(301, qualifyUrl(doc.url));
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
  alpha = "abcdefghjkmnopqrstuvwxyz";
  nums = "23456789"
  for (i = 0; i < 5; i++){
    chars += alpha.charAt(Math.floor(Math.random()*alpha.length));
  }

  for (i = 0; i < 2; i++){
    chars += nums.charAt(Math.floor(Math.random()*nums.length));
  }

  return chars;

}

function hasADuplicate(shortLink){
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://192.168.17.135:56565/iklico", function(err, db) {
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

function qualifyUrl(url){
  if (url.lastIndexOf('https://', 0) === 0 || url.lastIndexOf('http://', 0) === 0 ){
    return url;
  }
  else return 'http://' + url;
}




