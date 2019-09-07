const axios = require('axios');
//const debug = require('debug')('auth');
//const config = require('../../config');
const qs = require('qs');
const AWS = require('aws-sdk');

const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwksClient = require('jwks-rsa');
const ms = require('ms');
var ObjectId = require('mongodb').ObjectID;
var faker = require('faker');
var crypto = require('crypto');

//async  function loadToken(grantType, accessToken) {
	
	//console.log([process.env.authClientId,process.env.websiteUrl,process.env.authClientSecret])
	
  //const data = {
	//grant_type: grantType,
	//client_id: process.env.authClientId,
	//code: accessToken,
	//scope: 'profile',
	//redirect_uri: process.env.websiteUrl,
  //};

  //const p = {
	//method: 'post',
	//url: process.env.authUrl + `/oauth2/token`,
	//data: qs.stringify(data),

	////auth: {
	  ////client_id: process.env.authClientId,
	//////  client_secret: process.env.authClientSecret,
	////},
  //};
	//var promise = new Promise(function(resolve,reject) {
	  //console.log(`AWS oauth2/token request parameters: ${JSON.stringify(p)}`);
	  //axios(p).then(function(awsResponse) {
	      //console.log(`AWS oauth2/token response : ${JSON.stringify(awsResponse)}`);
		  //resolve(awsResponse)
	   //});
	//})
	//return promise;
//}


	//async  function getEmailFromCode(code) {
	
		//return new Promise(function(resolve,reject) {
				
		////  loadToken('authorization_code', code).then(function(awsAuthorizationCodeResponse) {
				  

			  //const unverifiedDecodedAuthorizationCodeIdToken = jwt.decode(awsAuthorizationCodeResponse.data.id_token, { complete: true });
			  //const unverifiedDecodedAuthorizationCodeAccessToken = jwt.decode(awsAuthorizationCodeResponse.data.access_token, { complete: true });
			  //const unverifiedDecodedAuthorizationCodeRefreshToken = jwt.decode(awsAuthorizationCodeResponse.data.refresh_token, { complete: true });

			  //console.log(`AWS oauth2/token authorization code response id_token decoded but inverified: ${JSON.stringify(unverifiedDecodedAuthorizationCodeIdToken)}`);
			  //console.log(`AWS oauth2/token authorization code response access_token decoded but inverified: ${JSON.stringify(unverifiedDecodedAuthorizationCodeAccessToken)}`);
			  //debug(`AWS oauth2/token authorization code response refresh_token decoded but inverified: ${JSON.stringify(unverifiedDecodedAuthorizationCodeRefreshToken)}`);

			  //const { kid } = unverifiedDecodedAuthorizationCodeIdToken.header;


			 //async  function getKey(kidId) {
				//return new Promise(((resolve, reject) => {
				  //client.getKeys((err, keys) => {
					//const key1 = keys.find(k => k.kid === kidId);
					//resolve(key1);
				  //});
				//}));
			  //}

			  //getKey(kid).then(function(jwk) {
				  //const pem = jwkToPem(jwk);
				  //jwt.verify(awsAuthorizationCodeResponse.data.id_token, pem, { algorithms: ['RS256'] }).then(function(decodedIdToken) {
					  //console.log(`Decoded and verified id token from aws ${JSON.stringify(decodedIdToken)}`);
					  //// Make sure that the profile checkbox is selected in the App client settings in cognito for the app. Otherwise you will get just the email
					  //const { email } = decodedIdToken;
					  //const { name } = decodedIdToken;
					  //const { family_name } = decodedIdToken;
					  //const returnObject = {
						//email: email.toLowerCase(),
						//firstName: name,
						//lastName: family_name,
					  //};
					  //resolve(returnObject);
					//})
				 //})
			//})
		////})
	//}
	
	
	





