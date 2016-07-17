var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var app = express();
var conString = 'postgres://gbpfdujmzodkik:RcoNblyAq5nuMAKFP81IWyALF-@ec2-54-225-151-64.compute-1.amazonaws.com:5432/dasp62midgd3k5';
var nodemailer = require("nodemailer");
app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/db', function (request, response) {
	    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		    client = new pg.Client;
		    client.query('SELECT * FROM test_table', function(err, result) {
			done();
			if (err)
			    { console.error(err); response.send("Error " + err); }
			else
			    { response.render('pages/db', {results: result.rows} ); }
		    });
	    });
    })

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/bookit', function(request, response) {
  response.render('pages/bookit');
});

app.get('/cool', function(request, response) {
	response.send(cool());
});

app.post('/trip_notes', function(req, res) {
	var results = [];
	console.log(req.body);
	var data = req.body;
    smtpTransport.sendMail({
       from: "Travel Buddy <fun-instigator@justpack.co>", // sender address
       to: "Boss <ajcihla@gmail.com>", // comma separated list of receivers
       subject: "Bro, New Trip NOTES", // Subject line
       text: "Check it out " + JSON.stringify(data) + JSON.stringify(app.locals.email) // plaintext body
    }, function(error, response){
       if(error){
           console.log(error);
       }else{
           console.log("Message sent: " + response.message);
       }
    });
    res.render('pages/index');
});

app.post('/bookit', function(req, res) {
	var results = [];
	console.log(req.body);
	var data = req.body;
    smtpTransport.sendMail({
       from: "Travel Buddy <fun-instigator@justpack.co>", // sender address
       to: "Boss <ajcihla@gmail.com>", // comma separated list of receivers
       subject: "Bro, New Trip NOTES", // Subject line
       text: "Check it out " + JSON.stringify(data) // plaintext body
    }, function(error, response){
       if(error){
           console.log(error);
       }else{
           console.log("Message sent: " + response.message);
       }
    });
    res.render('pages/index');
});

app.post('/signup', function(req, res) {
	var results = [];
	console.log(req.body);
    // Grab data from http request
    var data = {phone: req.body.phone, email : req.body.email};
    pg.defaults.ssl = true;
    app.locals.email = req.body.email;
    // Get a Postgres client from the connection pool
    pg.connect(conString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }
        // SQL Query > Insert Data
        client.query("INSERT INTO request_sample(phone, email) values($1, $2)", [data.phone, data.email]);
        console.log('inserted ', data);
    });
    //send email to AJ
    smtpTransport.sendMail({
       from: "Textbod Buddy <alex.cihla@gmail.com>", // sender address
       to: "Boss <ajcihla@gmail.com>", // comma separated list of receivers
       subject: "Yo dude, New Textbod Request", // Subject line
       text: "Check it out " + JSON.stringify(data) // plaintext body
    }, function(error, response){
       if(error){
           console.log(error);
       }else{
           console.log("RB-internal email sent: " + response.message);
       }
    });
    //send email to customer
    smtpTransport.sendMail({
       from: "Textbod Life<textybod@gmail.com>", // sender address
       to: JSON.stringify(data.email), // comma separated list of receivers
       subject: "Waitlist: All trainers are busy with other clients, we will reach out shortly", // Subject line
       text: "We'll get back to you as quickly as we can when the next available trainer becomes available. You'll receive a discount on any future business because we appreciate you (and your patience). Thanks! \n\n -textbod team" // plaintext body
    }, function(error, response){
       if(error){
           console.log(error);
       }else{
           console.log("Customer email sent: " + response.message);
       }
    });
    res.render('pages/congrats');
});

