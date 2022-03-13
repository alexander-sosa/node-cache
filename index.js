var express = require('express');
var mysql = require('mysql')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var NodeCache = require('node-cache');
var cache = new NodeCache();

// Express server creation
var app = express();
app.listen(80, () => {
    console.log("Twitter server running...");
})

// Database connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'twitter',
    port: 3000
});

connection.connect((error) => {
    if(error){
        console.log("an error has ocurred while connecting to database!");
        throw error;
    }
    else{
        console.log("Connected to database...");
    }
});

// Endpoints
app.post("/user", jsonParser, (req, res, next) => {
    const username = req.body.username;
    var query = connection.query(
        'INSERT INTO users(username) VALUE (?)',
        [username],
        (error, result) => {
            if(error){
                console.log("an error has ocurred while inserting user!");

                res.status(500);
                res.send("internal server error");
            }
            else{
                //console.log(result);
                res.status(201)
                res.json({
                    "user_id": result.insertId, 
                    "username": username
                });
            }
        }
    );
});

app.post("/post", jsonParser, (req, res, next) => {
    const user_id = req.body.user_id;
    const content = req.body.content;
    var query = connection.query(
        'INSERT INTO tweets(author_id, content) VALUE (?, ?)',
        [user_id, content],
        (error, result) => {
            if(error){
                console.log("an error has ocurred while posting!");
                // console.log(error.stack);

                res.status(400);
                res.send("bad parameters!");
            }
            else{
                res.status(201)
                res.json({
                    "tweet_id": result.insertId, 
                    "author_id": user_id, 
                    "content": content
                });
            }
        }
    );
});

app.post("/follow", jsonParser, (req, res, next) => {
    const follower_id = req.body.follower_id;
    const followed_id = req.body.followed_id;    
    var query = connection.query(
        'INSERT INTO follows VALUES (?, ?)',
        [follower_id, followed_id],
        (error, result) => {
            if(error){
                console.log("an error has ocurred while following!");
                // console.log(error.stack);

                res.status(400);
                res.send("bad parameters!");
            }
            else{
                // delete follower cache to force a refresh
                cache.del(follower_id);

                res.status(200)
                res.send("Now " + follower_id + " is following " + followed_id);
            }
        }
    );
});

app.get("/timeline/:user_id", (req, res, next) => {
    const user_id = req.params.user_id;
    if(cache.has(user_id)){
        console.log("cache hit");
        res.status(200);
        res.json(cache.get(user_id));
    }
    else{
        console.log("db query...");
        var query = connection.query(
            'SELECT tweets.content, tweets.tweet_date, followed.username, followed.user_id FROM tweets LEFT JOIN users followed ON followed.user_id = tweets.author_id LEFT JOIN follows ON followed.user_id = follows.followed_id LEFT JOIN users follower ON follower.user_id = follows.follower_id WHERE follows.follower_id = ? ORDER BY tweets.tweet_date DESC',
            [user_id],
            (error, result) => {
                if(error){
                    console.log("an error has ocurred while getting feed!");
                    // console.log(error.stack);

                    res.status(400);
                    res.send("bad parameters!");
                }
                else{
                    var tweets = [];
                    for(let i = 0; i<result.length; i++){
                        tweets.push({
                            "author_id": result[i].user_id,
                            "username": result[i].username, 
                            "content": result[i].content,
                            "date": result[i].tweet_date
                        });
                    }
                    if(result.length !== 0) cache.set(user_id, tweets, 60);
                    res.status(200); 
                    res.json(tweets);
                }
            }
        );
    }
});

app.get("/cache_stats", (req, res, next) => {
    res.status(200);
    res.json(cache.stats);
});
