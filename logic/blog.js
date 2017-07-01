var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;
var blog = require('../blog.json');

exports.showall = function(req, res, istokenvalid) {
    if(istokenvalid) {
        // alle blogeinträge
        res.status(200).json(blog);
    } else {
        // nur blogeinträge mit hidden == false
        res.status(200).json(blog.filter(function(item){
            return (item.hidden == false);
        }));
    }
}

exports.showone = function(req, res, istokenvalid) {
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
}

exports.createpost = function(req, res, istokenvalid) {
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
}

exports.updatepost = function(req, res, istokenvalid) {
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
}

exports.deletepost = function(req, res, istokenvalid) {
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
}