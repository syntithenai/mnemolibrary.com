/* eslint-disable */ 
/* global gapi */
/* global document */
import {CognitoAuth} from 'amazon-cognito-auth-js';
import AWS from 'aws-sdk'
import React, { Component } from 'react';
//import AdSense from 'react-adsense';
//let Paho = require('paho-mqtt')
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import PropsRoute from './PropsRoute';
 
import Navigation from './Navigation';
import SettingsPage from './SettingsPage';
import HelpVideos from './HelpVideos';
import AboutPage from './AboutPage';
import TermsOfUse from './TermsOfUse';
import IntroPage from './IntroPage';
//import ReviewPage from './ReviewPage';
import ReviewPage from './ReviewPage';
import TagsPage from './TagsPage';
import TopicsPage from './TopicsPage';
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';
import SearchPage from './SearchPage';
import QuizCarousel from './QuizCarousel';
import Footer from './Footer';
import SiteMap from './SiteMap';
import FindQuestions from './FindQuestions';
import CreateHelp from './CreateHelp';
import QuizCollection from './QuizCollection';
import MultipleChoiceTopics from './MultipleChoiceTopics';
import MultipleChoiceQuestions from './MultipleChoiceQuestions';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import MyMultipleChoiceStats from './MyMultipleChoiceStats'
import FAQ from './FAQ';

import 'whatwg-fetch'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//

import mnemoQueries from './mnemoQueries'

import Utils from './Utils';
export default class App extends Component {

