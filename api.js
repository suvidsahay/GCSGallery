var express = require('express');
var app = express();
var session = require('express-session');
app.use(express.json())
var MongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/invide";
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false 
}));

/*
{"id": 3,"title": "Dependency management using git","tags": ["VersionControl", "DevelopmentWorkflow"],"url": "https://www.youtube.com/watch?v=oYP7W1gXzsI","category": "masterclass","speaker": {"name": "MANASWINI DAS","title": "Associate Software Engineer at Red Hat.","location": "India"},"claps": 0}
*/

var client, collection;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  client = db.db('invide')
  collection = client.collection('users');
});


app.use(express.static(__dirname + "/views"));
// Set EJS as templating engine 
app.set('view engine', 'ejs');


app.get('/', (req, res)=>{
  var video = [];
  collection.find().sort({"claps" : -1}).toArray((err, items) => {
    items.forEach(element => {
      video.push(element);
    })
    res.render('index', {
      data : video
    });
  })
});

app.get('/speakers', (req, res) => {
  var speakers = [];
  collection.distinct(
    'speaker',
    {},
    (function(err, item){
      if(err){
          res.send(err);
      }
      else{  
        item.forEach(val => {
          speakers.push(val);
        })
        res.render('speakers', {
          data : speakers
        })
      }
    })
  )
})

app.get('/video', function(req, res) {
  var video = [];
  collection.find().toArray((err, items) => {
    console.log(items)
    items.forEach(element => {
      video.push(element);
    })
    res.send(JSON.stringify(video))
  })  
  
})

app.post('/video', function(req, res) {
    var data = req.body
    
    collection.countDocuments({}, (err, result) => {
      if(err){
        res.send(err)
      }
      else{
        data.id = result + 1
        collection.insertOne(data, (err, results) => {
          if(err){
            res.send(err)
          }
          else res.send(results);
        })
      }
    })
})

app.post('/upvote', function(req, res) {
  var data = req.body
  if(req.session.upvote) {
    res.send(JSON.stringify({"error" : "cannot upvote more than once"}))
  }
  else {
    if(!data.hasOwnProperty("id")) {
      res.send(JSON.stringify({"error" : "error id not defined"}))
    }
    else {
      collection.updateOne({"id" : data.id}, {$inc : {"claps" : 1}}, function(err, result) {
        if(err) res.send(err)
        else {
          req.session.upvote = true;
          res.send(result)
        }
      })
    }
  }
})

app.get('/speakers/:name', function(req, res) {
  collection.find({"speaker.name" : req.params.name}).toArray(function(err, result) {
    if(err) {
      console.log(err)
      res.send(err)
    }
    else {
      res.render("speakerDetails", {
        data : result
      })
    }
  })
})

app.get('/leaderboard', function(req, res) {
  collection.aggregate([{"$group" : {"_id" : "$speaker", "totalClaps" : {"$sum" : "$claps"}}}]).sort({"totalClaps" : -1}).toArray(function(err, result) {
    if(err) {
      console.log(err)
      res.send(err)
    }
    else {
      console.log(result)
      res.send(result);
      // res.render("speakerDetails", {
      //   data : result
      // })
    }
  })
})

app.listen('7000')