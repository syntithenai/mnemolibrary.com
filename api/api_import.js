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



var utils = require("./utils")
//var alexaUtils = require("../alexa/alexautils")
var config = {}
const Papa = require('papaparse')
//var ObjectId = require('mongodb').ObjectID;
//const get = require('simple-get');
//const mustache = require('mustache');

//var fetch = require('node-fetch');



const path = require('path')
const fs = require('fs')


var router = express.Router();

var ObjectId = require('mongodb').ObjectID;
const get = require('simple-get');
const mustache = require('mustache');
var fetch = require('node-fetch');

const MongoClient = require('mongodb').MongoClient
var request = require('request')



// body parser doesn't seem to work with serverless-http ??
// this method requires that all POST submissions are application/json encoded
app.use(function(req,res,next) {

	//console.log('PRE')
	//console.log(process.env)
	//console.log(req.headers.authorization);
	
	// extract email address from auth header and set req.user.email
	let token = req.headers.authorization ? req.headers.authorization : ((req.query && req.query.id_token) ? req.query.id_token : null)
	
	if (token) { 
		//console.log('auth')
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
	
	
	function isAdmin(email) {
		if (email === "syntithenai@gmail.com"
		  || email === "stever@syntithenai.com"
		  || email === "mnemoslibrary@gmail.com"
		  || email === "trevorryan123@gmail.com"
		 ) return true;
		 else return false;
		  
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
		if (isAdmin(emailDirect)) next()
	} else {
		if (isAdmin(emailDirect)) next()
	}
})

//app.use(bodyParser.json({limit: '50mb', extended: true}))
//app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

//app.use(express.json()) // for parsing application/json
//app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded




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




	function updateTags(tags) {
		//console.log(['UPDATETAGS']);
		////console.log(tags);
		let p = new Promise(function(resolve,reject) {
			let promises=[];
			Object.keys(tags).map(function(tag,key) {
			  //  //console.log(['UPDATETAGS matching']);
				let criteria=[];
				criteria.push({'tags': {$in:[tag]}});
				////console.log(criteria);
				let ip = new Promise(function(iresolve,ireject) {
					initdb().then(function(db) {
						db.collection('questions').find({$and:criteria}).toArray().then(function(result) {
								////console.log(['UPDATETAGS found']);
								////console.log(result);
								if (result.length > 0) {
									////console.log('UPDATETAGS found questions');
									db.collection('words').findOne({text:{$eq:tag}}).then(function(word) {
										////console.log('UPDATETAGS UPDATED WORD');
										////console.log(word);
										if (word) {
											////console.log('UPDATETAGS UPDATED');
											word.value=result.length;
											db.collection('words').save(word).then(function(saveres) {
											  //      //console.log('UPDATETAGS TAG');
													////console.log(saveres);
													iresolve();
											});                            
										} else {
											db.collection('words').save({'text':tag,value:result.length}).then(function(saveres) {
												//    //console.log('UPDATETAGS TAG NEW');
												   // //console.log(saveres);
												   iresolve();
											});                            
										}
									});
								} else {
									db.collection('words').remove({text:{$eq:tag}}).then(function(word) {
										////console.log('UPDATETAGS REMOVED TAG');
									   iresolve();
									});
								}
						 })
					})
				}) ;
				promises.push(ip);
			});
			Promise.all(promises).then(function() {
				resolve();
			});
			
		});
		return p;
	}



	router.post('/import', (req, res) => {
	 // console.log(['import']);
	  console.log(['imported']);
	  console.log(req.body);
	  console.log(['import']);
	  console.log(req.query);
	  console.log(['import']);
	  var importId = req.body && req.body.importId && req.body.importId > 0 ? parseInt(req.body.importId,10) - 1 : -1;
	  console.log(importId)
	  //console.log(process.env)
		let that = this;
		let url = ''; //config.masterSpreadsheet;
		if (importId >= 0) {
			initdb().then(function(db) {
				let mnemonics = [];
				let checkMnemonics=[];
				let key = 'importSheets_'+importId;
				if (process.env[key]) {
					url = process.env[key];
				} else {
					res.send('Invalid import sheet '+importId);
					return;
				}
				console.log(['IMPORT URL',url]);
				// load mnemonics and collate tags, topics
				fetch(url).then(function(response) {
					return response.text();
				}).then(function(text) {
					//console.log(['response',text]);
					Papa.parse(text, {
						'header': true, 
						'delimiter': ",",	
						'newline': "",	
						'quoteChar': '"',
						//'escapeChar': "\\",
						
						'complete': function(data) {
							const toImport = {'questions':data.data};
							let json = utils.createIndexes(toImport);
							let mcQuestions=[];
							let recordIndex={};
							console.log('got indexes',json.questions.length);
							
							// iterate questions collecting promises and insert/update as required
							let promises=[];
							for (var a in json.questions) {
							 //console.log([a,json.questions[a]]); //,json[collection][a]]);
								
								// must have topic and question
								if (json.questions[a] && json.questions[a].question && json.questions[a].question.length > 0 && json.questions[a].quiz && json.questions[a].quiz.length > 0) {
									let record =  json.questions[a];
									if (!record.successRate) record.successRate = Math.random()/100; // randomisation to get started
									if (record.ok_for_alexa && record.ok_for_alexa==="TRUE") {
										record.ok_for_alexa=true  
									} else {
										record.ok_for_alexa=false
									}
									record.importId = importId;
									
									let thePromise = null;
									let recordExists = false;
									// convert to ObjectId or create new 
									if (json.questions[a].hasOwnProperty('_id')&& String(json.questions[a]._id).length > 0) {
										record._id = ObjectId(json.questions[a]._id); 
										recordExists = true;
									} else {
										 record._id = ObjectId();  
										// console.log(['NEW ID',record._id]);
									}
									if (record.mnemonic && record.mnemonic.length > 0) {
										record.hasMnemonic = true;
										
									} else {
										record.hasMnemonic = false;
									}
									try {
										if (record.headlineFacts) record.headlineFacts = JSON.parse(record.headlineFacts)
									} catch (e) {
										record.headlineFacts = {}
									}
									
									function reallySaveRecord(record,resolve,reject,mnemonics,recordIndex) {
										db.collection('questions').save(record).then(function(resy) {
										   // console.log(['UPDATE']);
											//let newRecord={_id:record._id,discoverable:record.discoverable,admin_score : record.admin_score,mnemonic_technique:record.mnemonic_technique,tags:record.tags,quiz:record.quiz,access:record.access,interrogative:record.interrogative,prefix:record.prefix,question:record.question,postfix:record.postfix,mnemonic:record.mnemonic,answer:record.answer,link:record.link,image:record.image,homepage:record.homepage}
											if (record.hasMnemonic) {
												let newMnemonic = {user:'default',question:record._id,mnemonic:record.mnemonic,questionText:record.question,technique:record.mnemonic_technique,importId:importId};
												mnemonics.push(newMnemonic);
											}
											
											let hasGenerator = record.options_generator_collection && record.options_generator_filter && record.options_generator_field ? true : false;
											let hasGenerator2 = record.options_generator_collection2 && record.options_generator_filter2 && record.options_generator_field2 ? true : false;
											
											//options_generator_collection:'questions',options_generator_filter:JSON.stringify({importtype:{"$eq":'musician'}}),options_generator_field:'date'
											
											if (record.quiz && record.quiz.length > 0
												&& record.specific_question && record.specific_question.length > 0
												&& record.specific_answer && record.specific_answer.length > 0
												&& (record.multiple_choices && record.multiple_choices.length > 0 || hasGenerator)
											) {
												let newQuestion ={topic:record.quiz,question:record.specific_question,answer:record.specific_answer,multiple_choices:record.multiple_choices,feedback:record.feedback,importId:'QQ-'+importId,user:'default',image:record.image,autoshow_image:record.autoshow_image,sort:record.sort,difficulty:record.difficulty,options_generator_collection:record.options_generator_collection,options_generator_filter:record.options_generator_filter,options_generator_field:record.options_generator_field}
												//console.log('NEWQ',JSON.stringify(newQuestion))
												
												try {
													newQuestion._id=(record.mcQuestionId && record.mcQuestionId.length > 0 ? ObjectId(record.mcQuestionId) : null)
												} catch (e) {
													//newQuestion._id=ObjectId()
												}
												newQuestion.questionId = record._id; //(record._id && record._id.length > 0 ? ObjectId(record._id) : ObjectId())
												
												if (record.autoplay_media==="YES" && record.media) newQuestion.media = record.media;
												
												mcQuestions.push(newQuestion)
											}
											// second MC question
											//if (record.quiz && record.quiz.length > 0
												//&& record.specific_question2 && record.specific_question2.length > 0
												//&& record.specific_answer2 && record.specific_answer2.length > 0
												//&& (record.multiple_choices2 && record.multiple_choices2.length > 0 || hasGenerator2)
											//) {
												//let newQuestion ={topic:record.quiz,question:record.specific_question2,answer:record.specific_answer2,multiple_choices:record.multiple_choices2,feedback:record.feedback2,importId:'QQ-'+importId,user:'default',image:record.image,autoshow_image:record.autoshow_image,sort:record.sort,difficulty:record.difficulty,options_generator_collection:record.options_generator_collection2,options_generator_filter:record.options_generator_filter2,options_generator_field:record.options_generator_field2}
												//console.log('NEWQ',JSON.stringify(newQuestion))
												
												//try {
													//newQuestion._id=(record.mcQuestionId && record.mcQuestionId.length > 0 ? ObjectId(record.mcQuestionId) : ObjectId())
												//} catch (e) {
													//newQuestion._id = ObjectId()
												//}
												//newQuestion.questionId = record._id; //(record._id && record._id.length > 0 ? ObjectId(record._id) : ObjectId())
												
												//if (record.autoplay_media==="YES" && record.media) newQuestion.media = record.media;
												
												//mcQuestions.push(newQuestion)
											//}
											
											
											//console.log(['SAVED QUESTION',record._id,record])
											recordIndex[record._id] = record;
								
											resolve(record._id);
											
										}).catch(function(e) {
											console.log(['import error saving question',e]);
											reject();
										});
									}
									
									function saveQuestion() {
										//console.log('SAVE QUESTION')
										thePromise = new Promise(function(resolve,reject) {
											if (recordExists) {
												db.collection('questions').findOne({_id:{$eq:record._id}}).then(function(resy) {
													// save existing mnemonic
													if (resy && resy._id && resy.mnemonic && resy.mnemonic.length > 0) {
														record.mnemonic = resy.mnemonic;
														record.hasMnemonic = true;
													}
													reallySaveRecord(record,resolve,reject,mnemonics,recordIndex);
												})
											} else {
												reallySaveRecord(record,resolve,reject,mnemonics,recordIndex);
											}
											
										})   
										promises.push(thePromise);
									}
									
									saveQuestion();
									
								   if (recordExists && !record.hasMnemonic) {
									   checkMnemonics.push(record._id);
									}
									
								}
							}
							Promise.all(promises).then(function(ids) {
							//	console.log(['import  all promises',ids]);
									
								
								let mcPromises = [];
								// update MC questions
								mcQuestions.map(function(question,key) {
									let p = new Promise(function(resolve,reject) {
										//console.log('try save mc q')
										//console.log(question ? question._id : 'noq')
										if (question._id) {
											db.collection('multiplechoicequestions').findOne({_id: {$eq:ObjectId(question._id)}}).then(function(existingQuestion) {
												// update
												//console.log(['done find det ins/upd',existingQuestion])
												if (existingQuestion && existingQuestion._id) {
													db.collection('multiplechoicequestions').updateOne({_id:existingQuestion._id},{$set:question}).then(function() {
														//console.log(['UPDATED MC',Object.assign(existingQuestion,question)])
														resolve(Object.assign(existingQuestion,question));
													});
													
												// insert
												} else {
													try {
													//	console.log('IDINSERT')
														question.createDate = new Date().getTime();
														question._id = ObjectId()
														db.collection('multiplechoicequestions').insertOne(question).then(function() {
														//	console.log(['inserted MC',question])
															resolve(question);
														}).catch(function(e) {
															console.log(e)
															resolve()
														});
													} catch(e) {
														console.log(e);
														resolve()
													}
												}
											});
										} else {
											//console.log('NOIDINSERT')
													
											// insert
											question.createDate = new Date().getTime();
													
											db.collection('multiplechoicequestions').insertOne(question).then(function() {
												//console.log(['inserted MC noid',question])
												resolve(question);
											});
										}
										
									});
									mcPromises.push(p);
								})
								
								Promise.all(mcPromises).then(function(toDump) {
									//cleanup
									//nsole.log(['MC TODUMPE',toDump])
										
									let ids=[];
									let final=[];
									//console.log(['TODUMPE v',JSON.stringify(recordIndex)])
									//console.log(['TODUMPE mc']); //,JSON.stringify(toDump)])
											
									toDump.map(function(val) {
										if (val) {
											//console.log(['MERGE BACK MC QUESTION IDS',val._id,val.questionId,val.questionId ? recordIndex[val.questionId] : null])
											//console.log(['TODUMPE v',val])
											ids.push(ObjectId(val._id));
											// update main question with mcQuestionId to allow update
											if (val.questionId && recordIndex.hasOwnProperty(ObjectId(val.questionId))) {
												recordIndex[val.questionId].mcQuestionId = ObjectId(val._id);
												//console.log(['UPDATE REC INDEX',recordIndex[val.questionId]])
											}
											//final.push(Object.assign(val,{mcQuestionId:val._id}))
										}
									});
									
									// send import file back before tidy up and indexing
									let unparsed = Papa.unparse(Object.values(recordIndex),{quotes: true});
									res.send(unparsed);
									//. cleanup questions for this importId that didn't just get processed (ie no longer in sheet)
									console.log(['NOW DELETE',JSON.stringify({$and:[{_id: {$nin:ids}},{user:'default'},{importId:importId}]})])
									db.collection('multiplechoicequestions').remove({$and:[{_id: {$nin:ids}},{user:'default'},{importId:'QQ-'+importId}]}).then(function(dresults) {
										console.log(['cleanup mc done',dresults]); 
										// download with ids to bring back into google sheet
										//let unparsed = Papa.unparse(final,{quotes: true});
										//res.send(unparsed);
									});
									
								})
								
								
							
								console.log(['IMPORT ALL DONE now MNEMONICS ',ids,mnemonics]); //
							   // clear default user mnemonics
								db.collection('mnemonics').remove({$and:[{user:'default'},{importId:importId}]}).then(function(dresults) {
							   // bulk save mnemonics 
									if (mnemonics && mnemonics.length > 0) {
										db.collection('mnemonics').insertMany(mnemonics);
									}
								});
								
							   // console.log(['del ids',ids]);
								// delete all questions that are not in this updated set (except userTopic questions)
								db.collection('questions').remove({$and:[{importId:importId},{_id:{$nin:ids}},{userTopic:{$not:{$exists:true}}}]}).then(function(dresults) {
								   //console.log('DELETEd THESE');
								   //console.log(ids);
									// update tags
								   // console.log('UPDATE TAGS and indexes');
									////console.log(Object.keys(json.tags));
									updateTags(json.tags).then(function() {
										// create indexes   
										db.collection('questions').dropIndexes();
										db.collection('questions').createIndex({
											question: "text",
											interrogative: "text",
											answer:"text",
											question:"text",
											mnemonic: "text",
											//answer: "text"
										});
									   
										db.collection('words').dropIndexes();
										db.collection('words').createIndex({
											text: "text"                    
										}); 
									//	console.log('CHECK EXISTING RECORD FOR MNEMONICS')
										checkMnemonics.map(function(questionId) {
											db.collection('mnemonics').find({question:ObjectId(questionId)}).toArray().then(function(resy) {
												if (resy.length > 0) {
													//console.log('CHECK EXISTING RECORD FOR MNEMONICS FOUND',resy)
													//record.hasMnemonic = true;
													db.collection('questions').updateOne({_id:ObjectId(questionId)},{$set:{hasMnemonic:true}}).then(function() {
														//console.log('UPDATED QUESTIONS SET HASMNEMONIC TRUES')
													});
												}
											});
										});
										//
											//saveQuestion();
										//});

										
										
									  //  console.log('created indexes');                            
									});
								   
								});
								
								
								
								
							});
						}
					});
				}).catch(function(e) {
					console.log(e);
				})
				
			
			})
		}
	});


	router.post('/importmultiplechoicequestions', (req, res) => {
	  console.log(['import MC']);
	  console.log(JSON.stringify(process.env))
	  let that = this;
		let url = ''; //config.masterSpreadsheet;
		initdb().then(function(db) {
			let mnemonics = [];
			let checkMnemonics=[];
			var importId = req.body && req.body.importId && req.body.importId > 0 ? parseInt(req.body.importId,10) - 1 : -1;
			if (importId >= 0) {
				//let importId = req.body.importId && req.body.importId > 0 ? parseInt(req.body.importId,10) : 0;
				let key = 'importMultipleChoice_'+importId
				if (process.env[key]) {
					url = process.env[key];
					console.log(['Valid import sheet '+importId, url]);
				} else {
					console.log('Invalid import sheet '+importId);
					
					res.send('Invalid import sheet '+importId);
					return;
				}
				
				console.log(['IMPORT URL',url]);
				// load mnemonics and collate tags, topics
				
				fetch(url).then(function(response) {
					console.log(['response',response])
					if (response) return response.text();
				}).then(function(text) {
					console.log(['text',text])
					if (text && text.length > 0) {
						Papa.parse(text, {
						'header': true, 
						'delimiter': ",",	
						'newline': "",	
						'quoteChar': '"',
						//'escapeChar': "\\",
						
						'complete': function(data) {
						//	const toImport = {'questions':data.data};
							console.log(['IMPORTED',data.data]);
							console.log(['IMPORTED','Errors ->',data.errors]);
							let toSave=[];
							let toDump=[];
							let promises=[];
							if (data && data.data) {
								data.data.map(function(mcQuestion) {
									if (mcQuestion) {
										console.log([mcQuestion.specific_question,mcQuestion.specific_answer,mcQuestion.topic,mcQuestion.multiple_choices]);
										if (mcQuestion.topic && mcQuestion.topic.length > 0
											&& mcQuestion.specific_question && mcQuestion.specific_question.length > 0
											&& mcQuestion.specific_answer && mcQuestion.specific_answer.length > 0
											&& mcQuestion.multiple_choices && mcQuestion.multiple_choices.length > 0
										) {
											let newQ = {}
											try {
												newQ._id = mcQuestion._id && mcQuestion._id.length > 0 ? ObjectId(mcQuestion._id): ObjectId()
											} catch (e) {
												newQ._id = ObjectId()
											}
											console.log(['NEWQ id',mcQuestion.sort,JSON.stringify(mcQuestion)])
											newQ.topic = mcQuestion.topic
											newQ.question = mcQuestion.specific_question
											newQ.answer = mcQuestion.specific_answer
											newQ.multiple_choices = mcQuestion.multiple_choices
											newQ.questionId = (mcQuestion.questionId && mcQuestion.questionId.length > 0 ? ObjectId(mcQuestion.questionId) : null)
											console.log(['NEWQ qid'])
											newQ.feedback=mcQuestion.feedback
											newQ.importId='MC-'+importId
											newQ.sort=mcQuestion.sort
											newQ.difficulty = mcQuestion.difficulty
											newQ.user='default'
											newQ.image=mcQuestion.image
											newQ.autoshow_image=mcQuestion.autoshow_image
											newQ.media=mcQuestion.media
											console.log(['NEWQ',newQ])
											toSave.push(newQ)
										}
									}
								});
								console.log(['TOSAVE',toSave.length])
								toSave.map(function(question,key) {
									let p = new Promise(function(resolve,reject) {
										if (question._id) {
											db.collection('multiplechoicequestions').findOne({_id: ObjectId(question._id)}).then(function(existingQuestion) {
												// update
												//console.log(['done find det ins/upd',existingQuestion])
												if (existingQuestion) {
													db.collection('multiplechoicequestions').updateOne({_id:existingQuestion._id},{$set:question}).then(function() {question
														console.log(['UPDATED MC',Object.assign(existingQuestion,question)])
														resolve(Object.assign(existingQuestion,question));
													});
													
												// insert
												} else {
													question.createDate = new Date().getTime();
													db.collection('multiplechoicequestions').insertOne(question).then(function() {
															console.log(['inserted MC',question])
															resolve(question);
														});
													}
												});
											} else { 
												// insert
												question.createDate = new Date().getTime();
												db.collection('multiplechoicequestions').insertOne(question).then(function() {
													console.log(['inserted MC',question])
													resolve(question);
												});
											}
											
										});
										promises.push(p);
									})
									
									Promise.all(promises).then(function(toDump) {
										//cleanup
										//console.log(['TODUMPE',toDump])
											
										let ids=[];
										let final=[];
										toDump.map(function(val) {
											//console.log(['TODUMPE v',val])
											ids.push(ObjectId(val._id));
											final.push({
												_id:ObjectId(val._id),
												topic:val.topic,
												questionId:ObjectId(val.questionId),
												specific_question:val.question,
												specific_answer:val.answer,
												multiple_choices:val.multiple_choices,
												feedback:val.feedback,
												sort:val.sort,
												image:val.image,
												importId: val.importId,
												createDate:val.createDate
											});
										});
										console.log(['NOW DELETE',JSON.stringify({$and:[{_id: {$nin:ids}},{user:'default'},{importId:importId}]})])
										db.collection('multiplechoicequestions').remove({$and:[{_id: {$nin:ids}},{user:{$eq:'default'}},{importId:{$eq:'MC-'+importId}}]}).then(function(dresults) {
											console.log(['cleanup done',dresults]); 
										});
										// download with ids to bring back into google sheet
										let unparsed = Papa.unparse(final,{quotes: true});
										res.send(unparsed);
									})
								}
							}
						});
					}
				}).catch(function(e) {
					console.log(e);
				})
			}
			
		})
	});
	
	

	router.get('/guid', (req, res) => {
		console.log(['guid',req.query.guid]);
				
		if (req.query.guid && req.query.guid.length > 0) {
			initdb().then(function(db) {
				db.collection('questions').findOne({guid:{$eq:req.query.guid}}).then(function(question) {
					console.log(['guid res',question]);
					res.send(question && question._id ? question : {});
				});
			})
		} else {
			res.send({});
		}
	})
	
	

app.use('/import',router)

module.exports.handler = serverless(app);
    
