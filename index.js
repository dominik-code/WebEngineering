var express = require("express");
var bodyParser  = require('body-parser');
var app = express();
var jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// external stored functions
var blogfunctions = require('./logic/blog.js');
var userfunctions = require('./logic/user.js');

// Variable to check if User is authenticated with valid jwt
var istokenvalid = false;



var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
console.log("API is at localhost:3000/api/V1/")

app.listen(port);



var apiRoutes = express.Router(); 
apiRoutes.use(bodyParser.urlencoded({ extended: true }));
apiRoutes.use(bodyParser.json());
// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------

// Login in API
// Input: username und password
// Output: username not found oder wrong password oder jwt
apiRoutes.put('/login', function(req, res) {
	userfunctions.login(req, res);
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, 'sicherespasswort', function(err, decoded) {			
			if (err) {
				istokenvalid = false;
                next();
                
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
                istokenvalid = true;
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		istokenvalid = false;
		next();
	}
	
});



// Platzhalter zum Testen
apiRoutes.get('/', function(req, res) {
    if(istokenvalid) {
        res.status(200).json({ message: 'Welcome to the coolest API on earth! BY HelloWorld Team'});
    } else {
        res.status(401).json({ success: false, message: 'No token provided. Unautorized'});
        
    }
});


// Password ändern
// Input: jwt,altes Passwort, neues Passwort
// Output: success und jwt oder fail
apiRoutes.put('/passwordRecovery', function (req, res) {
    userfunctions.passwordRecovery(req, res, istokenvalid);
});

// Blogbeitrag per id
// Input: jwt, id
// Output: blogeintrag oder 401 (wenn hidden und kein jwt)
apiRoutes.get('/blog/:id', function (req, res) {
    blogfunctions.showone(req, res, istokenvalid);
});


// Alle Blogbeiträge anzeigen
// Input: jwt
// Output: Blogbeiträge
apiRoutes.get('/blog/', function (req, res) {
    blogfunctions.showall(req, res, istokenvalid);
});

// Blogbeitrag löschen
// Input: jwt (für hidden)
// Output: 200 oder 401
apiRoutes.delete('/blog/:id', function (req, res) {
    blogfunctions.deletepost(req, res, istokenvalid);
});


// Blogbeitrag editieren
// Input: jwt, key-value
// Output: 200 und Objekt oder 401
apiRoutes.put('/blog/:id', function (req, res) {
    blogfunctions.updatepost(req, res, istokenvalid);
});

// Blogbeitrag anlegen
// Input: jwt
// Output: (201 und id) oder 401
apiRoutes.post('/blog', function (req, res) {
    blogfunctions.createpost(req, res, istokenvalid);
});



// Diesen Pfad als Hauptroute der API nutzen

app.use('/api/V1', apiRoutes);
