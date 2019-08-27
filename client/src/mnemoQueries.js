import Utils from './Utils';

/**
 * Mnemo Queries
 * The API has three endpoints to access questions - discover,review,questions(search) 
 * 
 */

function createIdIndex(questions,findQuestion) {
    let indexedQuestions= {};
    let foundIndex=-1;
    let currentQuiz = [];
    for (var questionKey in questions) {
        const question = questions[questionKey]
        if (question) {
            var id = question._id;
            if (id && id.length > 0) {
                currentQuiz.push(id);
                indexedQuestions[id]=questionKey;                    
                if (id === findQuestion) {
                    foundIndex=questionKey;
                }
            }
        }
    }
    foundIndex = foundIndex >=0 ? foundIndex : 0;
    return {currentQuestion:foundIndex,indexedQuestions:indexedQuestions,currentQuiz:currentQuiz};
}


let mnemoQueries = {  


/**
 * REVIEW
 */
    getQuestionsForReview : function() {
    //console.log('getQuestionsForReview');
      let that = this;
      if (this.state.user) {
		that.setState({'waiting':true});
        that.fetch('/api/review?user='+this.state.user._id).then(function(response) {
            return response.json()
          }).then(function(json) {
              let result = createIdIndex(json['questions']);
              that.setState({currentQuiz:result.currentQuiz,'currentQuestion':0, 'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Review', waiting:false});
          }).catch(function(ex) {
            that.setState({'waiting':false});
            console.log(['parsing failed', ex])
          })
      }
    },
  
   reviewBySuccessBand : function(band) {
      //console.log(['set review from band',band]);
      let that = this;
      let url='/api/review?band='+band ;
      if (this.state.user) {
          url=url+'&user='+this.state.user._id;
      }
      url=url+'&rand'+Math.random();
      that.setState({'waiting':true});
      that.fetch(url).then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Review Success Band  '+  band,waiting:false});
      }).catch(function(ex) {
        that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
  },
  
  setReviewFromTopic : function(topic,selectedQuestion) {
     // console.log(['REVIEW PAGE applayout',topic,selectedQuestion]); 
      let that = this;
      let url='/api/review?topic='+topic ;
      if (this.state.user) {
          url=url+'&user='+this.state.user._id;
      }
      url=url+'&rand='+Math.random();
      that.setState({'waiting':true});
      that.fetch(url).then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Review Topic '+  decodeURI(Utils.snakeToCamel(topic)),waiting:false});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
      
  },
    
/**
 * DISCOVER
 */
   discoverQuestions : function(topic='') {
      // //console.log(['discover da questions']);
      let that = this;
      let rand=Math.random()
      that.setState({'waiting':true});
      that.fetch('/api/discover',{ method: "POST",headers: {
    "Content-Type": "application/json"},body:JSON.stringify({user:(this.state.user ? this.state.user._id : ''),rand:rand,topic:topic})})
      .then(function(response) {
        return response.json()
      }).then(function(json) {
      let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,'title': 'Discover',waiting:false});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
  }, 
    
  discoverQuizFromTopic : function(topic,selectedQuestion) {
      console.log(['dissc quiz from topic',topic,selectedQuestion,this.state.user]);
      let that = this;
      let url='/api/discover';
      
      // this.goto()
      //fetch('/api/checktopic',{ method: "POST",headers: {
            //"Content-Type": "application/json"
            //},
            //body:JSON.stringify({
                //topic:topic,
                //user:(this.state.user ? this.state.user._id : ''),
            //})
        //})
      //.then(function(response) {
        //return response.json()
      //}).then(function(json) {
		  //if (json.ok === true) {
			  let rand=Math.random()
			  that.setState({'waiting':true});
			  that.fetch(url,{ method: "POST",headers: {
					"Content-Type": "application/json"
					},
					body:JSON.stringify({
						topic:topic,
						user:(that.state.user ? that.state.user._id : ''),
						rand:rand,
						selectedQuestion:selectedQuestion
					})
				})
			  .then(function(response) {
				return response.json()
			  }).then(function(json) {
			    console.log(['set state',json]);
			    if (json) { 
					let result = createIdIndex(json['questions'],selectedQuestion);
					console.log(['set state', json,topic,result,json.questions])
					if (result && topic && result.currentQuiz  && json && json.questions && result.indexedQuestions) {
						that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json.questions,'indexedQuestions':result.indexedQuestions,title: 'Discover Topic '+  decodeURI(Utils.snakeToCamel(topic)),waiting:false});
						console.log(['set state done', that.state])
					} 
				}
			    that.setState({'waiting':false});
			  }).catch(function(ex) {
				that.setState({'waiting':false});
				console.log(['parsing failed', ex])
			  })
			//} else {
				////that.goto('/access/topic/'+topic);
			//}
       
      //})
      
  },
  
  setQuizFromDifficulty : function(difficulty) {
      //console.log(['set quiz from difficulyt',difficulty,this.state.user]);
      let that = this;
      let url='/api/discover';
      let rand=Math.random()
      that.setState({'waiting':true});
      that.fetch(url,{ method: "POST",headers: {
            "Content-Type": "application/json"
            },
            body:JSON.stringify({
                difficulty:difficulty,
                user:(this.state.user ? this.state.user._id : ''),
                rand:rand
            })
        })
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Discover Difficulty Level '+  difficulty,waiting:false});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
      
  },
  
   setQuizFromTopics : function(topics) {
      let that = this;
      let url='/api/discover';
      let rand=Math.random()
      that.setState({'waiting':true});
      that.fetch(url,{ method: "POST",headers: {
            "Content-Type": "application/json"
            },
            body:JSON.stringify({
                topics:topics.join(","),
                user:(this.state.user ? this.state.user._id : ''),
                rand:rand
            })
        })
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Discover',waiting: false});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
      
  },
  
 
 /**
 * SEARCH
 */
    //discoverFromQuestionId : function(questionId) {
      //let that = this;
      //fetch('/api/questions?question='+questionId )
      //.then(function(response) {
        //return response.json()
      //}).then(function(json1) {
          //if (json1.questions && json1.questions.length > 0) {
            //let question=json1.questions[0];
            //if (question) {
                //let id=question._id
                //let currentQuiz=[id];
                //let indexedQuestions={};
                //indexedQuestions[id]=0;
                //let questions=[question];
                //let state={currentPage:"home",'currentQuestion':0,'currentQuiz':currentQuiz, 'questions':questions,'indexedQuestions':createIdIndex(json['questions']),title: 'Discover'};
                //that.setState(state);
            //}              
          //}
      //});
    //},
  
  //reviewFromQuestionId : function(questionId) {
      //this.setCurrentTopic('');
      ////console.log(['SQFQid',questionId]);
      //let that = this;
      //// load selected question
      //fetch('/api/questions?question='+questionId )
      //.then(function(response) {
        //return response.json()
      //}).then(function(json1) {
      ////      //console.log(['got response', json1])
          //if (json1.questions && json1.questions.length > 0) {
            //let question=json1.questions[0];
            //if (question) {
                //let id=question._id
                //let currentQuiz=[id];
                //let indexedQuestions={};
                //indexedQuestions[id]=0;
                //let questions=[question];
                //let state={currentPage:"review",'currentQuestion':0,'currentQuiz':currentQuiz, 'questions':questions,'indexedQuestions':createIdIndex(json['questions']),title: 'Review'};
                //that.setState(state);
            //}              
          //}
      //});
  //},

  //setQuizFromQuestionId : function(questionId) {
      //this.setCurrentTopic('');
      ////console.log(['SQFQid',questionId]);
      //let that = this;
      ////this.setState({'currentQuiz':'1,2,3,4,5'});
      //// load selected question
      //fetch('/api/questions?question='+questionId )
      //.then(function(response) {
        //////console.log(['got response', response])
        //return response.json()
      //}).then(function(json1) {
        //let question=json1.questions[0];
        ////console.log(['got response', json1])
        //if (question) {
            //// load questions in topic
            //fetch('/api/questions?topic='+question.quiz )
            
            //.then(function(response) {
                //////console.log(['got response', response])
                //return response.json()
            //}).then(function(json) {
                //////console.log(['create indexes', json])
                //let currentQuiz = [];
                //let indexedQuestions= {};
                //let currentQuestion=0;
                //let j=0;
                //for (var questionKey in json['questions']) {
                    //const question = json['questions'][questionKey]
                    //var id = question._id;
                    //if (questionId && questionId===id) {
                        //currentQuestion=j;
                        ////console.log(['ID match',id, j])
                    //}
                    //currentQuiz.push(id);
                    //indexedQuestions[id]=questionKey;
                    //j++;
                //}
              ////  //console.log(currentQuiz);
                //that.analyticsEvent('discover question')
                //that.setState({currentPage:"home",'currentQuestion':currentQuestion,'currentQuiz':currentQuiz, 'questions':json['questions'],'indexedQuestions':createIdIndex(json['questions']),title: 'Discover '+question.quiz});
                //////console.log(['set state done', that.state])    
            //});
        //}
      //}).catch(function(ex) {
        ////console.log(['parsing failed', ex])
      //})
      
  //},
  
  //setQuizFromQuestion : function(question) {
      //this.setCurrentTopic('');
      //let selectedQuestion=question._id;
      //////console.log(['set quiz from question',selectedQuestion]);
      //let topic = question.quiz;
      //let that = this;
      ////this.setState({'currentQuiz':'1,2,3,4,5'});
      //// load initial questions
      //let url='/api/questions?topic='+topic ;
      //if (this.state.user) {
          //url=url+'&user='+this.state.user._id;
      //}
      //fetch(url)
      //.then(function(response) {
      ////  //console.log(['got response', response])
        //return response.json()
      //}).then(function(json) {
       //// //console.log(['create indexes', json])
        //let currentQuiz = [];
        //let indexedQuestions= {};
        //let currentQuestion=0;
        //let j=0;
        //for (var questionKey in json['questions']) {
            //const question = json['questions'][questionKey]
            //var id = question._id;
           //// //console.log(['check ID match',j,id, selectedQuestion ])
            //if (selectedQuestion && selectedQuestion===id) {
                //currentQuestion=j;
             ////   //console.log(['ID match',selectedQuestion, j])
            //}
            //currentQuiz.push(id);
            //indexedQuestions[id]=questionKey;
            //j++;
        //}
       //// //console.log(['currentQuiz',currentQuestion,currentQuiz]);
        //that.analyticsEvent('discover topic')
        //that.setState({currentPage:"home",'currentQuestion':currentQuestion,'currentQuiz':currentQuiz, 'questions':json['questions'],'indexedQuestions':createIdIndex(json['questions']),title: 'Discover Topic '+  decodeURI(Utils.snakeToCamel(topic))});
        //////console.log(['set state done', that.state])
      //}).catch(function(ex) {
        ////console.log(['parsing failed', ex])
      //})
  //},
  
   setQuizFromTopic : function(topic,selectedQuestion) {  //
      let that = this;
      let url='/api/questions?topic='+topic ;
      if (this.state.user) {
          url=url+'&user='+this.state.user._id;
      }
      if (selectedQuestion && selectedQuestion.length > 0) {
          url=url+'&selectedQuestion='+selectedQuestion;
      }
      that.setState({'waiting':true});
      that.fetch(url).then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions'],selectedQuestion);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Discover Topic '+  decodeURI(Utils.snakeToCamel(topic)),waiting:false});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
      
  },
  
  setQuizFromMissingMnemonic : function(topic) {
      let that = this;
      let url='/api/questions?limit=100&missingMnemonicsOnly=1'
      
      //if (this.state.user) {
          //url=url+'&user='+this.state.user._id;
      //}
      if (topic && topic.length > 0) {
          url = url + '&topic='+topic ;
      }
      url=url + '&rand='+Math.random()
      that.setState({'waiting':true});
      that.fetch(url).then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        if (result && topic && result.currentQuiz && json && json.questions && result.indexedQuestions) {
			that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,title: 'Discover Topic '+  decodeURI(Utils.snakeToCamel(topic)),waiting:false});
		} else {
			that.setState({'waiting':false});
		}
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
      
  },
  
  
  setQuizFromTag : function(tag) {
      let that = this;
      that.setState({'waiting':true});
      that.fetch('/api/discover',{ method: "POST",headers: {"Content-Type": "application/json"},body:JSON.stringify({tag:tag}) })
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,'title': 'Discover Tag '+ decodeURI(tag),waiting:false});
        ////console.log(['set state done', that.state])
         //that.setState({});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        //console.log(['parsing failed', ex])
      })
  },
  
  setQuizFromTechnique : function(tag) {
     let that=this;
     //console.log(['set quiz form technique',tag]);
       that.setState({'waiting':true});
       that.fetch('/api/discover',{ method: "POST",headers: {"Content-Type": "application/json"},body:JSON.stringify({technique:tag})})
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        let result = createIdIndex(json['questions']);
        that.setState({currentQuiz:result.currentQuiz,'currentQuestion':result.currentQuestion,'questions':json['questions'],'indexedQuestions':result.indexedQuestions,'title': 'Discover Technique '+ decodeURI(tag),waiting:false});
      }).catch(function(ex) {
		that.setState({'waiting':false});
        console.log(['parsing failed', ex])
      })
  },
  
  //setQuizFromDiscovery : function() {
      //this.setCurrentTopic('');
     //// //console.log(['Setquiz discovery']);
      //this.setCurrentPage('discover')
      //this.discoverQuestions() 
  //}
 
 
}

export default mnemoQueries;
