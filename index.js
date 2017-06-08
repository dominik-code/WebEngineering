var express = require("express");
var bodyParser  = require('body-parser');
var app = express();
var jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var userconfig = require('./user.json');
var blog = require('./blog.json');

var istokenvalid = false;

console.log(app.path());
console.log(userconfig);
console.log(userconfig.username);



var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
app.set('superSecret', 'sicherespasswort');

app.listen(port);
app.get('/', function(req, res) {
    res.send('Hallo willkommen');
});


var apiRoutes = express.Router(); 
apiRoutes.use(bodyParser.urlencoded({ extended: true }));
apiRoutes.use(bodyParser.json());
// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
apiRoutes.put('/login', function(req, res) {

	// find the user
    console.log("user login");
    console.log(userconfig.username + " und " + Object.keys(req.body));
	if(userconfig.username == req.body.username) {
        var user = userconfig;
		
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {
			// check if password matches
			if (user.password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {
				// if user is found and password is right
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: 31536000 // expires in 1 year
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}		

		}

	} else {
        res.json({ success: false, message: 'Authentication failed. User not found' });
        
        
    }
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
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
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

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', function(req, res) {
    if(istokenvalid) {
        res.json({ message: 'Welcome to the coolest API on earth!' });
    } else {
        res.status(401).send({ success: false, message: 'No token provided. Unautorized'});
        
    }
});



apiRoutes.put('/passwordRecovery', function (req, res) {
  res.send('PUT pwrecov');
});

apiRoutes.put('/blog/:id', function (req, res) {
  res.send('PUT blog with id');
});

apiRoutes.get('/blog', function (req, res) {
  res.send('GET all blog entry');
});

apiRoutes.get('/blog/:id', function (req, res) {
  res.send('GET blog entry id');
});

apiRoutes.delete('/blog/:id', function (req, res) {
  res.send('DELETE blog entry');
});

apiRoutes.post('/blog', function (req, res) {
  res.send('POST blog entry');
});





app.use('/api', apiRoutes);
