// ses sendmail
const AWS = require('aws-sdk');
const SES = new AWS.SES({ region: 'us-west-2' });
// mongo
const mongoString = process.env.MONGODB ; 
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const validator = require('validator');
// support serverless offline
for (let model in mongoose.models) delete mongoose.models[model]
const UserModel = require('./model/User.js');
//base
const serverless = require('serverless-http');
const express = require('express')
const bodyParser= require('body-parser')
const app = express()

const jwt = require('jsonwebtoken');

// body parser doesn't seem to work with serverless-http ??
// this method requires that all POST submissions are application/json encoded
app.use(function(req,res,next) {

	//console.log('PRE')
	//console.log(process.env)
	//console.log(req.headers.authorization);
	
	// extract email address from auth header and set req.user.email
	let token = req.headers.authorization ? req.headers.authorization : ((req.query && req.query.id_token) ? req.query.id_token : null)
	
	if (token) { 
		console.log('auth')
		var emailDirect = '';
		try {
			const unverifiedDecodedAuthorizationCodeIdToken = jwt.decode(token, { complete: true });
			emailDirect = unverifiedDecodedAuthorizationCodeIdToken && unverifiedDecodedAuthorizationCodeIdToken.payload ? unverifiedDecodedAuthorizationCodeIdToken.payload.email : '';
			req.user={email:emailDirect}
			console.log(['set user from token',emailDirect])
		} catch (e) {
			console.log(e)
		}
	}
	
	//console.log(['user from token',req.user])
	
	// convert req.body to JSON
	if (req.body) {
		//console.log('PREbody')
		try {
			var body = JSON.parse(req.body.toString())
			//console.log('success parse body')
			//console.log(body);
			req.body = body;
		} catch (e) {
			req.body = {};
			//console.log('fail parse body - '+req.body.toString())
		}
		next()
	}
})

//app.use(bodyParser.json({limit: '50mb', extended: true}))
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

//app.use(express.json()) // for parsing application/json
//app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded



const path = require('path')
const fs = require('fs')


var router = express.Router();

var ObjectId = require('mongodb').ObjectID;
var LongInt = require('mongodb').Long;

const get = require('simple-get');
const mustache = require('mustache');
var fetch = require('node-fetch');

const MongoClient = require('mongodb').MongoClient
var request = require('request')




// DATABASE SUPPORT FUNCTIONS

const dbExecute = (db, fn) => db.then(fn).finally(() => mongoose.disconnect())

function dbConnectAndExecute(dbUrl, fn) {
	//console.log([' CONNEX',dbUrl])
  return dbExecute(mongoose.connect(dbUrl,{}), fn);
}

var databaseConnection = null;

