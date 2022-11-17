
const jwt = require('jsonwebtoken');
var databaseConnection = null;

const MongoClient = require('mongodb').MongoClient

function initdb(req) {
    return new Promise(function(resolve,reject) {
        //await authenticate(req)
        const mongoString = process.env.MONGODB ; 

        //console.log('CONNECT',mongoString)
        if (databaseConnection !== null && databaseConnection.serverConfig && databaseConnection.serverConfig.isConnected()) {
            //console.log('ALREADY CONNECTED')
            resolve(databaseConnection)
        } else {
            //console.log([' CONNEXM',mongoString])
            MongoClient.connect(mongoString, (err, client) => {
              if (err) {
                  console.log(err)
                  return //
              }
              databaseConnection = client.db() 
              //console.log([' connected',mongoString])
              resolve(databaseConnection);
            })
        }
    })
    .finally(function() {
        //console.log('FINALLY DB DONE')
        if (databaseConnection) {
            //console.log('FINALLY DB closed')
            if (databaseConnection && databaseConnection.close) databaseConnection.close()
        }
    });
}

async function authenticate(req,res,next) {
    let token = req.headers.authorization ? req.headers.authorization : ((req.body && req.body.id_token) ? req.body.id_token : null)
    //console.log('headers',req.headers, req.body,req.query)
    if (token) { 
        //console.log('token',token)
        var emailDirect = '';
        try {
            const unverifiedDecodedAuthorizationCodeIdToken = jwt.decode(token, { complete: true });
            emailDirect = unverifiedDecodedAuthorizationCodeIdToken && unverifiedDecodedAuthorizationCodeIdToken.payload ? unverifiedDecodedAuthorizationCodeIdToken.payload.email : '';
             //console.log('email',emailDirect,unverifiedDecodedAuthorizationCodeIdToken)
             if (emailDirect.length > 0) { 
                initdb().then(function(db) {
                    //console.log('db')
                    db.collection('users').findOne({username:emailDirect}).then(function(user) {
                        if (user && user._id) {
                            //console.log('FOUND')
                            //console.log(user);
                            req.local = {user: user}
                            req.user = user
                            next()
                        } else {
                            user = {}
                            user._id = ObjectId()
                            user.email = emailDirect;
                            user.username = emailDirect;
                            var pw = crypto.randomBytes(20).toString('hex');
                            user.password = pw;
                            user.avatar = faker.commerce.productAdjective()+faker.name.firstName()
                            //console.log('CREATED')
                            //console.log(user);
                            db.collection('users').insertOne(user).then(function() {
                                //console.log('inserted')
                                //console.log(user);
                                req.user = user
                                req.local = {user: user}
                                next()
                            }) 
                        }
                    })
                }).catch(function(e) {
                  next()  
                })
            } else {
                next()
            }
            
        } catch (e) {
            console.log(e)
            next()
        }
    } else {
        next()
    }
}
module.exports = authenticate
