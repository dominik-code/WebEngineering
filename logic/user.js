var fs = require("fs");
var jwt = require('jsonwebtoken');
var userconfig = require('../user.json');

exports.login = function(req, res) {
    // find the user
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
				var token = jwt.sign(user, 'sicherespasswort', {
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
}
exports.passwordRecovery = function(req, res, istokenvalid) {
    if(istokenvalid) {
        if(userconfig.password == req.body.oldpassword) {
            // update value in Object
            userconfig.password = req.body.newpassword;
            // write to config file
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