function initdb() {
	return new Promise(function(resolve,reject) {
		//console.log([databaseConnection])
		if (databaseConnection !== null && databaseConnection.serverConfig.isConnected()) {
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



var initUtilsRoutes = require('./api_utils')
var initCommentsRoutes = require('./api_comments')
var initMnemonicsRoutes = require('./api_mnemonics')
var initUserTopicsRoutes = require('./api_usertopics')
var initMultipleChoiceQuestionsRoutes = require('./api_multiplechoicequestions')
var initNewsletterRoutes = require('./api_newsletter')
var initAuthRoutes = require('./api_auth')


//initdb().then(function(db) {
	
	initUtilsRoutes(router,initdb);
	initCommentsRoutes(router,initdb);
	initMnemonicsRoutes (router,initdb);
	initUserTopicsRoutes(router,initdb);
	initMultipleChoiceQuestionsRoutes(router,initdb);
	initNewsletterRoutes(router,initdb);
	initAuthRoutes(router,initdb)
	

	router.get('/guid', (req, res) => {
		//console.log(['guid',req.query.guid]);
				
		if (req.query.guid && req.query.guid.length > 0) {
			initdb().then(function(db) {
				db.collection('questions').findOne({guid:{$eq:req.query.guid}}).then(function(question) {
				//	console.log(['guid res',question]);
					res.send(question && question._id ? question : {});
				});
			})
		} else {
			res.send({});
		}
	})
	
	router.get('/mcguid', (req, res) => {
		//console.log(['mcguid',req.query.guid]);
		
		if (req.query.guid && req.query.guid.length > 0) {
			initdb().then(function(db) {
				db.collection('multiplechoicequestions').find({guid:{$eq:req.query.guid}}).toArray().then(function(questions) {
				//	console.log(['mcguid res',questions]);
					res.send(questions ? questions : []);
				});
			})
		} else {
			res.send({});
		}
	})
		
	// proxy feed request and convert xml to json
	router.get('/feedproxy', (req, res) => {
		//console.log(['FEEDPROXY',req.query.url])
		if (req.query.url) {// && req.query.url.indexOf('abc.net.au' !== -1)) {
			var expat = require('node-expat');
			var Slicer = require('node-xml-slicer');
			var parser = expat.createParser();
			var rootSlicer = new Slicer(parser);
			//var itemSlicer = new Slicer(parser, '/root/items/item');
			fetch(req.query.url, {
			  method: 'GET',
			}).then(function(response) {
				return response.text();
			}).then(function(text) {
				//console.log('got data');
				//console.log(text);
				//console.log('========================================');
				let parts = text.split("&#039;");
				parser.write(parts.join(''))
				res.send(rootSlicer.result)
			}).catch(function(e) {
				console.log(e);
			})
		} else {
			res.send({})
		}
	})
	
	router.get('/pageproxy', (req, res) => {
		if (req.query.url && req.query.url.indexOf('abc.net.au' !== -1)) {
			var expat = require('node-expat');
			var JSSoup = require('jssoup').default;
			//var itemSlicer = new Slicer(parser, '/root/items/item');
			fetch(req.query.url, {
			  method: 'GET',
			}).then(function(response) {
				return response.text();
			}).then(function(text) {
			//	console.log('========================================');
				var soup = new JSSoup(text);
				let topLevelDivs = soup.findAll('div')
				//console.log(topLevelDivs)
				//console.log(soup)
				
				let found = [];
				topLevelDivs.map(function (tld) {
					if (tld.attrs.hasOwnProperty('class') && tld.attrs['class'].indexOf('article section') !== -1) {
						let ps = tld.findAll('p')
						ps.map(function(p) {
							if (!p.attrs['class'] || (p.attrs['class'] && p.attrs['class'].indexOf('topic') !== -1 && p.attrs['class'].indexOf('published') !== -1))  {
								if (p.getText().trim().length > 0) {
									if (p.parent &&  p.parent.attrs['class'] && ((p.parent.attrs['class'].indexOf('author')) !== -1 || (p.parent.attrs['class'].indexOf('state') !== -1 ))) {
										// ignore these
									} else { 
										found.push('<p>'+p.getText()+'</p>')
									}
								} else {
									found.push('<br/>')
								}
							}
						})
					}
					
				})
				
				//console.log(found);
				//let parts = text.split("&#039;");
				//parser.write(parts.join(''))
				//console.log('========================================');
				res.send(found)
			})
		} else {
			res.send([])
		}
	})
	
	router.post('/importquestion', (req, res) => {
		
		// min requirements
		if (req.body.question && req.body.question.length > 0 && req.body.importtype && req.body.importtype.length > 0) {
			initdb().then(function(db) {

			//	console.log('import question')
				//console.log(JSON.stringify(req.body));
				let user = req.body.user;
				function saveToReviewFeed(user,question) {
					let ts = new Date().getTime()
					db.collection('seen').insertOne({user:ObjectId(user),question:ObjectId(question._id),timestamp:ts}).then(function(inserted) {
					   //console.log(['seen inserted']);
						// collate tally of all seen, calculate success percentage to successScore
						updateQuestionTallies(req.body.user,question._id).then(function() {
							res.send({message:'Sent question to review'});
						})
					}).catch(function(e) {
						res.send({error:e});
					});
				}
				
				// try find the question by _id
				let andPart = {_id:{$eq:req.body.question}}
				// allow for find existing question by guid  
				if (req.body.guid && req.body.guid.length > 0) {
					andPart = {guid:{$eq:req.body.guid}}
					console.log('find by guid')
				} 							
				
				db.collection('questions').findOne({$and:[
													{importtype:{$eq:req.body.importtype}},
													andPart  
											]}).then(function (question) {
					if (question) {
						//console.log('use existing question')
						if (req.body.mcQuestions) {
							//console.log(['GEN QUESTIONS update ',req.body.mcQuestions])
							// cleanup then save again
							db.collection('multiplechoicequestions').deleteMany({questionId:{$eq:ObjectId(question._id)}}).then(function() {
								req.body.mcQuestions.map(function(mc) {
								//	console.log(['save mc',mc]);
									mc.questionId = question._id;
									db.collection('multiplechoicequestions').insertOne(mc).then(function(mcres) {
									//	console.log(['saved mc',mc,mcres]);
									})
								})
							})
						}
						if (question.mnemonic && question.mnemonic.length> 0) {
							 //console.log('sdel mnem '+question.mnemonic);
							 db.collection('mnemonics').remove({$and:[{user:'default'},{importId:'userimport'},{importtype:'abcnews'},{question:question._id}]}).then(function(dresults) {
							   //console.log('sdel mnem deleted0')
							   //console.log(dresults);
							   db.collection('mnemonics').insert({user:'default',question:question._id,mnemonic:question.mnemonic,questionText:question.question,technique:question.mnemonic_technique,importId:'userimport',importype:'abcnews'});
							})	
						}
						
						db.collection('questions').updateOne({_id:question._id},{$set:Object.assign(question,req.body)}).then(function() {
							saveToReviewFeed(req.body.user,question);
						});
					} else {
						//console.log('use new question')
						// otherwise create the question
						let question = req.body;
						question._id = new ObjectId()
						question.importId = "userimport"
						//console.log(['GEN QUESTIONS',req.body.mcQuestions])
						if (question.mnemonic && question.mnemonic.length> 0) {
							 //console.log('sdel mnem '+question.mnemonic);
							 db.collection('mnemonics').remove({$and:[{user:'default'},{importId:'userimport'},{importtype:'abcnews'},{question:question._id}]}).then(function(dresults) {
							   //console.log('sdel mnem deleted0')
							   //console.log(dresults);
							   db.collection('mnemonics').insert({user:'default',question:question._id,mnemonic:question.mnemonic,questionText:question.question,technique:question.mnemonic_technique,importId:'userimport',importype:'abcnews'});
							})	
						}
							
						if (req.body.mcQuestions) {
							//console.log(['GEN QUESTIONS',req.body.mcQuestions])
							req.body.mcQuestions.map(function(mc) {
								//console.log(['save mc',mc]);
								mc.questionId = question._id;
								db.collection('multiplechoicequestions').insertOne(mc).then(function(mcres) {
								//	console.log(['saved mc',mc,mcres]);
								})
							})
						}
						
						db.collection('questions').insertOne(question).then(function (result) {
							saveToReviewFeed(req.body.user,question);
						});
					}
				})
			})
		} else {
				res.send({error:'Insufficient data'});
				
		}	
		
		
		
	})
	
	router.get('/blocktopic', (req, res) => {
		if (req.query.user && req.query.user.length > 0 && req.query.topic && req.query.topic.length > 0) {
			let criteria=[];
			if (req.query.user) {
				criteria.push({$or:[{access:{$eq:req.query.user}},{access:{$eq:'public'}}]})
			} else {
				criteria.push({access :{$eq:'public'}});
			}
			let topic = req.query.topic.trim(); //.toLowerCase(); 
			criteria.push({'quiz': {$eq:topic}});
		  //  //console.log(['topic search C    ',criteria]);
			initdb().then(function(db) {
				db.collection('questions').find({$and:criteria}).sort({sort:1}).toArray(function(err, results) {
				  if (results) {
					  results.map(function(val,key) {
						  blockQuestion(req.query.user,val._id,topic);
					  });
					  res.send({'blocked':true});
				  } else {
					  res.send({'noqtoblock':true});req.body.question
				  }
				})
			})
		}
	});

	router.get('/unblocktopic', (req, res) => {
		if (req.query.user && req.query.user.length > 0 && req.query.topic && req.query.topic.length > 0) {
			let criteria=[];
			criteria.push({user :{$eq:ObjectId(req.query.user)}});
			criteria.push({topic :{$eq:req.query.topic}});
			// delete all userquestionprogress with matching topic
			initdb().then(function(db) {
				db.collection('userquestionprogress').remove({$and:criteria});
			})
			res.send({'blocked':true});
			
		}
	});

		// 'successTally':{$lt : 4}}  // retire topics after all questions have successTally 4
			   
	router.get('/recenttopics', (req, res) => {
		if (req.query.user && req.query.user.length > 0) {
			let collatedTopics={};
			//
		   // $or:[{'successTally':{$lt : 7}},{'successTally':{$exists : false}}]
			initdb().then(function(db) {

				//  collate all user progress by topic
				db.collection('userquestionprogress').aggregate([
					{ $match: {
							$and:[{'user': {$eq:ObjectId(req.query.user)}}]
				   }},
					{ $group: {'_id': "$topic",
						'questions': { $sum: 1 },
						'topic': { $last: "$topic" },
						'successRate': { $avg: "$successRate" },
						'blocks' : {$sum:"$block"}
					}},
					{$sort:{"successRate":1}}
				], function (err, result) {
					if (err) {
						//console.log(err);
						return;
					}
					result.toArray().then(function(final) {
					  //  console.log(['RECENT TOPICS',final]);
						let topics = [];
						let totalQuestions = 0;
						final.map(function(val,key) {
							// require topic, skip archived (success > 0.7)
							if (val.successRate<0.8 && val.topic && String(val.topic).length > 0) {
								collatedTopics[val.topic]={_id:val.topic,topic:val.topic,questions:val.questions,successRate:val.successRate,blocks:val.blocks}
								//console.log(['push TOPICS',val.topic]);
						
								topics.push({quiz:{$eq:val.topic}});                        
							}
							totalQuestions += val.questions;
						});
						// UPDATE USERS WITH TALLY
						//console.log(['UPDATE USER TOTLAL' ,req.query.user,totalQuestions]);
						//db.collection('users').updateOne({_id:{$eq:ObjectId(req.query.user)}},{$set:{questions:totalQuestions}}).then(function() {
						  ////  console.log('UPDATED');
						//});
					   // //console.log(['topics',topics]);
							//'quiz': {$in:[topics]} ,
						let topicCriteria={}
						if (topics.length > 0) {
							topicCriteria={$or : topics};
						} else {
							topicCriteria={'magicfield' : {$eq:'neverfound'}};
						}
						//{access:{$eq:'public'}},
						let criteria={$and:[topicCriteria]};
						
						
						
						// lookup all questions in those topics and set total(questions) for each for each collatedTopic
						db.collection('questions').aggregate([
							{ $match: criteria
							},
							{ $group: {'_id': "$quiz",
								'questions': { $sum: 1 },
								'topic': { '$last': "$quiz" }
							}}
						], function (qerr, questionResult) {
							if (qerr) {
								//console.log(qerr);
								return;
							}
							questionResult.toArray().then(function(questionFinal) {
								////console.log(['QUESTION FINAL',questionFinal]);
								// include total questions for each topic
								for (key in questionFinal) {
									let val=questionFinal[key];
		//                        questionFinal.values().map(function(val) {
									if (collatedTopics[val.topic]) collatedTopics[val.topic].total=val.questions;
								};
								let finalTopics={};
								
								// filter fully blocked topics
								Object.keys(collatedTopics).map(function(key) {
									let val = collatedTopics[key];
									if (val.blocks < val.total) {
										finalTopics[key]=val;
									}
								});
								////console.log(['aggq',finalTopics]);
								res.send(Object.values(finalTopics));
							});
						})
						
						
					});
					
				});
			})	
		} else {
			res.send({});
		}
	})


			   
	router.get('/archivedtopics', (req, res) => {
		if (req.query.user && req.query.user.length > 0) {
			let collatedTopics={};
			//,{'successTally':{$gte : 7}},{'block':{$ne : 1}}
			initdb().then(function(db) {
				db.collection('userquestionprogress').aggregate([
					{ $match: {
							$and:[{'user': {$eq:ObjectId(req.query.user)}}]
				   }},
					{ $group: {'_id': "$topic",
						'questions': { $sum: 1 },
						'topic': { $last: "$topic" },
						'successRate': { $avg: "$successRate" },
						'blocks' : {$sum:"$block"}
					}},
					{$sort:{"successRate":1}}
				], function (err, result) {
					if (err) {
						//console.log(err);
						return;
					}
					result.toArray().then(function(final) {
						let topics=[];
						
						
						final.map(function(val,key) {
							if (val.successRate>=0.8 && val.topic && String(val.topic).length > 0) {
								collatedTopics[val.topic]={_id:val.topic,topic:val.topic,questions:val.questions,successRate:val.successRate,blocks:val.blocks}
								topics.push({quiz:{$eq:val.topic}});
							}
						});
					   // //console.log(['topics',topics]);
							//'quiz': {$in:[topics]} ,
						let topicCriteria={}
						if (topics.length > 0) {
							topicCriteria={$or : topics};
						} else {
							topicCriteria={'magicfield' : {$eq:'neverfound'}};
						}
						let criteria={$and:[{access:{$eq:'public'}},topicCriteria]};
						
						db.collection('questions').aggregate([
							{ $match: criteria
							},
							{ $group: {'_id': "$quiz",
								'questions': { $sum: 1 },
								'topic': { '$last': "$quiz" }
							}}
						], function (qerr, questionResult) {
							if (qerr) {
								//console.log(qerr);
								return;
							}
							questionResult.toArray().then(function(questionFinal) {
								// include total questions for each topic
								for (key in questionFinal) {
									let val=questionFinal[key];
		//                        questionFinal.values().map(function(val) {
									collatedTopics[val.topic].total=val.questions;
								};
								let finalTopics={};
								// filter fully blocked topics
								
								Object.keys(collatedTopics).map(function(key) {
									let val = collatedTopics[key];
									if (val.blocks < val.total && val.total <= val.questions) {
										finalTopics[key]=val;
									}
								});
								////console.log(['aggq',finalTopics]);
								res.send(Object.values(finalTopics));
							});
						})
						
						
					});
					
				});
			})
		} else {
			res.send({});
		}
	})



			   
	router.get('/blockedtopics', (req, res) => {
		////console.log('get blocked');
		if (req.query.user && req.query.user.length > 0) {
			let collatedTopics={};
			initdb().then(function(db) {
				db.collection('userquestionprogress').aggregate([
					{ $match: {
							$and:[{'user': {$eq:ObjectId(req.query.user)}},{'block':{$eq : 1}}]
				   }},
					{ $group: {'_id': "$topic",
						'questions': { $sum: 1 },
						'topic': { $last: "$topic" },
						'successRate': { $avg: "$successRate" },
						'blocks' : {$sum:"$block"}
					}},
					{$sort:{"successRate":1}}
				], function (err, result) {
					if (err) {
						//console.log(err);
						return;
					}
					result.toArray().then(function(final) {
					   // //console.log(['get blocked',final]);
						//let topics=[];
						final.map(function(val,key) {
							collatedTopics[val.topic]={_id:val.topic,topic:val.topic,questions:val.questions,successRate:val.successRate,blocks:val.blocks}
						});
					
						 res.send(Object.values(collatedTopics));
					});
					
				   
				});
			})
		} else {
			res.send({});
		}
	})




	router.get('/usersuccessprogress', (req, res) => {
		if (req.query.user && req.query.user.length > 0) {
			initdb().then(function(db) {
				db.collection('userquestionprogress').aggregate([
					{ $match: {$and:[{'user': {$eq:ObjectId(req.query.user)}} , {block:{ $not: { $gt: 0 } }}]}},
					{ $group: {'_id': "$successTally",
						'questions': { $sum: 1 }}},
					
				], function (err, result) {
					if (err) {
						//console.log(err);
						return;
					}
					result.toArray().then(function(final) {
						res.send(final);
					});
					
				});
			})
		} else {
			res.send({});
		}
	})

	//    month: { $month: "$timestamp" }, day: { $dayOfMonth: "$timestamp" }, year: { $year: "$timestamp" } 
					

	router.get('/useractivity', (req, res) => {
		////console.log('UA',req.query.user);
		if (req.query.user && req.query.user.length > 0) {
			initdb().then(function(db) {
					db.collection('seen').aggregate([
						{ $match: {'user': ObjectId(req.query.user)}},
						{ $project: {
								"timestamp": {
									"$add": [ new Date(0), "$timestamp" ]
								},
							 } 
						},
						{ $group: {
							_id : {
							   "year": { "$year": "$timestamp" },
							   "month": { "$month": "$timestamp" },
							   "day": { "$dayOfMonth": "$timestamp" },
							},
							'tally': { $sum: 1 }}
						},
						
					], function (err, result) {
						if (err) {
							//console.log(err);
							return;
						}
						result.toArray().then(function(seen) {
							// now success
							db.collection('successes').aggregate([
								{ $match: {'user': ObjectId(req.query.user)}},
								{ $project: {
										"timestamp": {
											"$add": [ new Date(0), "$timestamp" ]
										},
									 } 
								},
								{ $group: {
									_id : {
									   "year": { "$year": "$timestamp" },
									   "month": { "$month": "$timestamp" },
									   "day": { "$dayOfMonth": "$timestamp" },
									},
									'tally': { $sum: 1 }}
								},
								
							], function (err, successresult) {
							if (err) {
								//console.log(err);
								return;
							}
							successresult.toArray().then(function(success) {
								res.send({seen:seen,success:success});
							});
						});
					});
				})
			})
		} else {
			
		}
	})



	router.get('/topiccollections', (req, res) => {
		
		let missingQuestionsByTopic={}
		
		//db.collection('questions').aggregate([
				//{ $match: {
						//$and:[{$where: "this.mnemonic.length == 0"}]
			   //}},
				//{ $group: {'_id': "$quiz",
					//'questions': { $sum: 1 }
				//}},
				//{$sort:{"_id":1}}
		//]).toArray().then(function(results) {
			//console.log('TOPIC COLL');
			//console.log(results);
		//});
		
		
		
		//db.collection('questions').find({$where: "this.mnemonic.length == 0"}).toArray().then(function(questions) {
			////console.log(['LOADING TOPICS, FOUND MNEM FREE QU',questions]);
			//questions.map(function(question,key) {
				//if (question.quiz && question.quiz.length > 0) {
					//missingQuestionsByTopic[question.quiz] = (parseInt(missingQuestionsByTopic[question.quiz],10) > 0) ? parseInt(missingQuestionsByTopic[question.quiz],10) + 1 : 1;
				 //}
			//});
			//console.log(['MISSING',missingQuestionsByTopic]);
			initdb().then(function(db) {

				db.collection('topicCollections').find({}).sort({sort:1}).toArray().then(function(collections) {
					let final=[]
					collections.map(function(cValue,cKey) {
						//let missingTopics=[]
						//cValue.topics.map(function(topic,i) {
							//if (topic )
						//});
						//if (cValue.quiz && cValue.quiz.length > 0 && missingQuestionsByTopic[cValue.quiz] > 0) {
							//cValue.missingCount=missingQuestionsByTopic[cValue.quiz];
						//}
						final.push(cValue);
					});
					db.collection('userTopics').find({published:{$eq:true}}).sort({updated:-1}).limit(100).toArray().then(function(userTopics) {
						let topics=[];//sort({updated:-1}).
					   // //console.log(['TOPICCOLLES',userTopics]);
						userTopics.map(function(key,val) {
								topics.push(key.publishedTopic);
						});
						if (topics.length > 0) {
							// append generated Community section at the end
							final.push({name:'Community',sort:collections.length + 1,icon:'userFriends',topics:topics});
						}
							
						res.send([final,missingQuestionsByTopic]);
					});
				}).catch(function(e) {
					//console.log(e);
					res.send({});
				});        
				
			});
		

	});


	//router.get('/progress', (req, res) => {
		//if (req.query.user && req.query.user.length > 0) {
			//db.collection('progress').findOne({user:req.query.user}).then(function(progress) {
				//res.send(progress);
			//}).catch(function(e) {
				////console.log(e);
				//res.send({});
			//});
		//} else {
			//res.send({});
		//}
	//})

	// if topic exists in user topics and has a topicpassword, check if user has topic and password
	router.post('/checktopic', (req, res) => {
		initdb().then(function(db) {

			if (req.body.topic && req.body.topic.length > 0) {
				db.collection('userTopics').findOne({publishedTopic:req.body.topic}).then(function(userTopic) {
					if (userTopic && userTopic.topicpassword  && userTopic.topicpassword.length > 0) {
						if (req.body.user && req.body.user.length > 0) {
							db.collection('users').findOne({_id:ObjectId(req.body.user)}).then(function(user) {
								if (user && user.topicPasswords && user.topicPasswords.hasOwnProperty(req.body.topic) && userTopic.topicpassword === user.topicPasswords[req.body.topic]) {
									res.send({ok:true})
								} else {
									res.send({ok:false,error:'no matching password'})
								}
							})
						} else {
							// no matching user topic and no password 
							res.send({ok:false,error:'invalid parameter missing user'})
						}
					} else {
						// no matching user topic and no password 
						res.send({ok:true})
					}
					//db.collection('progress').findOne({user:req.body.user}).then(function(progress) {
						//res.send(progress);
					//}).catch(function(e) {
						////console.log(e);
						//res.send({});
					//});
				}).catch(function(e) {
					//console.log(e);
					res.send({ok:false,error:e});
				});
			} else {
				res.send({ok:false,error:'invalid parameters'})
			}
		})
	})
	
	router.post('/discover', (req, res) => {
	 //  console.log(['discover',req.body]);
		let orderBy = req.body.orderBy ? req.body.orderBy : 'successRate';
		let sortFilter={};
		let limit = req.body.limit ? req.body.limit : 5;
		let criteria = [];
		initdb().then(function(db) {

			function discoverQuery(user) {
				//sortFilter[orderBy]=-1;
				let sortFilter={};
				// missing mnemonic as last choice
				sortFilter['hasMnemonic']=-1;
				// allow for asc/desc (- as first letter)
				if (orderBy.startsWith("-")) {
					orderBy = orderBy.slice(1);
					sortFilter[orderBy]=-1;
				} else {
					sortFilter[orderBy]=1;
				}
				
				
			    console.log(['disco criteria',JSON.stringify(criteria)]);
				db.collection('questions').find({$and:criteria})
				//db.collection('questions').aggregate({$match:{$nin:notThese}})
				.sort(sortFilter).limit(limit).toArray().then(function( questions) {
				  // console.log(['user res',questions ? questions.length : 0]); 
				   
				   //console.log(['disco selqiest',req.body.selectedQuestion]);
					// when a question id is specified, make sure that question is loaded as the first question in the response
					if (req.body.selectedQuestion && req.body.selectedQuestion.length > 0) {
					 //   console.log(['disco selqiest',req.body.selectedQuestion]);
						db.collection('questions').findOne({_id:ObjectId(req.body.selectedQuestion)}).then(function(question) {
						// console.log(['disco selqiest found',question]);
							questions.unshift(question);
						 // console.log(['disco send found',questions]);
							res.send({questions:questions.slice(0,10)});
						});
					} else {
						res.send({questions:questions});
					}
				   
					  
					
				})
			};
			 // block selected question for specific lookup as second query
			 if (req.body.selectedQuestion && req.body.selectedQuestion.length > 0) {
				// console.log(['DISCOVER NOT SELECTED QUESTION',req.body.selectedQuestion])
				 criteria.push({_id:{$ne:ObjectId(req.body.selectedQuestion)}});
			 }
			
			if (req.body.userTopic && req.body.userTopic.length > 0) {
				criteria.push({userTopic:{$exists:true}});
				orderBy = 'sort';
			} else if (req.body.topics) {
				if (req.body.restrictDiscoverable === "true") {
					criteria.push({discoverable :{$ne:'no'}});
				}
				let topics = req.body.topics.split(",");
				let orCriteria=[];
				topics.map(function(topic) {
					orCriteria.push({quiz:{$eq:topic}});
				});
				criteria.push({$or:orCriteria});
				orderBy = 'sort';
			} else if (req.body.difficulty) {
				// difficulty search limited to discoverable
				criteria.push({discoverable :{$ne:'no'}});
				criteria.push({difficulty:{$eq:String(req.body.difficulty)}});
				orderBy = '-successRate';
			} else if (req.body.topic) {
				criteria.push({quiz:{$eq:req.body.topic}});
				orderBy = 'sort';
			} else if (req.body.tag) {
				let tag = req.body.tag.trim().toLowerCase(); 
				criteria.push({'tags': {$in:[tag]}});
				orderBy = 'sort';
				limit = 100;
			} else if (req.body.technique) {
				criteria.push({technique:{$eq:req.body.technique}});
				orderBy = 'sort';
			} else {
				criteria.push({discoverable :{$ne:'no'}});
				orderBy = '-successRate';
				//if (fullUser.difficulty > 0) {
					//criteria.push({'difficulty': {$eq: fullUser.difficulty}});
				//} else {
					//// default 
					//criteria.push({'difficulty': {$lte: '2'}});
				//}
			}
			// DO WE HAVE A USER
			if (req.body.user) {
				
				
				let user = req.body.user ? req.body.user : null;
				db.collection('users').find({_id:ObjectId(user)}).toArray().then(function(users) {
					if (users.length > 0) {
						let fullUser=users[0];
						let allowedTopicCriteria=[]
					
						// unwind user topicPasswords into filter
						if (fullUser.topicPasswords) {
							Object.keys(fullUser.topicPasswords).map(function(key) {
								allowedTopicCriteria.push({$and:[{quiz:{$eq:key}},{topicpassword:{$eq:fullUser.topicPasswords[key]}}]})
							});
						}
						let andParts=[{access :{$eq:'restricted'}}]
						if (allowedTopicCriteria.length > 0) {
							andParts.push({$or:allowedTopicCriteria})
						}
						let orParts = [
							{access:{$eq:ObjectId(req.body.user)}},
							{access :{$eq:'public'}},
						];
						if (allowedTopicCriteria.length > 0) {
								orParts.push({$and:andParts})
						}
						criteria.push({
							$or:orParts
						})
						
						let andCriteria  = [
						{'user': {$eq:ObjectId(user)}} , 
						{$or:[
							{block: {$gt:0}}, 
							{seen: {$gt:0}}, 
						]}
						]
						if (req.body.topic && req.body.topic.length > 0) andCriteria.push({topic:{$eq:req.body.topic}})

						db.collection('userquestionprogress').find({$and:andCriteria}).toArray().then(function(progress) {
							 if (progress) {
								// //console.log(['progress res',progress]);
								let notThese = [];
								for (var seenId in progress) {
									notThese.push(ObjectId(progress[seenId].question));
								};
								criteria.push({'_id': {$nin: notThese}});
								//criteria.push({discoverable :{$ne:'no'}});
							  // console.log(['NOT THESE',notThese.length]);
								discoverQuery(fullUser);
							}
							
						}).catch(function(e) {
							//console.log(['e',e]);
							res.send('e '+JSON.stringify(e));
						})
					} else {
						criteria.push({access :{$eq:'public'}});
						 discoverQuery();
					}
				});
			} else {
				criteria.push({access :{$eq:'public'}});
				discoverQuery();
			}
			
			
		   // //console.log(['discover',user]);
		})
	})

	router.get('/review', (req, res) => {
		let startTime = new Date().getTime();
		//console.log('review');
		
		initdb().then(function(db) {

			let limit=5;
			 let orderBy = (req.query.orderBy == 'successRate') ? 'successRate' : 'timeScore'
			 let orderMeBy = {};
			 orderMeBy[orderBy] = 1;          
			 let criteria=[];
			 if (req.query.band && req.query.band.length > 0) {
				 //console.log('FILTER BY BAND '+req.query.band );
				 if (parseInt(req.query.band,10) > 0) {
					 criteria.push({successTally:{$eq:parseInt(req.query.band,10)}});
				 } else {
					 criteria.push({$or:[{successTally:{$eq:0}},{successTally:{$exists:false}}]});
				 }
				 
			 } 
			 if (req.query.topic && req.query.topic.length > 0) {
				criteria.push({topic:{$eq:req.query.topic}});
			 }
			 //if ((req.query.topic && req.query.topic.length > 0) || (req.query.band && req.query.band.length > 0)) {
				 //// no time filter for search based
			 //} else {
				function getTsXHoursBack(x) {
					return parseInt((new Date().getTime() - (3600000 * x))/1000,10) // return seconds as per userquestionprogress.seen
				}
				//let oneHourBack = new Date().getTime() - 3600000;
				//let oneDayBack = new Date().getTime() - 86400000;
				//let oneWeekBack = new Date().getTime() - 86400000 * 7;
				//let twoWeeksBack = new Date().getTime() - 86400000 * 14;
				//let oneMonthBack = new Date().getTime() - 86400000 * 31; 
				//let twoMonthBack = oneMonthBack * 2;
				//criteria.push({seen:{$lt:oneHourBack}});   
				criteria.push({$or:[
					 {$and:[{seen:{$lt:getTsXHoursBack(1)}},{successTally:{$eq:1}}]},
					 {$and:[{seen:{$lt:getTsXHoursBack(1)}},{successTally:{$eq:2}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(8))}},{successTally:{$eq:3}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(27))}},{successTally:{$eq:4}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(64))}},{successTally:{$eq:5}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(125))}},{successTally:{$eq:6}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(216))}},{successTally:{$eq:7}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(343))}},{successTally:{$eq:8}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(512))}},{successTally:{$eq:9}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(729))}},{successTally:{$eq:10}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(1000))}},{successTally:{$eq:11}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(1331))}},{successTally:{$eq:12}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(1728))}},{successTally:{$eq:13}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(2197))}},{successTally:{$eq:14}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(2744))}},{successTally:{$eq:15}}]},
					 {$and:[{seen:{$lt:(getTsXHoursBack(3375))}},{successTally:{$eq:16}}]},
					 {successTally:{$not:{$gt:0}}}
				]});    
			 //}
			 
			 //else {
			
			criteria.push({$or:[{block :{$lte:0}},{block :{$exists:false}}]});
				
				 
			 //}
			// criteria.push({block:{ $not: { $gt: 0 }}});
			 criteria.push({user:ObjectId(req.query.user)});
			 ////console.log({seen:{$lt:oneHourBack}});
			 if (req.query.user && req.query.user.length > 0) {
				 // sort by successTally and then most recently seen first
				//console.log(JSON.stringify(criteria));
				db.collection('userquestionprogress').find({$and:criteria}).sort({'successTally':1,'seen':-1}).limit(limit).toArray().then(function(questions,error) {
					////console.log('llll');
					////console.log(questions);
					////console.log(error);
					//let questions=[];
					if (questions) {
						//for (var questionId in progress.seen) {
							//if (!progress.block.hasOwnProperty(questionId)) {
								//const seenTally = progress.seenTally.hasOwnProperty(questionId) ? progress.seenTally[questionId] : 1;
								//if (seenTally > 0) {
									//const successTally = progress.successTally.hasOwnProperty(questionId) ? progress.successTally[questionId] : 0;
									//const seen = progress.seen[questionId];
									//const success = progress.success.hasOwnProperty(questionId) ? progress.success[questionId] : 0;
									//const successRate = progress.successRate.hasOwnProperty(questionId) ? progress.successRate[questionId] : 0;
									//const timeScore = progress.timeScore.hasOwnProperty(questionId) ? progress.timeScore[questionId] : 0;
									//const question = {'successRate':successRate,'timeScore':timeScore,'questionId':questionId};
									//questions.push(question);
								//} 
							//}
						//}
					 
						//let orderBy = (req.body.orderBy == 'successRate') ? 'successRate' : 'timeScore'
						//questions.sort(function(a,b) {
							//if (a[orderBy] === b[orderBy]) {
								//return 0;
							//} else if (a[orderBy] > b[orderBy]) {
								//return 1;
							//} else {
								//return -1;
							//}
						//});
					 //  //console.log(['REVIEW',questions]);
					   // questions = questions.slice(0,limit);
					   // let questionIds = [];
						let questionKeys = [];
						let completeCheck = {};
						let indexedQuestions = {};
						let successAndDateKeyed={};
						let successKeys=[];
						let successDateKeys={};
						//let i = 0;
						questions.forEach(function(question) {
							successTally = parseInt(question.successTally,10) > 0 ? parseInt(question.successTally,10) : 0;
							if (!successAndDateKeyed.hasOwnProperty(successTally)) {
								successAndDateKeyed[successTally]={};
								successKeys.push(successTally);
							};
							let d = new Date(question.seen);
							let dateKey=d.getDate()+' '+d.getMonth()+' '+d.getFullYear();
							if (!successAndDateKeyed[successTally].hasOwnProperty(dateKey)) {
								successAndDateKeyed[successTally][dateKey]=[];
								if (!successDateKeys.hasOwnProperty(successTally)) {
									successDateKeys[successTally] = [];
								}
								successDateKeys[successTally].push(dateKey);
							};
							successAndDateKeyed[successTally][dateKey].push(question);
						//    questionIds.push(question.questionId);
							questionKeys.push(ObjectId(question.question));
							completeCheck[question.question] = 1;
						//    indexedQuestions[question.questionId] = i;
						//    i++;
						});
						let successAndDateOrderedIds=[];
						successKeys.forEach(function(successTally) {
							//let tallyGroup=
						  //  //console.log(successTally,successAndDateKeyed[successTally]);
							successDateKeys[successTally].forEach(function(day) {
								let shuffleGroup = successAndDateKeyed[successTally][day];
								shuffleGroup.sort(function() {
								  return .5 - Math.random();
								});
								shuffleGroup.forEach(function(question) {
									successAndDateOrderedIds.push(ObjectId(question.question));
								});
							}); 
						});
		 //               }
						
						
					   // console.log(['REVItEW',successAndDateOrderedIds]);
						db.collection('questions').find({_id:{$in:successAndDateOrderedIds}}).toArray(function(err,results) {
						   // //console.log([err,results]);
						   
							let questionIndex={};
							results.forEach(function(question) {
								questionIndex[question._id]=question;
								////console.log(question._id);
								completeCheck[question._id]=null;
							});
							// CLEANUP
						   //completeCheck();
						   if (successAndDateOrderedIds.length != results.length) {
							  // console.log('MISSING QUESTIONS');
							   for (let qid in completeCheck) {
								   if (completeCheck[qid] !== null) {
									   //console.log('DELETE PROGRESS FOR QUESTION '+qid);
									   // remove this question id from userquestionprogress
									   db.collection("userquestionprogress").deleteOne({$and:[{question:{$eq:ObjectId(qid)}},{user:{$eq:ObjectId(req.query.user)}}]}).then(function(res) {console.log(res.result)});
								   }
							   }
						   }
							
							let orderedResults=[];
							successAndDateOrderedIds.forEach(function(question) {
								if (questionIndex[question]) {
									orderedResults.push(questionIndex[question]);   
								}
							});
				   //       //console.log(['q',err,orderedResults]);
							//res.send({'currentQuestion':'0','currentQuiz':questionIds,'questions':results,indexedQuestions:indexedQuestions});
							let endTime = new Date().getTime();
							//console.log(['REVIEW SEARCH IN ',endTime - startTime])
							res.send({'questions':orderedResults});
							//res.send({'questions':results});
						}) 
					} else {
						res.send('Invalid request, no user progress');
					}
				});
			} else {
				res.send({message:'Invalid request'});
			}
		})
	})


	// search questions
	router.get('/questions', (req, res) => {
		//console.log('search questions');
		//console.log(req.query);
		let limit = 100;
		let skip = 0;
		if (req.query.limit && parseInt(req.query.limit,10) != NaN) {
			limit = parseInt(req.query.limit,10);
		}
		if (req.query.skip && req.query.skip > 0) {
			skip = req.query.skip;
		}
		initdb().then(function(db) {

			function theRest() {
				//console.log(['THEREST',req.query.search,JSON.stringify(criteria)]);
			   // //console.log(['questions request',req.query.search,req.query.technique]);
				if (req.query.search && req.query.search.trim().length > 0) {
					// SEARCH BY technique and text query
					criteria.push({$text: {$search: req.query.search.trim()}});
					//criteria.push({question: {$regex: req.query.search.trim().toLowerCase()}});
					if (req.query.technique && req.query.technique.trim().length > 0) {
						criteria.push({'mnemonic_technique': {$eq:req.query.technique.trim()}});
					// SEARCH BY text query
					}
				  // console.log(criteria);
					db.collection('questions').find({$and:criteria}).limit(limit).skip(skip).project({score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function(err, results) {
					  res.send({'questions':results});
					})
				} else {
					// SEARCH BY technique
					if (req.query.technique && req.query.technique.length > 0) {
						criteria.push({'mnemonic_technique': {$eq:req.query.technique}});
						db.collection('questions').find({$and:criteria}).limit(limit).skip(skip).project({score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function(err, results) {
						  res.send({'questions':results});
						})
					// SEARCH BY topic
					} else if (req.query.missingMnemonicsOnly > 0) {
						//console.log(['search by missing mnem '+ req.query.topic]);
						//db.collection('mnemonics').find({}).toArray(function(err, mnemonics) {
							//let existingMnemonicIds = mnemonics.map(function(mnemonic) {
								//return mnemonic._id;
							//});
							if (req.query.topic) { 
								let topic = req.query.topic; 
								criteria.push({ hasMnemonic:{$ne:true}});
								criteria.push({quiz:{$eq:topic}});
							   // criteria.push({'_id': {$nin: existingMnemonicIds}});
								
								db.collection('questions').find({$and:criteria}).limit(limit).skip(skip).sort({sort:1}).toArray(function(err, results) {
							//		console.log(['search by topic RES',results]);
									res.send({'questions':results});
								})
							}
						//})
					} else  if (req.query.topic && req.query.topic.length > 0) {
						////console.log(['topic search',req.query.topic,{'quiz': {$eq:req.query.topic}}]);
						let topic = req.query.topic.trim(); //.toLowerCase(); 
						criteria.push({'quiz': {$eq:topic}});
						//console.log(['topic search C    ',JSON.stringify(criteria)]);
						//if (req.query.missingMnemonicsOnly > 0) {
							//criteria.push({ $where: "this.hasMnemonic !== true"});
						//} 
						db.collection('questions').find({$and:criteria}).limit(limit*40).sort({sort:1}).toArray(function(err, results) {
							//console.log(['topic search res    ',results]);
						
						  res.send({'questions':results});
						})
					// SEARCH BY tag
					} else if (req.query.tag && req.query.tag.length > 0) {
						if (req.query.tag) { 
							
							let tag = req.query.tag.trim().toLowerCase(); 
							criteria.push({'tags': {$in:[tag]}});
						  //console.log(['search by tag',criteria,tag]);
							db.collection('questions').find({$and:criteria}).limit(limit*40).skip(skip).sort({question:1}).toArray(function(err, results) {
								//console.log(['search by tag res',results]);
							  res.send({'questions':results});
							})
						}
					// search by question (return single element array
					} else if (req.query.question && req.query.question.length > 0) {
						//if (req.query.question) { 
							let question = req.query.question; 
						  //console.log(['search by qu ',question]);
							criteria.push({'_id': ObjectId(question)});
						   // //console.log(['search by id',criteria,question]);
							db.collection('questions').find({$and:criteria}).limit(limit).skip(skip).sort({question:1}).toArray(function(err, results) {
						   //  console.log(['search by id res',results]);
								res.send({'questions':results});
							})
						//}
					}  else {
						res.send({'questions':[]});
					//db.collection('questions').find({}).sort({question:1}).toArray(function(err, results) {
					  //res.send({'questions':results});
					}
				}
			}
			
			// tags and topics
			let criteria=[];
			if (req.query.user) {
				//console.log(['user',req.query.user]);
				let user = req.query.user ? req.query.user : null;
				db.collection('users').find({_id:{$eq:ObjectId(user)}}).toArray().then(function(users) {
					if (users.length > 0) {
						let fullUser=users[0];
						//console.log(['loaded user',fullUser]);
						let allowedTopicCriteria=[]
					
						// unwind user topicPasswords into filter
						if (fullUser.topicPasswords) {
							Object.keys(fullUser.topicPasswords).map(function(key) {
								allowedTopicCriteria.push({$and:[{quiz:{$eq:key}},{topicpassword:{$eq:fullUser.topicPasswords[key]}}]})
							});
						}
						let andParts=[{access :{$eq:'restricted'}}]
						if (allowedTopicCriteria.length > 0) {
							andParts.push({$or:allowedTopicCriteria})
						}
						let orParts = [
							{access:{$eq:req.query.user}},
							{access:{$eq:ObjectId(req.query.user)}},
							{access :{$eq:'public'}},
						];
						if (allowedTopicCriteria.length > 0) {
								orParts.push({$and:andParts})
						}
						criteria.push({
							$or:orParts
						})
						//console.log(['USER criteria',JSON.stringify(criteria)]);
						
						theRest()
				
					}
				});
			} else {
				criteria.push({access :{$eq:'public'}});
				theRest()
			}
			
		})	
		
	})



	router.post('/checktopicpassword', (req, res) => {
	 //  console.log(['checktopicpassword']);
		if (req.body.topic && req.body.topic.length > 0 && req.body.password && String(req.body.password).length > 0) {
		  //  //console.log(['ok']);
			let topic = req.body.topic.replace(/\\\"/g, '"').replace(/\\\'/g, "'");
			let password = req.body.password.replace(/\\\"/g, '"').replace(/\\\'/g, "'");
			let criteria = {$and:[
								{topicpassword:{$eq:password}},
								{publishedTopic:{$eq:topic}},
							]}
			//console.log([topic,password,JSON.stringify(criteria)])
			initdb().then(function(db) {
				db.collection('userTopics').find(criteria).limit(1).toArray(function(err, results) {
			   //  console.log(['search by id res',results]);
					res.send({'passwordOK':(results && results.length > 0)});
				})
			})
			
		}  else {
			res.send('');
		}
	});

	router.post('/like', (req, res) => {
	   // //console.log(['like']);
		if (req.body.user && req.body.user.length > 0 && req.body.question && String(req.body.question).length > 0  && req.body.mnemonic && String(req.body.mnemonic).length > 0 ) {
		  //  //console.log(['ok']);
			let user = req.body.user;
			let question = req.body.question;
			initdb().then(function(db) {
				db.collection('question').findOne({'_id':ObjectId(question)}).then(function(theQuestion) {
			 //       //console.log(['like',question,theQuestion]);
					//let startScore = theQuestion && theQuestion.score ? parseInt(theQuestion.score) : 0;
					db.collection('likes').find({'user':ObjectId(user),question:ObjectId(question)}).toArray(function(err, results) {
						if (results.length > 0) {
							// OK
			   //             //console.log(['like found existing so ignore']);
							res.send({});
						} else {
							// create a votet
				 //           //console.log(['like vote']);
							db.collection('likes').insert({'user':ObjectId(user),question:ObjectId(question),mnemonic:req.body.mnemonic}).then(function(inserted) {
				   //             //console.log(['like inserted']);
								// collate tally of all likes for this question and save to question.score
								db.collection('likes').find({question:ObjectId(question)}).toArray(function(err, likes) {
								   // //console.log(['col likes',likes]);
									let newScore=0;
									if (likes && likes.length > 0) {
										newScore=likes.length;
									}
									if (question && question.admin_score && parseFloat(question.admin_score) > 0) {
										newScore =newScore + parseFloat(question.admin_score)/2;
									}
								  //  //console.log(['like new score',newScore]);
									db.collection('questions').update({_id: ObjectId(question)},{$set: {score:newScore}}).then(function() {
					   //                 //console.log(['like final']);
										res.send({message:'Thanks for your like'});
									});
									
								});
							}).catch(function(e) {
								//console.log(e);
							  res.send({message:'Invalid request error'});  
							});
						} 
						
					})
				})
			})
		} else {
			res.send({message:'Invalid request'});
		}
	})


	function blockQuestion(user,question,topic) {
		////console.log(['block',user,question,topic]);
		initdb().then(function(db) {
			db.collection('userquestionprogress').findOne({$and:[{'user': {$eq:ObjectId(user)}},{question:{$eq:ObjectId(question)}} ]}).then(function(progress) {
				if (progress) {
					// OK
					progress.block = 1; //new Date().getTime();
					progress.topic = topic;
					db.collection('userquestionprogress').update({_id:progress._id},progress).then(function() {
					  //  //console.log(['update',progress]);
				
					});
					
				} else {
					  progress = {'user':ObjectId(user),question:ObjectId(question)};
					  progress.block = 1; //new Date().getTime();
					  progress.topic = topic;
					  db.collection('userquestionprogress').save(progress).then(function() {
						//  //console.log(['insert',progress]);
				
					});
				} 
			})
		})
	}

	router.post('/block', (req, res) => {
		////console.log(['block']);
		if (req.body.user && req.body.user.length > 0 && req.body.question && String(req.body.question).length > 0 ) {
		  //  //console.log(['block ok']);
			let user = req.body.user;
			let question = req.body.question;
			blockQuestion(user,question,req.body.topic);
			  res.send({});
		} else {
			res.send({message:'Invalid request'});
		}
	})

	// update question stats into the questions collection
	function updateQuestionTallies(user,question,tallySuccess=false) {
		//console.log(['update question tallies',user,question,tallySuccess]);
		return new Promise(function(resolve,reject) {
			initdb().then(function(db) {
				db.collection('questions').findOne({_id:ObjectId(question)}).then(function(result) {
						if (result && result._id) {
							let data={};
							data.seenTally = result.seenTally ? parseInt(result.seenTally,10) + 1 : 1;
							let successTally = result.successTally > 0 ? result.successTally : 0 ;
							if (tallySuccess) {
								successTally = parseInt(successTally,10) + 1 ;
							}
							data.successTally = successTally;
							data.successRate = data.seenTally > 0 ? successTally/data.seenTally : 0;
							db.collection('questions').update({_id: question},{$set:data}).then(function(qres) {
							///   console.log(['saved questions',qres]);
							});
							updateUserQuestionProgress(user,question,result.quiz,result.tags,result.ok_for_alexa,tallySuccess).then(function() {
								resolve();
							});
						  //  console.log(['update question tallies done']);
						}
				}).catch(function(e) {
					console.log(['update q err',e]);
				});
			})
		}) 

	}

	// update per user progress stats into the userquestionprogress collection
	function updateUserQuestionProgress(user,question,quiz,tags,ok_for_alexa,tallySuccess) {
	//	console.log(['update progress',user,question,quiz,tags,ok_for_alexa,tallySuccess]);
		return new Promise(function(resolve,reject) {
			initdb().then(function(db) {
				db.collection('userquestionprogress').findOne({$and:[{'user': {$eq:ObjectId(user)}},{question:ObjectId(question)} , {block:{ $not: { $gt: 0 } }}]}).then(function(progress) {
					//console.log(['UPDATE PROGRESS FOUND',progress])
					var isNew = false;
					if (!progress) {
						isNew = true;
						progress = {user:ObjectId(user),question:ObjectId(question)};
					}
					progress.topic=quiz;
					progress.tags=tags;
					progress.ok_for_alexa=ok_for_alexa;
					progress.seenTally = parseInt(progress.seenTally,10) > 0 ? parseInt(progress.seenTally,10) + 1 : 1;
					//console.log(['trySETSEEN',new Date().getTime()/1000])
					progress.seen = parseInt(new Date().getTime()/1000,10);
					//console.log(['SETSEEN',progress.seen])
					if (tallySuccess) {
						progress.successTally = parseInt(progress.successTally,10) > 0 ? parseInt(progress.successTally,10) + 1 : 1;
						progress.success = progress.seen;
					}
					progress.successRate = (parseInt(progress.successTally,10) > 0 && parseInt(progress.seenTally,10) > 0) ? progress.successTally/progress.seenTally : 0;
					progress.block=0;
				  //  console.log(['update progress NOW',progress]);
					if (isNew) {
						db.collection('userquestionprogress').insertOne(progress).then(function(res) {
						//	console.log(['inserted progre00ss',res])
							updateUserStats(user,question,tallySuccess).then(function() {
								resolve()
							})
						}).catch(function(e) {
						  console.log(['err',e]);
						});
					} else {
						db.collection('userquestionprogress').updateOne({_id:ObjectId(progress._id)},{$set:progress}).then(function(res) {
						//	console.log(['updated progre00ss',res])
							updateUserStats(user,question,tallySuccess).then(function() {
								resolve()
							})
						}).catch(function(e) {
						  console.log(['err',e]);
						});
					}    
			  }).catch(function(e) {
				  console.log(['err',e]);
			  });
			})
		})
	}

	function updateUserStats(userId,question,tallySuccess) {
		//console.log(['update stats',userId,question,tallySuccess]);
		let criteria = {_id: new ObjectId(userId)};
		//console.log(['update stats have criteria ',criteria]);
		return new Promise(function(resolve,reject) {
			initdb().then(function(db) {
				db.collection('users').findOne(criteria).then(function(user) {
				//	console.log(['update stats have user',user]);
					
					if (user) {
						 //user.seen = user.seen > 0 : user.seen + 1 : 1;
						 //let userSuccess = user.success > 0 : user.success  : 0;
						 //if (tallySuccess) {
							 //userSuccess += 1;
						 //}
						 //user.success = userSuccess;
						 //user.successRate = user.seen > 0 ? userSuccess/user.seen : 0;
						 // total unique questions seen
						 //let lastSeen = 0;
						 db.collection('userquestionprogress').find({$and:[{user: {$eq:ObjectId(userId)}}, {block:{ $not: { $gt: 0 }}}]}).sort({seen:-1}).toArray().then(function(uniqueQuestionResults) {
							user.questions = uniqueQuestionResults ? uniqueQuestionResults.length : 0;
						//	console.log('UPDATING USER STATS '+(uniqueQuestionResults ? uniqueQuestionResults.length: 0));
							let seen = 0;
							let success = 0;
							uniqueQuestionResults.slice(0,100).map(function(progress) {
								//console.log(['SEENSUCC II',progress.successTally])
								if (parseInt(progress.seenTally,10) > 0) seen += parseInt(progress.seenTally,10);
								if (parseInt(progress.successTally,10) > 0) success += parseInt(progress.successTally,10);
								//lastSeen = Math.max(lastSeen,progress.seen);
							});
							//console.log(['SEENSUCC',seen,success])
							if (seen > 0) {
								user.recall =  success/seen ; 
							} else {
								user.recall =  0; 
							}
							//console.log('set recall '+user.recall);
							// streak
							let now = new Date().getTime();
							let startStreak = user.startStreak > 0 ? user.startStreak : new Date().getTime();
							let lastSeen = user.lastSeen > 0 ? user.lastSeen : 0;
							// more that 48 hours and we lose our streak
							if (now - lastSeen > 172800000) {
								startStreak = new Date().getTime(); 
							}
							user.startStreak = startStreak;
							// days
							user.streak = parseInt((now - startStreak)/86400000,10) + 1;
							user.lastSeen = new Date().getTime();
							//console.log(['update stats save user',user]);
							db.collection('users').save(user).then(function(res) {
								//console.log(['SAVED USER',res])
								resolve()
							}).catch(function(e) {
								console.log(e);
							}); ;
						}).catch(function(e) {
							console.log(e);
						});    
							
					} else {
						resolve()
					}
				 }).catch(function(e) {
					 console.log(e);
					 reject()
				 });
			})
		})
	}

	
	router.post('/sendallquestionsforreview', (req, res) => {
		if (req.body.user && req.body.user.length > 0 && req.body.questions && req.body.questions.length > 0 ) {
		  //  console.log(['sendallquestionsforreview',req.body.user,JSON.stringify(req.body.questions)]);
			let user = req.body.user;
			let questions = req.body.questions;
			let ts = new Date().getTime();
			let seenRecords=[];
			questions.map(function(question) {
				seenRecords.push({user:ObjectId(user),question:ObjectId(question),timestamp:ts})
			})
			let promises=[];
				//console.log('insert seen record for question '+question);
			initdb().then(function(db) {
				db.collection('seen').insertMany(seenRecords).then(function(inserted) {
			  //      //console.log(['seen inserted']);
					// collate tally of all seen, calculate success percentage to successScore
					questions.map(function(question) {
						promises.push(updateQuestionTallies(user,question));
					})
					Promise.all(promises).then(function() {
						res.send({message:'Sent all questions for review'});
					})
					
				}).catch(function(e) {
					res.send({error:e});
				});
			})
		} else {
			res.send({error:'Invalid request'});
		}
	})
	
	router.post('/markallreviewed', (req, res) => {
		if (req.body.user && req.body.user.length > 0 && req.body.questions && req.body.questions.length > 0 ) {
		    //console.log(['sendallquestionsforreview',req.body.user,JSON.stringify(req.body.questions)]);
			let user = req.body.user;
			let questions = req.body.questions;
			let ts = new Date().getTime();
			let seenRecords=[];
			questions.map(function(question) {
				seenRecords.push({user:ObjectId(user),question:ObjectId(question),timestamp:ts})
			})
			//console.log(['insert success record for questions ',questions]);
			let promises=[];
			
			initdb().then(function(db) {
				db.collection('successes').insertMany(seenRecords).then(function(inserted) {
			        
			       // console.log(['success inserted']);
					// collate tally of all seen, calculate success percentage to successScore
					questions.map(function(question) {
						promises.push(updateQuestionTallies(user,question,true));
					})
					Promise.all(promises).then(function() {
						res.send({message:'Sent all questions for review'});
					})
				}).catch(function(e) {
					res.send({error:e});
				});
			})
		} else {
			res.send({error:'Invalid request'});
		}
	})
	

	router.post('/seen', (req, res) => {
		////console.log(['seen',req.body]);
		if (req.body.user && req.body.user.length > 0 && req.body.question && String(req.body.question).length > 0 ) {
		  //  //console.log(['seen ok']);
			let user = req.body.user;
			let question = req.body.question;
			//db.collection('seen').find({user:user,question:question}).toArray(function(err, result) {
			////    //console.log(['seen found',result]);
				//if (result.length > 0) {
			  ////      //console.log(['seen update']);
					//let ts = new Date().getTime();
					//db.collection('seen').update({_id:ObjectId(result[0]._id)},{$set:{timestamp: ts}}).then(function(updated) {
						//updateQuestionTallies(user,question);    
						//res.send('updated');
					//}).catch(function(e) {
						//res.send('error on update');
					//});
				//} else {
					// create a seen record
				//    //console.log(['seen insert']);
					let ts = new Date().getTime();
					initdb().then(function(db) {
						db.collection('seen').insert({user:ObjectId(user),question:ObjectId(question),timestamp:ts}).then(function(inserted) {
					  //      //console.log(['seen inserted']);
							// collate tally of all seen, calculate success percentage to successScore
							updateQuestionTallies(user,question).then(function() {
								res.send('inserted');
							})
						}).catch(function(e) {
							res.send('error on insert');
						});
					})
			 //   }
			   
				
				
		   // });
		} else {
			res.send({message:'Invalid request'});
		}
	})


	router.post('/success', (req, res) => {
		////console.log(['success']);
		if (req.body.user && req.body.user.length > 0 && req.body.question && String(req.body.question).length > 0 ) {
			let user = req.body.user;
			let question = req.body.question;
		  //  //console.log(['success']);
		   // db.collection('successes').findOne({user:user,question:question}).then(function(result) {
			//    //console.log(['found success',result]);
				//if (result && result._id) {
			  ////      //console.log(['success update']);
					//let ts = new Date().getTime();
					//db.collection('successes').update({_id:ObjectId(result._id)},{$set:{timestamp: ts}}).then(function() {
						//updateQuestionTallies(user,question,true);
				////        //console.log(['updated']);
						//res.send('updated');

					//}).catch(function(e) {
						////console.log(e);
						//res.send('err on update');
					//});
					
				//} else {
				  //  //console.log(['success insert']);
					let ts = new Date().getTime();
					initdb().then(function(db) {
						db.collection('successes').insert({user:ObjectId(user),question:ObjectId(question),timestamp:ts}).then(function(inserted) {
							updateQuestionTallies(user,question,true).then(function() {
								res.send('inserted');
							})
						}).catch(function(e) {
							//console.log(e);
							res.send('err on insert');
						});;
					})
			  //  }
			//}).catch(function(e) {
				////console.log(e);
				//res.send('err on find');
			//});
		} else {
			res.send({message:'Invalid request'});
		}
	})

	router.get('/tags', (req, res) => {
		//console.log(['TAGS',req.query]);
		//if (req.body.title && req.body.title.length > 0) {
			//criteria[]
		//}
		let search=req.query.title.trim();   
		let sort= {value:1};
		if (req.query.sort && req.query.sort.length > 0) {
			sort={};
			sort[req.query.sort] = 1;
		}
		let criteria={};
		if (search.length > 0) {
			//criteria={$text: {$search: search}}
			criteria={text:{$regex: search, $options: 'i'}}
		}
		//console.log(['TAGS',criteria]);
		initdb().then(function(db) {
			db.collection('words').find(criteria).sort(sort).limit(200).toArray().then(function(results) {
				  let final=[];
				 // console.log(results);
				  results.map(function(key,val) {
			  //          //console.log([search,key,val]);
						//if (search && search.length > 0) {
							////if (key.text.indexOf(search) >= 0) {
								//final.push(key);
							////}
						//} else {
							final.push(key);
						//}
					});
					res.send(final);
				}).catch(function(e) {
					res.send({'err':e});
				});
			})
		//} else {
			//res.send({message:'Invalid request'});
		//}
	})

	router.post('/topicdetails', (req, res) => {
	//    //console.log(['mnemonics',req.body.question]);
		if (req.body.topic && req.body.topic.length > 0) {
			let promises=[];
			initdb().then(function(db) {
				if (req.body.topic) {
					db.collection('topics').find({topic:req.body.topic}).toArray(function(err, result) {
						//result.map(function(key,mnemonic));
			//            //console.log(['mnemonics found',result]);
						if (result) {
							res.send(result);
						} else {
							res.send({});
						}
					});
				} else if (req.body.topics) {
					db.collection('topics').find({topic:{$in:req.body.topics.split(",")}}).toArray(function(err, result) {
						//result.map(function(key,mnemonic));
			//  //console.log(['mnemonics found',result]);
						if (result) {
							res.send(result);
						} else {
							res.send({});
						}
					});

				} else {
					res.send({});
				}
			})
		} else {
			res.send({message:'Invalid request'});
		}
	})

	router.get('/topics', (req, res) => {
		////console.log(['topics',req.body]);
		let search = req.query.title;
		//db.collection('questions').find({$where: "this.mnemonic.length == 0"}).toArray().then(function(questions) {
			//console.log(['LOADING TOPICS, FOUND MNEM FREE QU',questions]);
			initdb().then(function(db) {
				var criteria = {}
				if (search) criteria = {$text: {$search: search.trim()}};
				// load topics into index by topic
				let topicIndex = {}
				db.collection('topics').find({}).toArray(function(err, topics) {
					topics.map(function(topic) {
						topicIndex[topic.topic] = topic.description;
					});
					//console.log('topic index')
					//console.log(topicIndex);
					// now query questions
					db.collection('questions').distinct('quiz',criteria).then(function(results) {
						let final={};
						results.map(function(key,val) {
							if (search && search.length > 0 && key.toLowerCase().indexOf(search.toLowerCase()) >= 0) {
								final[key]={length: results.length};
								if (topicIndex.hasOwnProperty(key)) final[key].description = topicIndex[key]
							} 
						});
						
						
						//console.log(['GET TOPICS FINALLY',final]);
						res.send(final);
					}).catch(function(e) {
						res.send({'err':e.message});
					});

				});
					
			});
	})

	router.post('/savewikidata', (req, res) => {
		//console.log(['SAVEWIKIDATA',req.body]);
		let body = req.body; //JSON.parse(req.body)
	 //   //console.log(['seen',req.body]);
		if (body._id && body._id.length > 0) {//   && req.body.technique  && req.body.questionText ) {
		 //   console.log('HAVE ID');
			if ((body.answer && body.answer.length > 0) || (body.image && body.image.length > 0)) {
			//    console.log('HAVE DATA');
				let toSave={}
				if (body.answer && body.answer.length > 0) toSave.answer = body.answer;
				if (body.image && body.image.length > 0) toSave.image = body.image;
			//    console.log(['SAVEWIKIDATA real',toSave]);
				initdb().then(function(db) {
					db.collection('questions').update({_id:ObjectId(body._id)},{$set:toSave}).then(function(updated) {
						res.send(['updated',updated]);
					}).catch(function(e) {
						res.send('error on update');
					});
				})            
			} else {
				res.send({message:'Invalid request missing data'});
			}
		} else {
			res.send({message:'Invalid request missing id'});
		}
	})

	router.get('/leaderboard', (req, res) => {
		//console.log(['LEADERBOARD',req.query.type]);
		let sort={streak: -1,questions:-1, recall:-1};
		if (req.query.type==="streak") {
			sort = {streak: -1}
		} else if (req.query.type==="questions") {
			sort = {questions: -1}
		} else if (req.query.type=="recall") {
			sort = {recall:-1}
		}
		initdb().then(function(db) {
			db.collection('users').find().sort(sort).limit(10).toArray(function(err, result) {
				let final=[];
				result.map(function(user,key) {
					if (user.streak > 0) {
						let data={'avatar':user.avatar,streak:user.streak,questions:user.questions,recall:Math.round(user.recall * 10000)/100}
						final.push(data);
					}
				});
				res.send(final);
			});
		})

	})


// UPLOADER ROUTES
	
	router.get('/proxy', (req, res) => {
		if (req.query.url) {
			var request = require('request');
			request.get(req.query.url).pipe(res);
		}
	});

	router.use('/s3', require('./s3router')({
		bucket: process.env.REACT_APP_S3_BUCKET,
		region: process.env.REACT_APP_REGION, //optional
		//signatureVersion: 'v4', //optional (use for some amazon regions: frankfurt and others)
		headers: {'Access-Control-Allow-Origin': '*'}, // optional
		ACL: 'public-read', // this is default
		uniquePrefix: false // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
	}));

	//var mongo_express = require('mongo-express/lib/middleware')
	//var mongo_express_config = require('./mongo_express_config')
	//router.use('/mongo_express', mongo_express(mongo_express_config))

//});



app.use('/api',router)

module.exports.handler = serverless(app);
    
