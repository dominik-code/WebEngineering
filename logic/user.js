// Alle Abhängigkeiten einbinden
var fs = require("fs");
var jwt = require('jsonwebtoken');
var userconfig = require('../user.json');

exports.login = function(req, res) {
    // User finden
	if(userconfig.username == req.body.username) {
        var user = userconfig;
		
		if (!user) {
			res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {
			// Prüfen ob Passwort stimmt
			if (user.password != req.body.password) {
				res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {
				// Wenn User existiert und Passwort stimmt wird ein jwt erzeugt
				var token = jwt.sign(user, 'sicherespasswort', {
					expiresIn: 31536000 // expires in 1 year
				});

				res.status(200).json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}		
		}
	} else {
        res.status(401).json({ success: false, message: 'Authentication failed. User not found' });
    }
}
exports.passwordRecovery = function(req, res, istokenvalid) {
    if(istokenvalid) {
        if(userconfig.password == req.body.oldpassword) {
            var user = userconfig;
            // Wert im Objekt ändern
            userconfig.password = req.body.newpassword;
            // Objekt zurück in Datei schreiben
            fs.writeFile('./user.json', JSON.stringify(userconfig), 'utf-8', (err) => {
                if (err) {
                    res.status(401).json({error: err});
                } else {   
                    var token = jwt.sign(user, 'sicherespasswort', {
                        expiresIn: 31536000 // expires in 1 year
                    });
                    res.status(200).json({ token: token});
                    delete require.cache["./user.json"];
                }
            });
        } else {
            res.status(401).json({ message: 'old password invalid'});
        }
    } else {
        res.status(401).json({ message: 'token is invalid'});
    }
    
}