  constructor(props) {
      super(props);
      let that = this;
      let defaultUsers={'default':{
          'seenIntro': false, 
          'questions':{'seen':{},'success':{},'seenTally':{},'successTally':{},'successRate':{},'timeScore':{},'block':{},'likes':{}},
          'topics':{},
          'tags':{},
        //  'review':[]
        }};
      let users = null;
      this.GoogleAuth = null; // Google Auth object.
      this.mqttClient = null;
      this.mqttClientId = null;
      this.messageTimeout = null;
      
      let userString = localStorage.getItem('users');
      if (userString) {
          let data = JSON.parse(userString);
          users = data['users'];
      }
      Object.keys(mnemoQueries).map(function(key) {
          that[key] = mnemoQueries[key].bind(that);
      });
      
      this.state = {
          title : "Mnemo's Library",
          message: null,
          currentTopic: "",
          currentPage: "", //splash
          currentQuestion: 0,
          questions: null,
          indexedQuestions: [],
          topics: [],
          tags: [],
          words: [],
          relatedTags: [],
          tagTopics: {},
          topicTags: {},
          users: users ? users : defaultUsers,  // really progress vs user/token below
          currentQuiz: [],
          tagFilter : null,
          titleFilter: '',
          response : null,
          user:null,
          token:null,
          mnemonic_techniques :	["homonym","association","alliteration","rhyme","acronym","mnemonic major system","visual"],
          topicCollections:[],
          discoveryBlocks:{tag:[],topic:[],technique:[]},
          showCommentDialog : false,
          comments:[],
          comment: null,
          id_token:null,
          loginCallback:''
      }
    
      // Initialize the Amazon Cognito credentials provider
		this.IdentityPoolId= process.env.REACT_APP_IDENTITY_POOL_ID
        this.authDomain=process.env.REACT_APP_AUTH_DOMAIN
		this.authClientId=process.env.REACT_APP_CLIENT_ID
		this.authClientSecret=process.env.REACT_APP_CLIENT_SECRET
		this.websiteUrl=process.env.REACT_APP_REDIRECT_URL
		AWS.config.region = process.env.REACT_APP_REGION
		
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: this.IdentityPoolId,
		});
        this.loginUrl  = 'https://'+this.authDomain + '/login?response_type=token&client_id=' + this.authClientId + '&redirect_uri='+this.websiteUrl;
		
		
        this.setCurrentQuestion = this.setCurrentQuestion.bind(this);
        this.setCurrentQuiz = this.setCurrentQuiz.bind(this);
        //this.setQuiz = this.setQuiz.bind(this);
		this.stopWaiting = this.stopWaiting.bind(this);
		this.startWaiting = this.startWaiting.bind(this);
		this.setExitRedirect = this.setExitRedirect.bind(this)
		   
		 this.sendAllQuestionsForReview = this.sendAllQuestionsForReview.bind(this)  
        
        this.updateProgress = this.updateProgress.bind(this);
        
        this.setTitleFilter = this.setTitleFilter.bind(this)
          
	this.setCurrentPage = this.setCurrentPage.bind(this);
  

        this.clearTagFilter = this.clearTagFilter.bind(this);
        this.setMessage = this.setMessage.bind(this);

        this.like = this.like.bind(this);
       
        this.saveSuggestion = this.saveSuggestion.bind(this);
        // login related
        this.isAdmin = this.isAdmin.bind(this);
        this.logout = this.logout.bind(this);
        this.isLoggedIn = this.isLoggedIn.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.openAuth = this.openAuth.bind(this);
        // quiz collections
        this.fetchTopicCollections = this.fetchTopicCollections.bind(this);
        this.showCollection = this.showCollection.bind(this);
        this.hideCollection = this.hideCollection.bind(this);
        this.collectionVisible = this.collectionVisible.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.fetch = this.fetch.bind(this)
        this.openLoginWindow = this.openLoginWindow.bind(this)
		this.setLoginCallback = this.setLoginCallback.bind(this)
        
  };
  
  
  
    componentDidMount() {
      this.handleLogin()
      this.fetchTopicCollections(); 
  };
  
  
  componentDidUpdate(props) {
	  if (this.props.comment !== props.comment) {
		  this.setState({editCommentReply:null});
	  }
  }
  setCurrentPage(page) {
      this.setState({currentPage:page});
  }


  
	fetch(url,optionsIn) {
		if (url && this.state.token && this.state.token.id_token && this.state.token.id_token.length > 0) {
			let options = optionsIn ? optionsIn : {};
			return fetch(Utils.devUriPrefix() + url,Object.assign(options,{headers:{Authorization:this.state.token.id_token}}))
		} else {
			return fetch(Utils.devUriPrefix() + url,optionsIn)
		}
	}
	
	setLoginCallback(cb) {
		this.setState({loginCallback:cb})
	}
	
	// https://github.com/amazon-archives/amazon-cognito-identity-js/issues/508
	openLoginWindow(redirect) {
		window.location=this.loginUrl+redirect;
		
		return;
		//let that = this;
		//console.log('OPEN LOGIN')
		//window.open(
		  //this.loginUrl,
		  //"Login",
		  //"location,toolbar,resizable,scrollbars,status,width=600,height=600"
		//);

		//window.addEventListener("message", res => {
			//console.log('MESSAGE')
			//console.log(res)
		  
			//var idToken = res && res.data && res.data.IdToken ? res.data.IdToken : null;
			//var accessToken = res && res.data && res.data.AccessToken ? res.data.AccessToken : null;
			//var refreshToken = null; //session.getRefreshToken() ? session.getRefreshToken().getToken() : null;
			//that.setState({token:{access_token:accessToken,id_token:idToken,refresh_token:refreshToken}})
			//console.log('fetch user real')
			//console.log(idToken);
			//if (idToken) that.fetch("/api/me?id_token="+idToken,{headers:{Authorization:idToken}}).then(function(me) {
				//me.json().then(function(user) {
					//if (user) user.username = user.email;
					////state.user = res.user;
					////state.token = res.token;
					////localStorage.setItem('token',JSON.stringify(res.token));
					////localStorage.setItem('user',JSON.stringify(res.user));
					//that.setState({user:user});
					//console.log('ME');
					//console.log(user);
				//})
			//})	
		  
		//}, false);
	 
	}
	
	
  
	handleLogin() {
		let that = this;
	  		var params = {
			IdentityPoolId: this.IdentityPoolId
		};
		
		function getHashValue(key) {
			var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
			return matches ? matches[1] : null;
		}
		
		var authData = {
			ClientId : this.authClientId, // Your client id here
			AppWebDomain : this.authDomain,
			TokenScopesArray : ['email','profile'], // e.g.['phone', 'email', 'profile','openid', 'aws.cognito.signin.user.admin'],
			RedirectUriSignIn : this.websiteUrl,
			RedirectUriSignOut : this.websiteUrl,
			//IdentityProvider : '<TODO: add identity provider you want to specify>', // e.g. 'Facebook',
			UserPoolId : this.IdentityPoolId
		};
		console.log(['AUTH DATA',authData])
		function fetchUser(session) {
			//console.log('fetch user')
			//console.log(
			if (session) {
			//console.log('fetch user session')
			//console.log(session)
				var idToken = session.getIdToken() ? session.getIdToken().getJwtToken() : null;
				var accessToken = session.getAccessToken() ? session.getAccessToken().getJwtToken() : null;
				var refreshToken = session.getRefreshToken() ? session.getRefreshToken().getToken() : null;
				//that.setState({})
				//console.log('fetch user real')
				//console.log(idToken);
				that.startWaiting()
				that.fetch("/api/me?id_token="+idToken,{headers:{Authorization:idToken}}).then(function(me) {
					me.json().then(function(user) {
						//if (user && !user.username) user.username = user.email;
						//state.user = res.user;
						//state.token = res.token;
						//localStorage.setItem('token',JSON.stringify(res.token));
						//localStorage.setItem('user',JSON.stringify(res.user));
						that.stopWaiting()	
						that.setState({user:user,token:{access_token:accessToken,id_token:idToken,refresh_token:refreshToken}});
						let state = decodeURIComponent(getHashValue('state'))
						//console.log('CHECK REDIR IN STATE')
						//console.log(state);
						//if (state.length > 0 && state !== null && state !== 'null') {
							//window.location = state
							//console.log('CHECK REDIR IN STATE YES')
							//that.setState({exitRedirect:state})
						//}
						//console.log('ME');
						//console.log(user);
					})
				})		
			}
		}
		let session = null; 
		
		var auth = new CognitoAuth(authData);
		auth.userhandler = {
			onSuccess: function(result) {
				//console.log("Sign in success");
				//console.log(result);
				session = result;
				fetchUser(result);
			},
			onFailure: function(err) {
				console.log("Error!");
			}
		};
		this.auth = auth;
		
		var curUrl = window.location.href;
		//auth.getSession()
		
		
		//if (session) {
			//fetchUser(session)
		//}	
		
		// handle login system callbacks
		let usession = auth.parseCognitoWebResponse(curUrl)
		// pull session from storage
		//setTimeout(function() {
			let cached = auth.getCachedSession();
			//console.log(cached);
			if (cached && cached.getIdToken().getJwtToken().length > 0) {
				//console.log('usersession from cached')
				fetchUser(cached);
			} else {
				//console.log('nouser')
					var cognitoidentity = new AWS.CognitoIdentity();
					var params = {
						IdentityPoolId: this.IdentityPoolId
					};

					// tslint:disable-next-line:no-any
					cognitoidentity.getId(params, function(err, data) {
						if (err) {
							console.log(err, err.stack); // an error occurred
						} else {

							AWS.config.credentials = new AWS.CognitoIdentityCredentials({
								IdentityPoolId: this.IdentityPoolId,
								IdentityId: data.IdentityId
							});
							//console.log('GOTID')
							//console.log(data)
							var params = {
							  IdentityId: data.IdentityId,
							};
							cognitoidentity.getCredentialsForIdentity(params, function(err, data) {
							  if (err) console.log(err, err.stack); // an error occurred
							  else     {
									let accessToken = data && data.Credentials ? data.Credentials.SessionToken : null;
									//console.log('no user access token')
							
									//console.log(accessToken);           // successful response
									that.setState({token:{access_token:accessToken}})
							  }
							});

							// access AWS resources
						}
					});
			}

  }
  
  
	
	startWaiting() {
		this.setState({waiting: true})
	}
	stopWaiting() {
		this.setState({waiting: false})
	}
	

  getQueryStringValue (key) {  
          return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
  } 
  
  setCurrentTopic(topic) {
      this.setState({currentTopic:topic});
  };
  
  getCurrentTopic() {
      return this.state.currentTopic;
  };
  

  openAuth(service) {
      ////console.log(['oauth '+service]);
      let authRequest={redirect_uri:this.getQueryStringValue('redirect_uri'),response_type:this.getQueryStringValue('response_type'),scope:this.getQueryStringValue('scope'),state:this.getQueryStringValue('state')}
      // force logout
      let code = this.state.token ? this.state.token.access_token : '';
     // if (code) {
		  localStorage.setItem('token','{}');
		  localStorage.setItem('user','{}');
		  this.setState({'token':'{}','user':'{}'});
		  //    this.GoogleAuth.disconnect();
		  
		  // CURRENTPAGE TODO
		  this.setCurrentPage('login');
		  localStorage.setItem('oauth',service);
		  localStorage.setItem('oauth_request',JSON.stringify(authRequest));
		  document.location='/profile?code='+code
		//}
  };

    
  fetchTopicCollections() {
      let that=this;
      this.fetch('/api/topiccollections')
      .then(function(response) {
        ////console.log(['got response', response])
        return response.json()
      }).then(function(json) {
        ////console.log(['create indexes', json])
        that.setState({topicCollections:json[0]});
        that.setState({questionsMissingMnemonics:json[1]});
      }).catch(function(ex) {
        //console.log(['parsing failed', ex])
      })
  };
  
  isAdmin() {
        if (this.state.user && this.state.user.username && 
        (this.state.user.username==="stever@syntithenai.com" 
            || this.state.user.username==="syntithenai@gmail.com" 
//            || this.state.user.username==="sofieblossom@gmail.com" 
            || this.state.user.username==="mnemoslibrary@gmail.com" 
            || this.state.user.username.toLowerCase()==="trevorryan123@gmail.com")) {
            return true;
        }
        return false;
    };
    
  logout() {
	  console.log('LOGOUT')
      var state={};
      state.user = '';
      state.token = '';
       state.currentPage = 'splash';
      localStorage.setItem('token','{}');
      localStorage.setItem('user','{}');
      this.setState(state);
      localStorage.setItem('currentTopic',null)
      ////console.log(['logout',gapi.auth2]);
      ////console.log(this.state);
      //this.GoogleAuth.disconnect();
      //let GoogleAuth = gapi.auth2.getAuthInstance();
     // if (this.GoogleAuth)  this.GoogleAuth.disconnect();
      if (this.auth) this.auth.signOut()
     // window.location='/';
      //gapi.auth2.getAuthInstance().disconnect();
      //var auth2 = gapi.auth2.getAuthInstance();
        //auth2.signOut().then(function () {
          ////console.log('User signed out.');
        //});
    ////console.log('logout at root');
      
  };
        
  isLoggedIn() { 
      //
      if (this.state.token && this.state.token.access_token && this.state.token.access_token.length > 0 && this.state.user && this.state.user._id  && this.state.user._id.length > 0) {
          return true;
      } else {
          return false;
      }
  };  
  
     saveUser(user,child) {
         let that = this;
           that.startWaiting()
        return this.fetch('/api/saveuser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        }).then(function(res) {
            return res.json();  
        }).then(function(res) {
            that.stopWaiting()
            //console.log('saved user');
            
            //console.log(res);
            //console.log(user);
            
            child.setState(Object.assign({'warning_message':'Saved'},res));
            //that.setState({users:{default:user}});
            
            that.setState({user:Object.assign(that.state.user,user)});
        }).catch(function(err) {
            that.stopWaiting()
            console.log(err);
            child.setState({'warning_message':'Not Saved'});
        });
    };
   
  
 
  setCurrentQuiz(quiz) {
      this.setState({'currentQuiz':quiz});
  };  

    setCurrentQuestion(id) {
       // //console.log(['set current question',id]);
        this.setState({currentQuestion:parseInt(id,10)});
    };
    
  isCurrentPage(page) {
      return (this.state.currentPage === page);
  }; 
 
  setMessage(message) {
      let that = this;
      this.setState({'message':message});
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(function() {
		  that.setState({message:null})
	  },3000)
      
  };

    saveSuggestion(id,question,mnemonic,technique) {
        let that=this;
        if (this.state.user) {
           // //console.log(['SAVE SUGGESTION',id,question,mnemonic,technique]);
             return this.fetch('/api/savemnemonic', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({_id:id,user:that.state.user._id,mnemonic:mnemonic,technique:technique,question:question._id,questionText:question.question})
            }).then(function(res) {
                return res.json();  
            }).then(function(res) {
                
            }).catch(function(err) {
                ////console.log(err);
                that.setState({'warning_message':'Not Saved'});
            });
        }
    };

  // send an api request to save a selected mnemonic
  
  like(questionId,mnemonicId) {
      ////console.log(['applike']);
    let that = this;
    let userSelections = this.state.user.selectedMnemonics ? this.state.user.selectedMnemonics : {} ;  
    userSelections[questionId] = mnemonicId;
    this.startWaiting()
    return this.fetch('/api/saveuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'_id':this.state.user._id,avatar:this.state.user.avatar,selectedMnemonics:userSelections})
    }).then(function() {
        let user=that.state.user;
        user.selectedMnemonics = userSelections;
		that.stopWaiting()
    }).catch(function(err) {
        console.log(err);
        that.stopWaiting()
    });
    //return false;
  };

  // request api import and dowload results as csv
  import(importId) {
      let that = this;
      that.startWaiting()
      this.fetch('/import/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({importId:importId})
        }).then(function(res) {
            return res.text();
        }).then(function(res) {
            var FileSaver = require('file-saver');
            var blob = new Blob([res], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, "questions.csv");
            //fetch('/api/sitemap');
			that.stopWaiting()
        }).catch(function(err) {
			that.stopWaiting()
            that.setState({'warning_message':'Not Saved'});
        });
  };
  
 
  // request api import and dowload results as csv
  importMultipleChoice(importId) {
      let that = this;
      that.startWaiting()
      this.fetch('/import/importmultiplechoicequestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({importId:importId})
        }).then(function(res) {
            return res.text();
        }).then(function(res) {
            that.setState({'warning_message':'Import Complete'});
            var FileSaver = require('file-saver');
            var blob = new Blob([res], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, "mcquestions.csv");
            that.stopWaiting()
        }).catch(function(err) {
            that.setState({'warning_message':'Not Saved'});
            that.stopWaiting()
        });
  };

  clearTagFilter() {
      this.setState({'tagFilter':null});
  };

  // save modified user to state and localstorage
    updateProgress(user) {
        //let users = {'users':{'default':user}};
        //this.setState(users);
        //localStorage.setItem('users',JSON.stringify(users));
    };
    
        
    showCollection(collection) {
        this.setState({collection:collection});
    };
    
    hideCollection() {
        this.setState({collection:null,titleFilter:''});
    };
    
    collectionVisible() {
        return this.state.collection;
    };
    
    setTitleFilter(event) {
		let filter    = event.target.value;        
		this.setState({titleFilter:filter});
	}
	
	getCurrentQuestion() {
       // //console.log(['currentQuestion',this.state]);
        let question=null;
        if (this.state && this.state.currentQuestion !== null && Array.isArray(this.state.currentQuiz) && this.state.indexedQuestions && this.state.questions) {
            question = this.state.questions[this.state.indexedQuestions[this.state.currentQuiz[this.state.currentQuestion]]];
        }
        return question;
    };
    
    
    	
	sendAllQuestionsForReview(questions) {
		let that = this;
		if (questions && questions.length > 0) {
			let ids=[];
			questions.map(function(question) {
				if (question) ids.push(question._id);
			})
			//console.log(['SEND Q R',ids,questions])
			this.fetch('/api/sendallquestionsforreview', {
			  method: 'POST',
			   headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
				'user':that.state.user._id,
				'questions':ids,
				})
           
			}).then(function(response) {
				return response.json();
			}).then(function(res) {
				//console.log('done add all to review')
				that.setMessage('Added '+ids.length+' question'+(ids.length > 1 ? 's' : '') +' to your review list')
				
				
			})
		}
	}
 
  setExitRedirect(redirect) {
	  this.setState({exitRedirect:redirect})
  }
    
    
  render() {
    const progress = this.state.users.default;
    const topics = this.state.topics;
    const tags = this.state.words;
    //const showProfile = this.isCurrentPage('profile') && this.isLoggedIn();
    const showLogin = this.isCurrentPage('login') && !this.isLoggedIn();
    let title=decodeURIComponent(this.state.title);
   // let question = this.getCurrentQuestion()
    //console.log(['APPLAYOUT',question])
    let oauth=localStorage.getItem('oauth');
//console.log(['oauth ? ',oauth,this.state.user])
    if (this.state.exitRedirect && this.state.exitRedirect.length > 0) {
		return <Router><Redirect to={this.state.exitRedirect} /></Router>
    } else if (this.isCurrentPage('disabled')) {
        return (<div>DISABLED!!</div>);
    } else {
        //let oauth=localStorage.getItem('oauth');
        let authRequest = localStorage.getItem('oauth_request');
        //console.log([authRequest,this.props.token,this.props.user]);
        let auth =JSON.parse(authRequest);
        if (!auth) auth={};
    
        let searchPage = <div><TopicsPage topicCollections={this.state.topicCollections} topics={topics}  topicTags={this.state.topicTags} tagFilter={this.state.tagFilter}  clearTagFilter={this.clearTagFilter} setQuizFromTopic={this.setQuizFromTopic} setQuiz={this.setQuizFromTopic} questionsMissingMnemonics={this.state.questionsMissingMnemonics} setQuizFromMissingMnemonic={this.setQuizFromMissingMnemonic} setCurrentPage={this.setCurrentPage} isLoggedIn={this.isLoggedIn} setQuizFromDiscovery={this.setQuizFromDiscovery} setQuizFromDifficulty={this.setQuizFromDifficulty} setQuizFromTopics={this.setQuizFromTopics}  setQuizFromQuestionId={this.setQuizFromQuestionId} title={title} user={this.state.user} showCollection={this.showCollection} hideCollection={this.hideCollection} collectionVisible={this.collectionVisible} collection={this.state.collection} analyticsEvent={this.analyticsEvent} fetch={this.fetch} token={this.state.token}  startWaiting={this.startWaiting} stopWaiting={this.stopWaiting} /></div>
        
        let topicsPageOptions={ analyticsEvent:this.analyticsEvent, titleFilter:this.state.titleFilter,setTitleFilter:this.setTitleFilter,topicCollections:this.state.topicCollections,topics:topics,topicTags:this.state.topicTags,tagFilter:this.state.tagFilter,clearTagFilter:this.clearTagFilter,setQuizFromTopic:this.setQuizFromTopic,setQuiz:this.setQuizFromTopic,questionsMissingMnemonics:this.state.questionsMissingMnemonics,setQuizFromMissingMnemonic:this.setQuizFromMissingMnemonic,setCurrentPage:this.setCurrentPage,isLoggedIn:this.isLoggedIn,setQuizFromDiscovery:this.setQuizFromDiscovery,setQuizFromDifficulty:this.setQuizFromDifficulty,setQuizFromTopics:this.setQuizFromTopics,setQuizFromQuestionId:this.setQuizFromQuestionId,title:title,user:this.state.user,showCollection:this.showCollection,hideCollection:this.hideCollection,collectionVisible:this.collectionVisible,collection:this.state.collection,setQuizFromQuestionId:this.setQuizFromQuestionId ,newCommentReply:this.newCommentReply, fetch:this.fetch, token:this.state.token ,openLoginWindow: this.openLoginWindow, startWaiting: this.startWaiting, stopWaiting: this.stopWaiting}
        
        let profilePageOptions = {analyticsEvent:this.analyticsEvent,  token:this.state.token,setCurrentPage:this.setCurrentPage,setQuizFromDiscovery:this.setQuizFromDiscovery,reviewBySuccessBand:this.reviewBySuccessBand,setReviewFromTopic:this.setReviewFromTopic,setQuizFromTopic:this.discoverQuizFromTopic,searchQuizFromTopic:this.setQuizFromTopic, isAdmin:this.isAdmin,saveUser:this.saveUser,user:this.state.user,token:this.state.token,logout:this.logout,import:this.import,importMultipleChoice:this.importMultipleChoice,isLoggedIn:this.isLoggedIn, fetch:this.fetch, token:this.state.token,openLoginWindow: this.openLoginWindow}
        
        let reviewPageOptions = { analyticsEvent:this.analyticsEvent, isAdmin:this.isAdmin,saveSuggestion:this.saveSuggestion,setCurrentQuestion:this.setCurrentQuestion,setCurrentPage:this.setCurrentPage,setCurrentQuiz:this.setCurrentQuiz,setQuizFromTechnique:this.setQuizFromTechnique,setQuizFromDiscovery:this.setQuizFromDiscovery,setQuizFromTopic:this.setQuizFromTopic,setReviewFromTopic:this.setReviewFromTopic,discoverQuizFromTopic:this.discoverQuizFromTopic,setQuizFromTag:this.setQuizFromTag,blocks:this.state.discoveryBlocks,discoverQuestions:this.discoverQuestions,getQuestionsForReview:this.getQuestionsForReview,mnemonic_techniques:this.state.mnemonic_techniques,questions:this.state.questions,currentQuiz:this.state.currentQuiz,currentQuestion:this.state.currentQuestion,indexedQuestions:this.state.indexedQuestions,topicTags:this.state.topicTags,updateProgress:this.updateProgress,finishQuiz:this.finishReview,isReview:true,setMessage:this.setMessage,like:this.like,user:this.state.user,progress:progress,getCurrentTopic:this.getCurrentTopic,isLoggedIn:this.isLoggedIn,getCurrentBand:this.getCurrentBand,reviewBySuccessBand:this.reviewBySuccessBand,setQuizFromDifficulty:this.setQuizFromDifficulty,editComment:this.editComment,deleteComment:this.deleteComment,newComment:this.newComment,toggleCommentDialog:this.toggleCommentDialog,comments:this.state.comments,setComment:this.setComment,comment:this.state.comment,saveComment:this.saveComment,loadComments:this.loadComments,newCommentReply:this.newCommentReply,sendAllQuestionsForReview:this.sendAllQuestionsForReview,comment:this.state.comment, fetch:this.fetch, token:this.state.token,openLoginWindow: this.openLoginWindow, startWaiting: this.startWaiting, stopWaiting: this.stopWaiting}
        
        
        
        let discoverPageOptions ={ analyticsEvent:this.analyticsEvent, isAdmin:this.isAdmin,saveSuggestion:this.saveSuggestion,setCurrentQuestion:this.setCurrentQuestion,setCurrentPage:this.setCurrentPage,setCurrentQuiz:this.setCurrentQuiz,setQuizFromTechnique:this.setQuizFromTechnique,setQuizFromDiscovery:this.setQuizFromDiscovery,setQuizFromTopic:this.setQuizFromTopic,setReviewFromTopic:this.setReviewFromTopic,discoverQuizFromTopic:this.discoverQuizFromTopic,setQuizFromTag:this.setQuizFromTag,discoverQuestions:this.discoverQuestions,getQuestionsForReview:this.getQuestionsForReview,mnemonic_techniques:this.state.mnemonic_techniques,questions:this.state.questions,currentQuiz:this.state.currentQuiz,currentQuestion:this.state.currentQuestion,indexedQuestions:this.state.indexedQuestions,topicTags:this.state.topicTags,updateProgress:this.updateProgress,setMessage:this.setMessage,like:this.like,user:this.state.user,progress:progress,getCurrentTopic:this.getCurrentTopic,isLoggedIn:this.isLoggedIn,getCurrentBand:this.getCurrentBand,reviewBySuccessBand:this.reviewBySuccessBand,setQuizFromDifficulty:this.setQuizFromDifficulty,setQuizFromTopics:this.setQuizFromTopics,setQuizFromTechnique:this.setQuizFromTechnique,setQuizFromQuestionId:this.setQuizFromQuestionId ,setQuizFromMissingMnemonic:this.setQuizFromMissingMnemonic ,sendAllQuestionsForReview:this.sendAllQuestionsForReview, fetch:this.fetch, token:this.state.token, startWaiting: this.startWaiting, stopWaiting: this.stopWaiting}
        
         
        
         
         //commentText={this.state.comment.comment} commentType={this.state.comment.type} commentCreateDate={this.state.comment.createDate} question={this.state.comment.question}   user={this.state.user} visible={this.state.showCommentDialog}  loadComments={this.loadComments} toggleVisible={this.toggleCommentDialog}
        return (
        <Router>
			
        
        
			<div style={{width:'100%'}} className="mnemo">
				{(this.state.waiting) && <div onClick={this.stopWaiting} style ={{position: 'fixed', top: 0, left: 0, width:'100%',height:'100%',backgroundColor:'grey',zIndex:9999999,opacity:0.3}}  ><img style={{height:'7em' }} src='/loading.gif' /></div>}
				
				
				{this.state.message && <b style={{zIndex:99999999,position:'fixed',top:'7em',left:'50%',backgroundColor:'pink',border:'1px solid black',color:'black',padding:'0.8em'}}>{this.state.message}</b>}
				
				{false && this.state.message && <div className='page-message' ><b>{this.state.message}</b></div>}
				<PropsRoute  path="/" component={Navigation}  setCurrentTopic={this.setCurrentTopic} shout={this.shout} user={this.state.user} isLoggedIn={this.isLoggedIn} setCurrentPage={this.setCurrentPage} login={this.login} setQuizFromDiscovery={this.setQuizFromDiscovery} title={this.state.title} hideCollection={this.hideCollection}  	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  openLoginWindow={this.openLoginWindow} />
                
                <PropsRoute  exact={true} path="/sitemap" component={SiteMap} isAdmin={this.isAdmin} isLoggedIn={this.isLoggedIn} logout={this.logout} import={this.import} importMultipleChoice={this.importMultipleChoice} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  openLoginWindow={this.openLoginWindow} /> 
             
                
                
                <PropsRoute  exact={true} path="/help" component={AboutPage} analyticsEvent={this.analyticsEvent}  />
                <PropsRoute  path="/help/about" component={AboutPage} analyticsEvent={this.analyticsEvent} />
                <PropsRoute  path="/help/intro" component={IntroPage} analyticsEvent={this.analyticsEvent}/>
                <PropsRoute  path="/help/termsofuse" component={TermsOfUse} analyticsEvent={this.analyticsEvent}/>
                <PropsRoute  path="/help/faq" component={FAQ} analyticsEvent={this.analyticsEvent}/>
                <PropsRoute  path="/help/create" isLoggedIn={this.isLoggedIn} component={CreateHelp} analyticsEvent={this.analyticsEvent} token={this.state.token}  user={this.state.user}  openLoginWindow={this.openLoginWindow} />
                <PropsRoute  path="/help/videos" component={HelpVideos} analyticsEvent={this.analyticsEvent} />
                
                
                <PropsRoute exact={true} path='/multiplechoicetopics/:topicCollection'  topicCollections={this.state.topicCollections} user={this.state.user} component={MultipleChoiceTopics} newCommentReply={this.newCommentReply} fetch={this.fetch}  />
                <PropsRoute exact={true} path='/multiplechoicetopics'  user={this.state.user} topicCollections={this.state.topicCollections}  component={MultipleChoiceTopics}   newCommentReply={this.newCommentReply} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />
                
                <PropsRoute exact={true} path='/multiplechoicequestions/:topic'   user={this.state.user} isAdmin={this.isAdmin} component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch} />

                <PropsRoute exact={true} path='/mymultiplechoicequestions' mode="myquestions"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch} />

                <PropsRoute exact={true} path='/mymultiplechoicequestions/:topic' mode="myquestions"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />

                <PropsRoute exact={true} path='/mymultiplechoicetopics' mode="mytopics"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />

                <PropsRoute exact={true} path='/mymultiplechoicetopics/:topic' mode="mytopics"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />
                
                
                
                <PropsRoute  exact={true} path="/search" component={TopicsPage} {...topicsPageOptions} analyticsEvent={this.analyticsEvent}  />
                <PropsRoute  exact={true} path="/" component={TopicsPage} {...topicsPageOptions} analyticsEvent={this.analyticsEvent} />
                
                <PropsRoute  path="/search/tags" analyticsEvent={this.analyticsEvent} component={TagsPage}   titleFilter={this.state.titleFilter} setTitleFilter={this.setTitleFilter}  setCurrentPage={this.setCurrentPage} tags={tags} relatedTags={this.state.relatedTags} setQuiz={this.setQuizFromTag}  fetch={this.fetch}  />
                
                <PropsRoute  path="/search/questions" analyticsEvent={this.analyticsEvent} component={SearchPage}  titleFilter={this.state.titleFilter} setTitleFilter={this.setTitleFilter} mnemonic_techniques={this.state.mnemonic_techniques} setCurrentPage={this.setCurrentPage} questions={this.state.questions} setQuiz={this.setQuizFromQuestion}   fetch={this.fetch}  />
                
                <PropsRoute  path="/missing/:missingtopic" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  exact={true} path="/discover" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  exact={true}  path="/discover/:topic" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  exact={true} path="/discover/topic/:topic" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  path="/discover/topic/:topic/:topicquestion" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  exact={true}  path="/discover/searchtopic/:searchtopic" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  path="/discover/searchtopic/:searchtopic/:topicquestion" component={QuizCarousel} {...discoverPageOptions}  />
                
                <PropsRoute  path="/discover/difficulty/:difficulty" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  path="/discover/tag/:tag" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  path="/discover/topics/:topics" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  path="/discover/technique/:technique" component={QuizCarousel} {...discoverPageOptions}  />
                <PropsRoute  path="/discover/question/:question" component={QuizCarousel} {...discoverPageOptions}  />
                
                 <PropsRoute  exact={true} path="/review" component={ReviewPage} {...reviewPageOptions}  />
                 <PropsRoute  exact={true}  path="/review/:topic" component={ReviewPage} {...reviewPageOptions}  />
                 <PropsRoute  exact={true} path="/review/topic/:topic" component={ReviewPage} {...reviewPageOptions}  />
                 <PropsRoute  path="/review/:topic/:topic/:topicquestion" component={ReviewPage} {...reviewPageOptions}  />
                 <PropsRoute  path="/review/band/:band" component={ReviewPage} {...reviewPageOptions}  />
                
                 <PropsRoute  path="/login" component={LoginPage} openLoginWindow={this.openLoginWindow} loginUrl={this.loginUrl} token={this.state.token} isLoggedIn={this.isLoggedIn} login={this.login} setCurrentPage={this.setCurrentPage} analyticsEvent={this.analyticsEvent} loginCallback={this.state.loginCallback} />
                 
               
                 
                 
                {<div>
					
					
		    <PropsRoute exact={true} path='/mcstats'  component={MyMultipleChoiceStats} analyticsEvent={this.analyticsEvent} fetch={this.fetch} />


					
						<PropsRoute  path="/profile" component={ProfilePage} {...profilePageOptions} analyticsEvent={this.analyticsEvent}  token={this.state.token} openLoginWindow={this.openLoginWindow} />
						 <br/>
					   
						<PropsRoute  path="/settings"  component={SettingsPage} saveUser={this.saveUser} token={this.state.token} user={this.state.user} analyticsEvent={this.analyticsEvent}  fetch={this.fetch} startWaiting={this.startWaiting} stopWaiting={this.stopWaiting}  openLoginWindow={this.openLoginWindow}  />
						
					</div>
				
				}
				
                		
                <Footer/>
                
            </div> 
            </Router>
        ); 
        
    }
  }
}
