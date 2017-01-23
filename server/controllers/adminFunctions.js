var mongo = require('mongodb').MongoClient;

module.exports.login = function (req, res){
	mongo.connect('mongodb://localhost:27017/aknApp', function(err, db) {
        if(err)
            console.log(err);
        else{
    		var Admins = db.collection('admins');
    		Admins.findOne({
    			admin: { $eq: req.body.name },
    			password : { $eq: req.body.password}
    		}, function(error, result){
                if (error){ 
                    res.send("Database error!!");
                }
                if (result){
                    res.send("Registered User!")
                }
                else
                    res.send("User not registered!");
            });
        }
        db.close();
	});
}

module.exports.consulta = function(req,res){
    mongo.connect('mongodb://localhost:27017/aknApp', function(err, db) {
        if(err)
            console.log(err);
        else{
            var cursorCollection = db.collection(req.body.collectionName).find();
            var registros=[];
            // executa para cada documento na collection
            cursorCollection.each(function(err, item) {
                // se o documento eh nulo, item sera vazio e busca eh encerrada
                if(item == null) {
                    db.close();
                    res.send(registros);
                    return;
                }
                else{
                    registros.push(item);
                }
            });
        }
    });
}

module.exports.add = function(req,res){
    mongo.connect('mongodb://localhost:27017/aknApp', function(err, db) {
        if(err)
            console.log(err);
        else{
            var Collection = db.collection(req.body.name);
            var Obj={
                customCollection: req.body.name
            }
            Collection.insert(Obj, function(error,docsInserted){
                if(docsInserted){
                    console.log("Database updated!");
                    console.log(docsInserted);
                    res.send(docsInserted);
                }
            });
            db.close();
        }
    });
}

module.exports.remove = function(req,res){
    mongo.connect('mongodb://localhost:27017/aknApp', function(err, db) {
        if(err)
            console.log(err);
        else{
            db.collection(req.body.name).drop();
            res.send("Droped collection!");
        }
        db.close();
    });
}