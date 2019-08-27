var config = {}
var ObjectId = require('mongodb').ObjectID;
const get = require('simple-get');

function initRoutes(router,initdb) {


	router.post('/missingmnemonics', (req, res) => {
		console.log(['mmNEM',req.body]);
		let missingQuestionsByTopic={}
		let missingMnemonicFilter={hasMnemonic:{$ne:true}};
		
		let filter=missingMnemonicFilter
		if (req.body.topic) {
			filter={$and:[missingMnemonicFilter,{quiz:req.body.topic}]}
		} else if (req.body.topics) {
			
			let topicFilter = req.body.topics.split(",").map(function(topic) {
				return {quiz:topic}
			}) ;
			filter={$and:[missingMnemonicFilter,{$or:topicFilter}]}
		}
		// console.log(['LOADING MISSING MNEM',JSON.stringify(filter)]);
		initdb().then(function(db) {
			db.collection('questions').find(filter).toArray().then(function(questions) {
			    console.log(['LOADING MISSING MNEM, FOUND MNEM FREE QU',questions,JSON.stringify(filter)]);
				questions.map(function(question,key) {
					//console.log(['LOADING TOPICS, FOUND Q',question,key]);
					if (question.quiz && question.quiz.length > 0) {
						missingQuestionsByTopic[question.quiz] = (parseInt(missingQuestionsByTopic[question.quiz],10) > 0) ? parseInt(missingQuestionsByTopic[question.quiz],10) + 1 : 1;
					 }
				});
				console.log(['MISSING',missingQuestionsByTopic]);
				res.send(missingQuestionsByTopic);
			});   
		}) 
	});


	router.post('/mnemonics', (req, res) => {
	//    //console.log(['mnemonics',req.body.question]);
		if (req.body.question && req.body.question.length > 0) {
			let promises=[];
			initdb().then(function(db) {
				db.collection('mnemonics').find({question:ObjectId(req.body.question)}).toArray(function(err, result) {
					//result.map(function(key,mnemonic));
		//            //console.log(['mnemonics found',result]);
					res.send(result);
				});
			})
		} else if (req.body.questions && req.body.questions.length > 0) {
			let questionIds = req.body.questions.split(",").map(function(qid) {return ObjectId(qid)});
			let promises=[];
			initdb().then(function(db) {
				db.collection('mnemonics').find({question: {$in:questionIds}}).toArray(function(err, result) {
					//result.map(function(key,mnemonic));
		//            //console.log(['mnemonics found',result]);
					res.send(result);
				});
			})
		} else {
			res.send({message:'Invalid request'});
		}
	})

	router.post('/mymnemonics', (req, res) => {
		////console.log(['seen',req.body]);
		if (req.body.user && req.body.user.length > 0) {
			initdb().then(function(db) {
				db.collection('mnemonics').find({user:ObjectId(req.body.user)}).toArray(function(err, result) {
					res.send(result);
				});
			})
		} else {
			res.send({message:'Invalid request'});
		}
	})


	router.post('/savemnemonic', (req, res) => {
	 //   //console.log(['seen',req.body]);
	// console.log(['save mnem']);
		if (req.body.user && req.body.question && req.body.mnemonic && req.body.mnemonic.length > 0) {//   && req.body.technique  && req.body.questionText ) {
			//console.log(['save mnem have params']);
			let user = req.body.user;
			let question = req.body.question;
			let id = req.body._id ? ObjectId(req.body._id) : new ObjectId();
			let toSave = {_id:id,user:ObjectId(req.body.user),question:ObjectId(req.body.question),mnemonic:req.body.mnemonic,questionText:req.body.questionText,technique:req.body.technique};
		   // console.log(['save mnem',toSave]);
			initdb().then(function(db) {
				db.collection('mnemonics').save(toSave).then(function(updated) {
					//console.log(['saved mnem']);
					db.collection('questions').findOne({_id:ObjectId(req.body.question)}).then(function(questionRec) {
						if (questionRec && questionRec._id) {
							let mnemonic = questionRec.mnemonic;
							if (questionRec.mnemonic && questionRec.mnemonic.length > 0) {
								// good
							} else {
								// use submitted mnemonic to update main q
								mnemonic = req.body.mnemonic;
							}
							db.collection('questions').update({_id:ObjectId(req.body.question)},{$set:{hasMnemonic:true, mnemonic:mnemonic}}).then(function() {
								//console.log(['updated question',req.body.question]);
								//res.send('updated question '+req.body.question);
							});
							res.send({message: 'updated question '+req.body.question});
						} else {
							res.send({message:'Invalid request wrong question'});
						}
					})
				}).catch(function(e) {
					res.send('error on update');
				});
			})
		} else {
			res.send({message:'Invalid request'});
		}
	})

	router.post('/deletemnemonic', (req, res) => {
		if (req.body._id && req.body._id.length > 0) {
			initdb().then(function(db) {
				db.collection('mnemonics').findOne({_id:ObjectId(req.body._id)}).then(function(mnemonic) {
					 //console.log('found MNEMONIC '+JSON.stringify(mnemonic));
					db.collection('mnemonics').remove({_id:ObjectId(req.body._id)}).then(function(result) {
					   // console.log('REMOVED MNEMONIC '+JSON.stringify(result));
						// do we still have a mnemonic ?
						db.collection('questions').findOne({_id:ObjectId(mnemonic.question)}).then(function(question) {
						   // console.log('REMOVED MNEMONIC FOUND Q '+JSON.stringify(question));
							if (question && question.mnemonic && question.mnemonic.length > 0) {
								// yes, nothing to do
							   // console.log('REMOVED MNEMONIC FOUND Q HAS MNEMONIC ');
							} else {
								db.collection('mnemonics').find({question:ObjectId(mnemonic.question)}).toArray().then(function(mnemonics) {
									//console.log('REMOVED MNEMONIC FOUND MNEMONICS ');
									if (mnemonics && mnemonics.length > 0) {
										// yes, nothing to do
									   // console.log('REMOVED MNEMONIC FOUND some mneem '+mnemonics.length);
									} else {
										//console.log('UPDATE QUESTION WITHOUT MNEMONIC');
										db.collection('questions').update({_id:ObjectId(mnemonic.question)},{$set:{hasMnemonic:false}}).then(function() {
											//console.log('REMOVED MNEMONIC UPDATED QUESTION AFTER LOOKUP ');
										});
									}
								});
							}
						});
						res.send(result);
					});
				});
			})
		} else {
			res.send({message:'Invalid request'});
		}
	})


};


module.exports = initRoutes;
