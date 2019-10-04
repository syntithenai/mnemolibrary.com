var config = {}
var ObjectId = require('mongodb').ObjectID;
const get = require('simple-get');

// mongo
const mongoString = process.env.MONGODB ; 
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const validator = require('validator');

const MongoClient = require('mongodb').MongoClient




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


function textResponse(text) {
	return {responses:[{text:text}]}
} 

const helpMessages=require('./helpMessages')
const actions = {
	action_discover:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},
	
	action_review:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_what_can_i_say:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can answer questions, quiz you, or talk you through your review feed"}]}) })},

	action_tell_me_more:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_define:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_quiz:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_say_mnemonic:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_say_answer:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_say_question:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_next_question:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_previous_question:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_i_recall:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_answer_is:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},

	action_mnemonic_is:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},
	
	action_wait:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},



	action_show_me:function() {return new Promise(function(resolve,reject) {
		resolve({responses:[{text:"I can't do that yet"}]}) })},
	
	action_define:function() {return new Promise(function(resolve,reject) {
		//https://en.wiktionary.org/w/api.php?action=opensearch&search=anticlimactic
	resolve({responses:[{text:"I can't do that yet"}]}) })},
	
	// question intent
	action_tell_me_about:function(param) {
		return new Promise(function(resolve,reject) {
			console.log(JSON.stringify([param])) ;
			if (param && param.mnemotopic && param.mnemotopic.length > 0) {
				if (helpMessages.hasOwnProperty(param.mnemotopic)) {
					resolve( textResponse(helpMessages[param.mnemotopic])) //{responses:[{text:helpMessages[param.mnemotopic]}]}
				} else {
					resolve(textResponse("Sorry I don't know about "+param.mnemotopic))
				}
			} else {
				if (param && param.discoverytopic && param.discoverytopic.length > 0) {
					return initdb().then(function(db) {
						console.log(['QUERY QUESTIONS',param.discoverytopic])
						//name:{'$regex' : param.discoverytopic, '$options' : 'i'}
						
						var criteria = [];
						criteria.push({$text: {$search: param.discoverytopic.trim()}});
						
					  // console.log(criteria);
					  let limit = 1;
					  let skip = 0;
						db.collection('questions').find({$and:criteria}).limit(limit).skip(skip).project({score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).toArray(function(err, results) {
							console.log('SEARCH RESULTS')
							console.log(results)
							if (results && results.length > 0) {
								let question = results[0];
								if (question && question.answer && question.answer.length > 0) {
									resolve(textResponse(question.answer))
								} else {
									resolve(textResponse("Sorry I don't know about "+param.discoverytopic))
								}
								console.log(['QUERIED QUESTIONS',question])
							} else {
								resolve(textResponse("Sorry I don't know about "+param.discoverytopic))
							}
						})
						
						
						
					})
				} else {
					resolve(textResponse("I didn't understand your question. Try say, tell me about, your topic"))
				}
				
				//return textResponse("Sorry, I don't know about "+(param && param.mnemotopic && param.mnemotopic.length > 0 ? param.mnemotopic : (param && param.discoverytopic ? param.discoverytopic : ''))) //{responses:[{text:'Tell about '+(param.mnemotopic && param.mnemotopic.length > 0 ? param.mnemotopic : (param.discoverytopic ? param.discoverytopic : {}))}]}
			}
		})
	},
	
	//// tests
	//action_eek:function() {},
	
	//action_dostuff:function() {
		//return {
			//"events": [
			////{
			////"event": "slot",
			////"timestamp": 1559744410
			////}
			//],
			//"responses": [
			//{
			//"text": "all done"
			//}
			//]
		//}
	//},
	
}
module.exports = actions;