function initRoutes(router,initdb) {

	router.get('/me', (req, res) => {
		//console.log('AUTH')
		//console.log(req.query.id_token)
		//var id_token = req.query.id_token;
		//if (id_token) {
			//const unverifiedDecodedAuthorizationCodeIdToken = jwt.decode(id_token, { complete: true });
			//var emailDirect = unverifiedDecodedAuthorizationCodeIdToken && unverifiedDecodedAuthorizationCodeIdToken.payload ? unverifiedDecodedAuthorizationCodeIdToken.payload.email : 'noemail';
		//console.log('ME')
		//console.log(req.user)
		let emailDirect = req.user && req.user.email ? req.user.email : ''
		if (emailDirect.length > 0) { 
			initdb().then(function(db) {
				//res.send({email:emailDirect})
							//console.log('FIND')
							//console.log(emailDirect);
				
					db.collection('users').findOne({username:emailDirect}).then(function(user) {
						if (user && user._id) {
							//console.log('found')
							//console.log(user);
							res.send(user);
						} else {
							user = {}
							user._id = ObjectId()
							user.email = emailDirect;
							user.username = emailDirect;
							var pw = crypto.randomBytes(20).toString('hex');
							user.password = pw;
							user.avatar = faker.commerce.productAdjective()+faker.name.firstName()
						
							db.collection('users').insertOne(user).then(function() {
								//console.log('inserted')
								//console.log(user);
								res.send(user);
							})
						}
					})
			})
		} else {
			res.send({})
		}
			
		//}
	})
	
	
	
	router.post('/saveuser', (req, res) => {
		initdb().then(function(db) {
			console.log(req.user);
			if (req.body._id && req.body._id.length > 0 && req.user && req.user.email && req.user.email.length > 0) {
				if (req.body.password && req.body.password.trim().length > 0 && req.body.password2 != req.body.password)  {
					res.send({warning_message:'Passwords do not match'});
				} else {
					////console.log(['find on saveuser',req.body._id]);
					db.collection('users').findOne({username: req.user.email}, function(err, item) {
					 // //console.log([err,item]);
					  if (err) {
						  //console.log(err);
						  res.send({warning_message:err});
					  } else if (item!=null) {
						  if (req.body.password && req.body.password.trim().length > 0) item.password=req.body.password;
						  item.name = req.body.name;
						  if (req.body.selectedMnemonics) item.selectedMnemonics=req.body.selectedMnemonics;
						  if (req.body.difficulty) item.difficulty=req.body.difficulty;
						  if (req.body.streak) item.streak=req.body.streak;
						  if (req.body.questions) item.questions=req.body.questions;
						  if (req.body.recall) item.recall=req.body.recall;
						  if (req.body.email_me) item.email_me=req.body.email_me;
						
						//  console.log(['TPPW',req.body.topicPasswords])
						  if (req.body.topicPasswords) item.topicPasswords=req.body.topicPasswords;
						  // update avatar only when changed
						 // //console.log(['CHECK AVATORA',item.avatar,req.body.avatar]);
						  if (req.body.avatar && req.body.avatar.length > 0 && item.avatar != req.body.avatar) {
							  db.collection('users').findOne({avatar:{$eq:req.body.avatar}}, function(err, avUser) {
								  if (avUser!=null) {
									 // //console.log('FOUND');
									  //avUser.;
									  res.send({warning_message:"Avatar name is already taken, try something different."});
								  } else {
									 // //console.log('SET');
									  item.avatar = req.body.avatar;
									  // no update email address, item.username = req.body.username;
									  //    //console.log(['save new item',item]);
									  db.collection('users').update({'_id': ObjectId(item._id)},{$set:item}).then(function(xres) {
											//res.redir(config.authorizeUrl);
										  item.warning_message="Saved changes";
										  res.send(item);
									  });  
								  }
							  });
						  } else {
							db.collection('users').update({'_id': ObjectId(item._id)},{$set:item}).then(function(xres) {
									//res.redir(config.authorizeUrl);
								  item.warning_message="Saved changes";
								  res.send(item);
							  });  
						  }
					  } else {
						  res.send({warning_message:'ERROR: No user found for update'});
					  }
					}); 
				}
			} else {
				res.send({warning_message:'Missing required information.'});
			}
		})
		////console.log('AUTH')
		////console.log(req.query.id_token)
		//let user = req.body;
		//console.log('save user')
		//console.log(user)
		//if (user._id && user._id.length > 0) {
			//initdb().then(function(db) {
				////res.send({email:emailDirect})
					//// TODO CHECK CORRECT USER AGAINST AUTH
					//let id = user._id;
					//delete user._id
					//db.collection('users').updateOne({_id:ObjectId(id)},{$set:user}).then(function() {
						//console.log('updated user')
						//res.send({OK:true})
					//})
			//})
		//}
	})
	
		//console.log('ME')
//			console.log(id_token);
//			console.log(id_token.payload);
//			console.log(id_token && id_token.payload ? id_token.payload.email : 'noemail');
		
			//loadToken('token',id_token).then(function(code) {
				//console.log('ME code')
				//console.log(code);
				//getEmailFromCode(id_token).then(function(user) {
					//console.log('ME user')
					//console.log(user);
				//})
			
//				 console.log(unverifiedDecodedAuthorizationCodeIdToken);
		//	  const { kid } = unverifiedDecodedAuthorizationCodeIdToken.header;

			//console.log(unverifiedDecodedAuthorizationCodeIdToken && unverifiedDecodedAuthorizationCodeIdToken.payload ? unverifiedDecodedAuthorizationCodeIdToken.payload.email : 'noemail');
			
					
			//const jwksUrl = process.env.authUrl + '/'+process.env.cognitoPoolId+ '/.well-known/jwks.json';
			//const client = jwksClient({
			  //cache: true,
			  //cacheMaxEntries: 5, // Default value
			  //cacheMaxAge: ms('10h'), // Default value
			  //strictSsl: true, // Default value
			  //jwksUri: jwksUrl,
			//});

			
			
			
			
			 //async  function getKey(kidId) {
				 //console.log('getkid')
				 //console.log(kidId)
				//return new Promise(((resolve, reject) => {
				  //console.log('getkid client')
				 //console.log(client)
				 
				  //client.getKeys((err, keys) => {
					//console.log('getkid client keys')
					//console.log(keys)
					//if (keys) {
						//const key1 = keys.find(k => k.kid === kidId);
						//resolve(key1);
					//} else {
						//resolve()
					//}
				  //});
				//}));
			  //}
			  //getKey(kid).then(function(jwk) {
				    //console.log('jwk');
					  //console.log(jwk);
					
				  //if (jwk) {
					  //console.log('jwk OK' );
					  
					  //const pem = jwkToPem(jwk);
					  //jwt.verify(awsAuthorizationCodeResponse.data.id_token, pem, { algorithms: ['RS256'] }).then(function(decodedIdToken) {
						  //console.log(`Decoded and verified id token from aws ${JSON.stringify(decodedIdToken)}`);
						  //// Make sure that the profile checkbox is selected in the App client settings in cognito for the app. Otherwise you will get just the email
						  //const { email } = decodedIdToken;
						  //const { name } = decodedIdToken;
						  //const { family_name } = decodedIdToken;
						  //const returnObject = {
							//email: email.toLowerCase(),
							//firstName: name,
							//lastName: family_name,
						  //};
						  //console.log(returnObject)
						  //res.send(returnObject)
						  ////resolve(returnObject);
						////})
					 //})
				  //} else {
					  //var emailDirect = unverifiedDecodedAuthorizationCodeIdToken && unverifiedDecodedAuthorizationCodeIdToken.payload ? unverifiedDecodedAuthorizationCodeIdToken.payload.email : 'noemail';
					  //res.send({email:emailDirect})

				  //}
			//}).catch(function() {
				//var emailDirect = unverifiedDecodedAuthorizationCodeIdToken && unverifiedDecodedAuthorizationCodeIdToken.payload ? unverifiedDecodedAuthorizationCodeIdToken.payload.email : 'noemail';
				//res.send({email:emailDirect})

			//})
			//});
	//	}
	
}

module.exports = initRoutes;
