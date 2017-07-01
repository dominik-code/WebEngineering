//  _   _         _    _           _       _              _        _ 
// ( ) ( )       (_ ) (_ )        ( )  _  ( )            (_ )     ( )
// | |_| |   __   | |  | |    _   | | ( ) | |   _    _ __ | |    _| |
// |  _  | /'__`\ | |  | |  /'_`\ | | | | | | /'_`\ ( '__)| |  /'_` |
// | | | |(  ___/ | |  | | ( (_) )| (_/ \_) |( (_) )| |   | | ( (_| |
// (_) (_)`\____)(___)(___)`\___/'`\___x___/'`\___/'(_)  (___)`\__,_)

// Team: Alexander Bierenstiel, Dominik Schmitt, Timo Rautenberg

// Abhängigkeiten einbinden
var express = require("express");
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

// Externe Funktionen der Routen
var blogfunctions = require('./logic/blog.js');
var userfunctions = require('./logic/user.js');

// Webservice erstellen
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;
app.listen(port);
console.log("API is at localhost:3000/api/V1/");

// Variable zum Login prüfen, ob der jwt gültig war
var istokenvalid = false;

// Router als Middleware zur API Schnittstelle
var apiRoutes = express.Router();

// Alle Bestandteile des Bodys parsen
apiRoutes.use(bodyParser.urlencoded({extended: true}));
apiRoutes.use(bodyParser.json());

// Authentification ohne Login Prüfung, da hier erst eingeloggt wird 
// Login in API
// Input: username und password
// Output: username not found oder wrong password oder jwt
apiRoutes.put('/login', function (req, res) {
    userfunctions.login(req, res);
});

// Middleware wird benutzt um Token zu verifizieren und autorisieren
apiRoutes.use(function (req, res, next) {
    // Folgende Parameter werden auf einen JsonWebToken geprüft
    var token = req.body.token || req.headers['x-access-token'];
    // Wenn jwt vorhanden
    if (token) {
        // Prüft den Token und schaut, ob dieser noch gültig ist
        jwt.verify(token, 'sicherespasswort', function (err, decoded) {
            if (err) {
                // Im Fehlerfall wird der Token als ungültig erklärt
                istokenvalid = false;
                next();
            } else {
                // Wenn die Prüfung erfolgreich war wird der Zugang per jwt gewährt
                req.decoded = decoded;
                istokenvalid = true;
                next();
            }
        });
    } else {
        // Im Fehlerfall kein Login erlaubt
        istokenvalid = false;
        next();
    }
});

// Platzhalter zum Testen der API (nicht in der Aufgabenstellung benötigt
apiRoutes.get('/', function (req, res) {
    if (istokenvalid) {
        res.status(200).json({message: 'Welcome to the coolest API on earth! BY HelloWorld Team'});
    } else {
        res.status(401).json({success: false, message: 'No token provided. Unautorized'});
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
