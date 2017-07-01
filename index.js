var express = require("express");
var bodyParser  = require('body-parser');
var app = express();
var jwt = require('jsonwebtoken');
var ObjectID = require('mongodb').ObjectID;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var userconfig = require('./user.json');
var blog = require('./blog.json');
var fs = require("fs");

// Variable to check if User is authenticated with valid jwt
var istokenvalid = false;



var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
console.log("API is at localhost:3000/api/V1/")

app.set('superSecret', 'sicherespasswort');

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
    if(istokenvalid) {
        console.log(userconfig.password + " - "+ req.body.oldpassword);
       
        if(userconfig.password == req.body.oldpassword) {
            // update value in Object
            userconfig.password = req.body.newpassword;
            // write to config file
            fs.writeFile('./user.json', JSON.stringify(userconfig), 'utf-8', (err) => {
                if (err) {
                    res.status(401).json({error: err});
                } else {   
                    res.status(200).json({ message: 'password changed'});
                    delete require.cache["./user.json"];
                }
            });
        } else {
            res.status(401).json({ message: 'old password invalid'});
        }
    } else {
        res.status(401).json({ message: 'token is invalid'});
    }
});

// Blogbeitrag per id
// Input: jwt, id
// Output: blogeintrag oder 401 (wenn hidden und kein jwt)
apiRoutes.get('/blog/:id', function (req, res) {
    console.log("Hier in id route");
    if (blog[req.params.id].hidden) {
        if(istokenvalid) {
            // blogeintrag senden
            res.status(200).json(blog[req.params.id]);
        } else {
            // 401 da hidden und jwt ungültig
            res.status(401).json({message : 'kein zugang'});
        }
    } else {
        // blogeintrag senden
        res.status(200).json(blog[req.params.id]);
    }
});


// Alle Blogbeiträge anzeigen
// Input: jwt
// Output: Blogbeiträge
apiRoutes.get('/blog/', function (req, res) {
    console.log("Hier in allen ");
    if(istokenvalid) {
        // alle blogeinträge
        res.status(200).json(blog);
    } else {
        // nur blogeinträge mit hidden == false
        res.status(200).json(blog.filter(function(item){
            return (item.hidden == false);
        }));
    }
});

// Blogbeitrag löschen
// Input: jwt (für hidden)
// Output: 200 oder 401
apiRoutes.delete('/blog/:id', function (req, res) {
    if (blog[req.params.id].hidden) {
        if(istokenvalid) {
            // Item aus Array entfernen
            blog.splice(req.params.id ,1);
            // JSON dauerhaft speichern
            fs.writeFile('./blog.json', JSON.stringify(blog), 'utf-8', (err) => {
                if (err) {
                    res.status(401).json({error: err});
                } else {   
                    res.status(200).json({ message: 'blog entry deleted'});
                    delete require.cache["./blog.json"];
                }
            });
        } else {
           // hidden aber jwt ungültig dann 401
            res.status(401).json({ message: 'jwt not valid'});
        }
    } else {
        // löschen 200
        blog.splice(req.params.id ,1);
        
        fs.writeFile('./blog.json', JSON.stringify(blog), 'utf-8', (err) => {
                if (err) {
                    res.status(401).json({error: err});
                } else {   
                    res.status(200).json({ message: 'blog entry deleted'});
                    delete require.cache["./blog.json"];
                }
            });
    }
});


// Blogbeitrag editieren
// Input: jwt, key-value
// Output: 200 und Objekt oder 401
apiRoutes.put('/blog/:id', function (req, res) {
    console.log(req.params.id);
    if(blog[req.params.id].hidden) {
        if(istokenvalid) {
            // edit blog und 200 + objekt
            // nur übernehmen wenn auch im request vorhanden, ansonnsten wird nichts geändert
            blog[req.params.id].title   = req.body.title    || blog[req.params.id].title;
            blog[req.params.id].picture = req.body.picture  || blog[req.params.id].picture;
            blog[req.params.id].author  = req.body.author   || blog[req.params.id].author;
            blog[req.params.id].about   = req.body.about    || blog[req.params.id].about;
            blog[req.params.id].released= req.body.released || blog[req.params.id].released;
            blog[req.params.id].hidden  = req.body.hidden   || blog[req.params.id].hidden;
            // this is an array
            blog[req.params.id].tags = req.body.tags || blog[req.params.id].tags;
            
            // write to blog file
            fs.writeFile('./blog.json', JSON.stringify(blog), 'utf-8', (err) => {
                if (err) {
                    res.status(401).json({error: err});
                } else {   
                    res.status(200).json(blog[req.params.id]);
                    delete require.cache["./blog.json"];
                }
            });
        } else {
            // 401
            res.status(401).json({ message: 'jwt not valid'});
        }
    } else {
        // edit blog und 200 + objekt
        // nur übernehmen wenn auch im request vorhanden, ansonnsten wird nichts geändert
        blog[req.params.id].title   = req.body.title    || blog[req.params.id].title;
        blog[req.params.id].picture = req.body.picture  || blog[req.params.id].picture;
        blog[req.params.id].author  = req.body.author   || blog[req.params.id].author;
        blog[req.params.id].about   = req.body.about    || blog[req.params.id].about;
        blog[req.params.id].released= req.body.released || blog[req.params.id].released;
        blog[req.params.id].hidden  = req.body.hidden   || blog[req.params.id].hidden;
        // this is an array
        blog[req.params.id].tags = req.body.tags || blog[req.params.id].tags;
        
        // write to blog file   
        fs.writeFile('./blog.json', JSON.stringify(blog), 'utf-8', (err) => {
            if (err) {
                res.status(401).json({error: err});
            } else {   
                res.status(200).json(blog[req.params.id]);
                delete require.cache["./blog.json"];
            }
        });
    }
});

// Blogbeitrag anlegen
// Input: jwt
// Output: (201 und id) oder 401
apiRoutes.post('/blog', function (req, res) {
    if(istokenvalid) {
        // beitrag mit den selben attributen wie vorherige anlegen
        if (!req.body.title || !req.body.picture || !req.body.author || !req.body.about || !req.body.released || !req.body.hidden || !req.body.tags) {
            res.status(401).json({message: 'not all parameters set'});
        } else {
            // new entry will get pushed to blog after filled with data
            // get an index
            var newindex = 0;
            while (typeof blog[newindex] !== 'undefined') {
                newindex++;
            }
            
            var newentry = {
                _id : new ObjectID(),
                index : newindex,
                title : req.body.title,
                picture : req.body.picture,
                author : req.body.author,
                about : req.body.about,
                released : req.body.released,
                hidden : req.body.hidden,
                tags : req.body.tags
            };
            // add to blog
            blog.push(newentry);
            // write to file
            fs.writeFile('./blog.json', JSON.stringify(blog), 'utf-8', (err) => {
                if (err) {
                    res.status(401).json({error: err});
                } else {   
                    res.status(200).json({ id: newindex});
                    delete require.cache["./blog.json"];
                }
            });
        }
    } else {
        // kein beitrag anlegen
        res.status(401).json({ message: 'jwt not valid'});
    }
});



// Diesen Pfad als Hauptroute der API nutzen

app.use('/api/V1', apiRoutes);
