/* eslint-disable */ 
/* global gapi */
/* global Paho */
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
import LeaderBoardPage from './LeaderBoardPage';
//import SingleQuestion from './SingleQuestion';
import HelpVideos from './HelpVideos';
import AboutPage from './AboutPage';
import TermsOfUse from './TermsOfUse';
import IntroPage from './IntroPage';
//import ReviewPage from './ReviewPage';
import CreatePage from './CreatePage';
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
import RecentComments from './RecentComments'
import RecentNotes from './RecentNotes'

import CommentEditor from './CommentEditor'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import AdminNewsletterTool from './AdminNewsletterTool'
import AtlasLivingAustraliaSearch from './AtlasLivingAustraliaSearch'
import LifeSearch from './LifeSearch'

import MusicBrainzSearch from './MusicBrainzSearch'
//import AtlasLivingAustraliaSingle from './AtlasLivingAustraliaSingle'

import CommentReplyEditor from './CommentReplyEditor'
import TopicPassword from './TopicPassword';
import FAQ from './FAQ';
import ReactGA from 'react-ga';
//import { BrowserRouter as Router, Route, Link } from "react-router-dom";
//import SignIn from './SignIn';
//import FindQuestions from './FindQuestions';
import FeedMuncher from './FeedMuncher'
import QuickMemo from './QuickMemo'
//import Helmet from 'react-helmet'
//<Helmet
				  //meta={[
					//{"property": "og:type", "content": "video.other"},
					//{"property": "og:image", "content": "https://www.w3schools.com/css/trolltunga.jpg"},
					//{"property": "og:title", "content": "My Title"},
					//{"property": "og:url", "content": "https://www.afnity.com/video/155"},
					//{"property": "og:description", "content": "some discription of the shared    content"}
				  //]}
				///>
import 'whatwg-fetch'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import mnemoQueries from './mnemoQueries'

//import { confirmAlert } from 'react-confirm-alert'; // Import
//import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
    

import Utils from './Utils';
//var config = require('./config')
export default class AppLayout extends Component {

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
      console.log(['REACT___VARS',process.env.REACT_APP_TEST,process.env.REACT_APP_IDENTITY_POOL_ID,process.env.REACT_APP_AUTH_DOMAIN,process.env.REACT_APP_CLIENT_ID,process.env.REACT_APP_CLIENT_SECRET,process.env.REACT_APP_REDIRECT_URL,process.env.REACT_APP_REGION])
    
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
		//this.authUrl = 
		//this.tokenUrl = ''
		
		
        this.setCurrentPage = this.setCurrentPage.bind(this);
        this.setCurrentQuestion = this.setCurrentQuestion.bind(this);
        this.setCurrentQuiz = this.setCurrentQuiz.bind(this);
        //this.setQuiz = this.setQuiz.bind(this);
		this.setComment = this.setComment.bind(this);
		this.loadComments = this.loadComments.bind(this);
		this.loadNotes = this.loadNotes.bind(this);
		this.toggleCommentDialog = this.toggleCommentDialog.bind(this);
		this.editComment = this.editComment.bind(this);
		this.newComment = this.newComment.bind(this);
		this.deleteComment = this.deleteComment.bind(this);
		this.saveComment = this.saveComment.bind(this);
		this.reallyDeleteComment = this.reallyDeleteComment.bind(this);
		this.stopWaiting = this.stopWaiting.bind(this);
		this.startWaiting = this.startWaiting.bind(this);
		
		   
		this.editCommentReply = this.editCommentReply.bind(this);
		this.newCommentReply = this.newCommentReply.bind(this);
		this.cancelCommentReply = this.cancelCommentReply.bind(this);
		this.deleteCommentReply = this.deleteCommentReply.bind(this);
		this.saveCommentReply = this.saveCommentReply.bind(this);
		this.reallyDeleteCommentReply = this.reallyDeleteCommentReply.bind(this);   
		   
		 this.sendAllQuestionsForReview = this.sendAllQuestionsForReview.bind(this)  
        //this.setQuizFromDiscovery = this.setQuizFromDiscovery.bind(this);
        //this.discoverQuestions = this.discoverQuestions.bind(this);
        //this.getQuestionsForReview = this.getQuestionsForReview.bind(this);
        //this.setQuizFromTechnique = this.setQuizFromTechnique.bind(this);
        //this.setQuizFromTopics = this.setQuizFromTopics.bind(this);
        //this.setQuizFromDifficulty = this.setQuizFromDifficulty.bind(this);
        //this.setQuizFromQuestion = this.setQuizFromQuestion.bind(this);
        //this.setQuizFromQuestionId = this.setQuizFromQuestionId.bind(this);
        //this.setQuizFromTopic = this.setQuizFromTopic.bind(this);
        //this.setQuizFromMissingMnemonic = this.setQuizFromMissingMnemonic.bind(this);
        //this.setReviewFromTopic = this.setReviewFromTopic.bind(this);
        //this.discoverQuizFromTopic = this.discoverQuizFromTopic.bind(this);
        //this.setQuizFromTag = this.setQuizFromTag.bind(this);
        //this.reviewBySuccessBand = this.reviewBySuccessBand.bind(this);

        this.updateProgress = this.updateProgress.bind(this);
        
        //this.getCurrentBand = this.getCurrentBand.bind(this);
        //this.setCurrentTopic = this.setCurrentTopic.bind(this);
        //this.getCurrentTopic = this.getCurrentTopic.bind(this);

        this.setTitleFilter = this.setTitleFilter.bind(this)
        

        this.clearTagFilter = this.clearTagFilter.bind(this);
        this.setMessage = this.setMessage.bind(this);

        this.shout=this.shout.bind(this);
        this.startMqtt=this.startMqtt.bind(this);

        this.like = this.like.bind(this);
        this.import = this.import.bind(this);
		this.importMultipleChoice = this.importMultipleChoice.bind(this);
	
        //this.finishQuiz = this.finishQuiz.bind(this);

        this.saveSuggestion = this.saveSuggestion.bind(this);
        // login related
        this.login = this.login.bind(this);
        this.isAdmin = this.isAdmin.bind(this);
        this.refreshLogin = this.refreshLogin.bind(this);
        this.loginByToken = this.loginByToken.bind(this);
        this.loginByRecovery = this.loginByRecovery.bind(this);
        this.loginByConfirm = this.loginByConfirm.bind(this);
        this.logout = this.logout.bind(this);
        this.isLoggedIn = this.isLoggedIn.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.loginByLocalStorage = this.loginByLocalStorage.bind(this);
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
        // listen to messages from child iframe
        //window.addEventListener('message', function(e) {
        //// check message origin
        ////if ( e.origin === 'http://www.dyn-web.com' ) {
            ////console.log(['WINDOW MESSAGE',e]);
            //this.setState({token:e.data['token']} ); // task received in postMessage
        ////}
       
        //});
  };
  
  
  
    componentDidMount() {
      ReactGA.initialize(process.env.REACT_APP_ANALYTICS_KEY);
      this.handleLogin()
      this.fetchTopicCollections(); 
  };
  
  
  componentDidUpdate(props) {
	  if (this.props.comment !== props.comment) {
		  this.setState({editCommentReply:null});
	  }
  }
  

  
	fetch(url,optionsIn) {
		if (url && this.state.token && this.state.token.id_token && this.state.token.id_token.length > 0) {
			let options = optionsIn ? optionsIn : {};
			return fetch(url,Object.assign(options,{headers:{Authorization:this.state.token.id_token}}))
		} else {
			return fetch(url,optionsIn)
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
			console.log('fetch user')
			//console.log(
			if (session) {
			console.log('fetch user session')
			console.log(session)
				var idToken = session.getIdToken() ? session.getIdToken().getJwtToken() : null;
				var accessToken = session.getAccessToken() ? session.getAccessToken().getJwtToken() : null;
				var refreshToken = session.getRefreshToken() ? session.getRefreshToken().getToken() : null;
				//that.setState({})
				console.log('fetch user real')
				console.log(idToken);
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
						console.log('CHECK REDIR IN STATE')
						console.log(state);
						if (state.length > 0 && state !== null && state !== 'null') {
							//window.location = state
							console.log('CHECK REDIR IN STATE YES')
							//that.setState({exitRedirect:state})
						}
						console.log('ME');
						console.log(user);
					})
				})		
			}
		}
		let session = null; 
		
		var auth = new CognitoAuth(authData);
		auth.userhandler = {
			onSuccess: function(result) {
				console.log("Sign in success");
				console.log(result);
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
			console.log(cached);
			if (cached && cached.getIdToken().getJwtToken().length > 0) {
				console.log('usersession from cached')
				fetchUser(cached);
			} else {
				console.log('nouser')
					var cognitoidentity = new AWS.CognitoIdentity();
					var params = {
						IdentityPoolId: this.IdentityPoolId
					};

					// tslint:disable-next-line:no-any
					cognitoidentity.getId(params, function(err: any, data: any) {
						if (err) {
							console.log(err, err.stack); // an error occurred
						} else {

							AWS.config.credentials = new AWS.CognitoIdentityCredentials({
								IdentityPoolId: this.IdentityPoolId,
								IdentityId: data.IdentityId
							});
							console.log('GOTID')
							console.log(data)
							var params = {
							  IdentityId: data.IdentityId,
							};
							cognitoidentity.getCredentialsForIdentity(params, function(err, data) {
							  if (err) console.log(err, err.stack); // an error occurred
							  else     {
									let accessToken = data && data.Credentials ? data.Credentials.SessionToken : null;
									console.log('no user access token')
							
									console.log(accessToken);           // successful response
									that.setState({token:{access_token:accessToken}})
							  }
							});

							// access AWS resources
						}
					});
			}

  }
  
  
	setComment(comment) {
		this.setState({comment:comment});
	}
  
	loadNotes(question,user,limitP,filter) {
		console.log(['notes',question,user,limitP,filter])
		let that=this;
		let query='';
		//let currentQuestion = this.getCurrentQuestion()
		if (question) {
			query='&question='+question
		}
		if (user) {
			query+='&user='+user
		}
		if (filter) {
			query+='&filter='+filter
		}
				
		
		let limit = limitP > 0 ? '?limit='+limitP : '?limit=50'; 
		  this.fetch('/api/notes'+limit+query)
		  .then(function(response) {
			return response.json()
		  }).then(function(json) {
			console.log(['loaded comments', json])
			that.setState({comments:json});
		  }).catch(function(ex) {
			console.log(['error loading comments', ex])
		  })
		
	}
  
    loadComments(question,user,limitP,filter) {
		let that=this;
		let query='';
		//let currentQuestion = this.getCurrentQuestion()
		if (question) {
			query='&question='+question
		}
		if (user) {
			query+='&user='+user
		}
		if (filter) {
			query+='&filter='+filter
		}
				
		
		let limit = limitP > 0 ? '?limit='+limitP : '?limit=50'; 
		  this.fetch('/api/comments'+limit+query)
		  .then(function(response) {
			return response.json()
		  }).then(function(json) {
			console.log(['loaded comments', json])
			that.setState({comments:json});
		  }).catch(function(ex) {
			console.log(['error loading comments', ex])
		  })
		
	}
	
	startWaiting() {
		this.setState({waiting: true})
	}
	stopWaiting() {
		this.setState({waiting: false})
	}
	
	toggleCommentDialog() {
		console.log(['TOGGLE COMMENT',this.state.showCommentDialog])
		//// 
		//if (this.state.showCommentDialog) {
			//this.setState({'editingComment':null})
		//}
		this.setState({showCommentDialog: !this.state.showCommentDialog})
	}
   
	editComment(comment) {
		comment.question = comment.questionComplete;
		this.setState({comment:comment});	//this.setState({commentId:comment._id,commentText:comment.comment,commentType:comment.type,commentCreateDate:comment.createDate})
		//this.toggleCommentDialog()
	}
		
	newComment() {
		//this.setVisible('comments')
		console.log(['NEW COMMENT s'])
		let comment = {_id:null,comment:'',type:'',createDate:new Date(),user:this.state.user ? this.state.user._id : null,userEmail:this.state.user ? this.state.user.username : null,userEmailPreference:this.state.user ? this.state.user.email_me : null,userAvatar:this.state.user ? this.state.user.avatar : null,question:this.getCurrentQuestion()};
		this.setState({comment:comment,editCommentReply:null})
		console.log(['NEW COMMENT',comment,this.state.comment])
	//	this.toggleCommentDialog()
		
	}
	
	reallyDeleteComment(comment) {
		console.log(['really delete COMMENT',comment])
				
		// refresh single view comments list
		let that = this;
		let toSave = {}
		toSave.question = comment.question ? comment.question : null;
		toSave.user = comment.user ? comment.user : null
		toSave.comment = comment ? comment._id : null
		
		if (toSave.question && toSave.user && toSave.comment) {
			console.log(['really really delete COMMENT',toSave])
		
			this.fetch('/api/deletecomment', {
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify(toSave)
			}).then(function() {
				console.log(['NOW RELOAD COMMENTS'])
				that.loadComments(toSave.question,toSave.user)
			});
		}
	} 
  
  
      deleteComment(comment) {

            confirmAlert({
              title: 'Delete Comment',
              message: 'Are you sure you want to delete this comment?',
              buttons: [
                {
                  label: 'Yes',
                  onClick: () => {this.reallyDeleteComment(comment)}
                },
                {
                  label: 'No',
                  onClick: () => {}
                }
              ]
            })
	} 
  
  
  
	saveComment(type,isReply) {
			let that = this;
			this.analyticsEvent('comment - save');
        
			let toSave = this.state.comment;
			if (type && type.type) toSave.type = type.type;
			if (typeof toSave.question === 'object') {
				let question = toSave.question;
				toSave.questionText = question ? question.interrogative + ' ' + question.question : null;
				toSave.questionTopic = question ? question.quiz : null;
				toSave.question = question ? question._id : null;
				toSave.questionComplete = question;
			}
			
			toSave.isReply = isReply;
			// set user if not already set 
			//console.log(['do save ',toSave.user]);
			
			//toSave.user = !toSave.user && this.state.user ? this.state.user._id : null
			//toSave.userAvatar = !toSave.userAvatar && this.state.user ? this.state.user.avatar : null
			console.log(['do save ',toSave]);
						
			if (toSave.question && toSave.user && toSave.comment && toSave.comment.length > 0) {
				//if (!this.props.comment._id) {
				  ////toSave._id= this.props.comment._id;
				  //toSave.createDate = new Date();
				//}
				this.fetch('/api/savecomment', {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json'
				  },
				  
				  body: JSON.stringify(toSave)
				}).then(function() {
					console.log('done save '+toSave);
			
					that.setComment(null);
					that.setState({commentReply:null,commentReplyIndex:null,editCommentReply:false})
					console.log(['NOW RELOAD COMMENTS',that.loadComments])
					that.loadComments(toSave.question,(that.state.user ? that.state.user._id  : null))
				});
			}
      };
  
  // COMMENT REPLY FUNCTIONS  
	editCommentReply(comment,replyIndex) {
		console.log(['EDIT REPLY',comment,replyIndex])
		this.setState({comment:comment,commentReplyIndex:replyIndex,editCommentReply:true});	
	}
		
	newCommentReply(comment) {
		//comment.replies = comment.replies ? comment.replies : [];
		//comment.replies.push({text:'',createDate:new Date(),user:this.state.user ? this.state.user._id : null,userAvatar:this.state.user ? this.state.user.avatar : null})
		this.setState({comment:comment,editCommentReply:true})
	}
	
	cancelCommentReply() {
			this.setState({comment:null,commentReplyIndex:null,editCommentReply:true});
	}
	
	reallyDeleteCommentReply(comment,replyIndex) {
		console.log(['really delete COMMENT reply',comment,replyIndex])
		if (comment && comment.replies && comment.replies.length > replyIndex) {
			comment.replies = comment.replies.splice(replyIndex,1);
			this.setState({comment:comment});
			this.saveComment()
		}
	} 
  
    deleteCommentReply(comment,replyIndex) {
            confirmAlert({
              title: 'Delete Reply',
              message: 'Are you sure you want to delete this reply?',
              buttons: [
                {
                  label: 'Yes',
                  onClick: () => {this.reallyDeleteCommentReply(comment,replyIndex)}
                },
                {
                  label: 'No',
                  onClick: () => {}
                }
              ]
            })
	} 
  
  
  
	saveCommentReply(text) {
		if (text && text.length > 0 && this.state.comment) {
			this.analyticsEvent('comment - reply');
			let comment = this.state.comment;
			// send email
			if (this.state.commentReplyIndex != null && this.state.comment && this.state.comment.replies && this.state.comment.replies.length > this.state.commentReplyIndex) {
				// save edited reply
				comment.replies[this.state.commentReplyIndex].text = text;
			} else {
				// new reply
				comment.replies = comment.replies ? comment.replies : [];
				let reply = {text:text,createDate:new Date(),user:this.state.user ? this.state.user._id : null,userAvatar:this.state.user ? this.state.user.avatar : null}
				comment.replies.push(reply)
			}
			this.setState({comment:comment});
			this.saveComment(null,true)
			
		}
		//let that = this;
		//console.log(['save  COMMENT reply',comment,replyIndex])
		//if (comment && comment.replies && comment.replies.length > replyIndex) {
			//comment.replies = comment.replies.splice(replyIndex,1,);
			//this.setState({comment:comment});
		//}
      };
  
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

  shout(action,params) {
      //console.log('shout');
    try {
       let messageO={'from':this.mqttClientId,action:action,params:params};         
       let message = new Paho.MQTT.Message(JSON.stringify(messageO));
        message.destinationName = "presence";
       this.mqttClient.send(message) 
    } catch (e) {
        //console.log(e);
    }
  };


    startMqtt(user) {
        let that = this;
        if (user && String(user._id).length > 0) {
            // MQTT
            this.mqttClientId=  'nemo_'+user._id; //Math.random().toString(16).substr(2, 8);
            // Create a client instance
            let client =  new Paho.MQTT.Client(config.externalMqtt, Number(9001), this.mqttClientId);
            this.mqttClient=client;
            // set callback handlers
            this.mqttClient.onConnectionLost = onConnectionLost;
            this.mqttClient.onMessageArrived = onMessageArrived;
             
            // connect the client
            this.mqttClient.connect({onSuccess:onConnect,useSSL:true,keepAliveInterval:60,timeout:3000});  //
            
        }
         
        // called when the client connects
        function onConnect() {
          // Once a connection has been made, make a subscription and send a message.
          //console.log("onConnect");
          that.mqttClient.subscribe("users/"+user._id);
        }
            // called when the client loses its connection
        function onConnectionLost(responseObject) {
          if (responseObject && responseObject.errorCode !== 0) {
            //console.log("onConnectionLost:"+responseObject.errorMessage);
          }
        }
         
        // called when a message arrives
        function onMessageArrived(message) {
            //console.log('onmessage');
            try {
                if (message) {
                    let json = {}
                    try {
                       json = JSON.parse(message.payloadString);  
                    } catch (e) {
                         //console.log(['NOTJSON',message.payloadString]);
                    }  
                    //console.log(json);
            
                    if (json && json.from && json.from.length > 0 && json.from !== that.mqttClientId ) {
                        //console.log('onmessage');
                        if (json.action==="page" ) {
                            //if (json.page==="discover") {
                                ////that.setQuizFromDiscovery();
                            //} else if (json.page==="review") {
                               //// that.getQuestionsForReview();
                               //// that.setState({'message':null,'currentPage': json.page,title: Navigation.pageTitles[json.page]});
                            //} else {
                                //that.setCurrentPage(json.params);
                            //}
                            
                        }  else if (json.action==="discover") {
                            // SR disabled alexa follow after move to routing
                        //    that.discoverFromQuestionId(json.question);
                        }  else if (json.action==="review") {
                            // SR disabled alexa follow after move to routing
                            //that.reviewFromQuestionId(json.question);
                        }
                        //console.log(json);
                     } else {
                        //console.log('bad json in message');
            
                     }
                }
            }  catch (e) {
                 //console.log(['onmttmessage error',e]);
            }  

        }

        
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
  

  refreshLogin (token=null) {
     // console.log(['REFRESH LOGIN']);
      //if (!token) {
          //token=this.state.token;
      //}
      //var state={};
      //var that = this;
      //state.user = this.state.user;
      ////state.currentPage = 'home';
      //////console.log('refresh token');
        //////console.log(user);
        //var params={
            //'refresh_token':token.refresh_token,
            //'grant_type':'refresh_token',
            //'client_id':config.clientId,
            //'client_secret':config.clientSecret
          //};
        //fetch('/oauth/token', {
          //method: 'POST',
          //headers: {
            //'Content-Type': 'application/x-www-form-urlencoded',
            ////Authorization: 'Basic '+btoa(config.clientId+":"+config.clientSecret) 
          //},
          //body: Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&')
        //}).then(function(response) {
            //return response.json();
            
        //}).then(function(res) {
            ////console.log(['REFRESH LOGIN response',res]);
            //state.token = res;
          ////  //console.log(['refreshed token',res]);
////            that.setState(state);
  ////          localStorage.setItem('token',JSON.stringify(res));
            //fetch('/login/me?code='+state.token.access_token, {
              //method: 'GET',
            //}).then(function(response) {
                //return response.json();
                
            //}).then(function(res) {
             ////  console.log(['REFRESH LOGIN me',res]);
                //state.user = res.user;
                //state.token = res.token;
                //localStorage.setItem('token',JSON.stringify(res.token));
                //localStorage.setItem('user',JSON.stringify(res.user));
                //that.setState(state);
                //that.startMqtt(res.user)
                ////setInterval(function() {
              //////      //console.log('toke ref tok');
                    ////that.refreshLogin(state.user)
                ////},(parseInt(that.state.token.expires_in,10)-1)*1000);
            //})
            //.catch(function(err) {
                ////console.log(['ERR',err]);
            //});
        //})
        //.catch(function(err) {
            ////console.log(['ERR',err]);
        //});

  }

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
    
  login (user) {
     //// console.log(['LOGIN',user]);
      //if (user) {
          //var state={};
          //var that = this;
          ////state.user = user;
          //localStorage.setItem('currentTopic',null)
          ////state.currentPage = 'home';
          //////console.log('login at root');
            //////console.log(user);
            //var params={
                //username: user.email ? user.email : user.username,
                //password: user.password,
                //'grant_type':'password',
                //'client_id':config.clientId,
                //'client_secret':config.clientSecret
              //};
            //fetch('/oauth/token', {
              //method: 'POST',
              //headers: {
                //'Content-Type': 'application/x-www-form-urlencoded',
                ////Authorization: 'Basic '+btoa(config.clientId+":"+config.clientSecret) 
              //},
              //body: Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&')
            //}).then(function(response) {
                //return response.json();
                
            //}).then(function(res) {
               //// //console.log(['ddtoken response',res]);
                //state.token = res;
                //localStorage.setItem('token',JSON.stringify(res));
                //fetch("/login/me?code="+state.token.access_token).then(function(userFull) {
                   //// console.log(['LOADED ME',userFull]);
                    //localStorage.setItem('user',JSON.stringify(userFull));
                    //that.startMqtt(userFull);
                    //state.user = userFull;
                    //that.setState(state);
                    ////that.updateProgress(json);
                //});
                
                //// load progress
                ////fetch('/api/progress')
                  ////.then(function(response) {
                //////    //console.log(['got response', response])
                    ////return response.json()
                  ////}).then(function(json) {
                  //////  //console.log(['set progress', json])
                    ////that.setState(state);
                    ////that.updateProgress(json);

                  ////}).catch(function(ex) {
                    //////console.log(['parsing failed', ex])
                  ////})
                    //setInterval(function() {
                       //// //console.log('toke ref');
                        //that.refreshLogin(state.token)
                    //},(parseInt(this.state.token.expires_in,10)-1)*1000);
            //})
            //.catch(function(err) {
                ////console.log(['ERR',err]);
            //});
        //}
  }
  
  loginByLocalStorage() {
      //return ;
      //////console.log(['loginByLocalStorage1',localStorage.getItem('token'),JSON.parse(localStorage.getItem('token'))]);
      //if (localStorage.getItem('token') && localStorage.getItem('token').length > 0 && localStorage.getItem('user') && localStorage.getItem('user').length > 0) {
          ////this.setState({user:JSON.parse(localStorage.getItem('user')),token:JSON.parse(localStorage.getItem('token'))});
          //this.login(JSON.parse(localStorage.getItem('user')));
      //}
  };
  
  loginByToken(token) {
      //console.log(['LOGIN by token',token]);
      //let state = {token: token};
      //let that = this;
      //localStorage.setItem('currentTopic',null)
      //return new Promise(function(resolve,reject) {
		//fetch('/login/me?code='+token, {
          //method: 'GET',
        //}).then(function(response) {
            //return response.json();
            
        //}).then(function(res) {
          ////  console.log(['LOGIN TOKEN',res,res.user,res.token]);
            //state.user = res.user;
            //state.token = res.token;
            //localStorage.setItem('token',JSON.stringify(res.token));
            //localStorage.setItem('user',JSON.stringify(res.user));
            //that.setState(state);
            
            //that.startMqtt(state.user)
            //setInterval(function() {
          ////      //console.log('toke ref tok');
                //that.refreshLogin(state.user)
            //},(parseInt(that.state.token.expires_in,10)-1)*1000);
			//resolve()
        //})
        //.catch(function(err) {
            //console.log(['ERR',err]);
			//reject()
        //});
      //})
  };
  
    loginByConfirm(token) {
      //  console.log(['LOGIN confirm',token]);
      //let state = {token: token};
      //let that = this;
      //return new Promise(function(resolve,reject) {
		  //localStorage.setItem('currentTopic',null)
		  //fetch('/login/doconfirm?code='+token, {
			  //method: 'GET',
			//}).then(function(response) {
				//return response.json();
				
			//}).then(function(res) {
			////    //console.log(['ddtoken response',res]);
				//state.user = res.user;
				//state.token = res.token;
				//localStorage.setItem('token',JSON.stringify(res.token));
				//localStorage.setItem('user',JSON.stringify(res.user));
				//that.setState(state);
				//that.startMqtt(state.user)
				//setInterval(function() {
				////    //console.log('toke ref tok');
					//that.refreshLogin(state.user)
				//},(parseInt(this.state.token.expires_in,10)-1)*1000);
				//resolve()
			//})
			//.catch(function(err) {
				//reject()
				////console.log(['ERR',err]);
			//});
		//})
  };
  
    loginByRecovery(token) {
       // console.log(['LOGIN by recovery',token]);
      //let state = {token: token};
      //let that = this;
      //return new Promise(function(resolve,reject) {
		//fetch('/login/dorecover?code='+token, {
          //method: 'GET',
        //}).then(function(response) {
            //return response.json();
            
        //}).then(function(res) {
        ////    //console.log(['ddtoken response',res]);
            //state.user = res.user;
            //state.token = res.token;
            //localStorage.setItem('token',JSON.stringify(res.token));
            //localStorage.setItem('user',JSON.stringify(res.user));
            //that.setState(state);
            //that.startMqtt(state.user)
            //setInterval(function() {
              ////  //console.log('toke ref tok');
                //that.refreshLogin(state.user)
            //},(parseInt(this.state.token.expires_in,10)-1)*1000);
			//resolve()
        //})
        //.catch(function(err) {
            //reject()
            ////console.log(['ERR',err]);
        //});
       //})
  };
  
  logout() {
	  console.log('LOGOUT')
      var state={};
      state.user = '';
      state.token = '';
      this.analyticsEvent('logout')
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
   
   
   saveQuestion(data) {
       //console.log(['save quesgtions',data]);
   } 
  
  analyticsEvent(page,category='Navigation') {
     // //console.log(['ANALYTICS CURRENTPAGE',page]);
      ReactGA.event({
          category: category,
          action:  page
        });
      
  };
  
  setCurrentPage(page) {
	  //this.analyticsEvent(page);
      //if (page==="review") {
          //this.getQuestionsForReview();
      //} 
      ////else if (page==="discover") {
         ////this.setQuizFromDiscovery();
         ////page='home'
      ////}
      //this.setState({'message':null,'currentPage': page,title: Navigation.pageTitles[page]});
     // if (this.props.history) this.props.history.push("/"+page);
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
      this.fetch('/api/import', {
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
      this.fetch('/api/importmultiplechoicequestions', {
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

  //// SET QUIZ
  //setQuiz(title,questionIds) {
      //let newIds = [];
      //let that = this;
     //// //console.log(questionIds);
      //questionIds.forEach(function(questionId) {
       ////   //console.log(questionId,questionIds[questionId]);
        ////  //console.log(that.state.users.default.questions.block);
          //if (!that.state.users.default.questions.block.hasOwnProperty(questionId)) newIds.push(questionId);
      //});
      //////console.log({'currentPage':'home','currentQuiz':newIds,'title': Utils.snakeToCamel(title)});
      //this.analyticsEvent('discover')
      //this.setState({'currentPage':'home','currentQuiz':newIds,'title': Utils.snakeToCamel(title)});
  //};

  
  
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
			console.log(['SEND Q R',ids,questions])
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
				console.log('done add all to review')
				that.setMessage('Added '+ids.length+' question'+(ids.length > 1 ? 's' : '') +' to your review list')
				//confirmAlert({
				  //title: 'Questions Added For Review',
				  //message: 'Added '+ids.length+' question'+(ids.length > 1 ? 's' : '') +' to your review list',
				  //buttons: [
					//{
					  //label: 'OK',
					  //onClick: () => {}
					//}
				  //]
				//})
				
				
			})
		}
	}
 
     
    allowAlexa(allow) {
        if (allow) {
            //console.log('allow');
            // redirect with auth code
           // this.getCode();
            
        } else {
            //console.log('deny');
        }
        localStorage.setItem('oauth',null);
        localStorage.setItem('oauth_request',null);
        return true;
    }
    
    
    
    //getCode() {
        ////console.log('get code');
        //let authRequest = localStorage.getItem('oauth_request');
        ////console.log([authRequest,this.props.token,this.props.user]);
        //if (this.props.token && this.props.user && authRequest) {
            //let auth =JSON.parse(authRequest);
            //if (!auth) auth={};
            //var params={
                //'response_type':'code',
                //'client_id':config.clientId,
                //'client_secret':config.clientSecret,
                //'redirect_uri':auth.redirect_uri,
                //'scope':auth.scope,
                //'state':auth.state
              //};
              ////console.log(['pars',params]);
            //fetch('/oauth/authorize', {
              //method: 'POST',
              //headers: {
                //'Content-Type': 'application/x-www-form-urlencoded',
                //'Authorization': 'Bearer '+this.props.token.access_token
                ////Authorization: 'Basic '+btoa(config.clientId+":"+config.clientSecret) 
              //},
              //body: Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&')
            //}).then(function(response) {
                ////console.log('HEADERS',response.headers.location);
                
                //return response.json();
                
            //}).then(function(res) {
                ////console.log(['getcode response',res]);
              
            //})
            //.catch(function(err) {
                ////console.log(['ERR',err]);
            //});
        //}
  //}
    
    
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
    let authRequest = localStorage.getItem('oauth_request');
    let auth =JSON.parse(authRequest);
        
    if (this.state.user && this.state.user._id && this.state.user._id.length > 0 && oauth==="alexa" && authRequest && authRequest.length > 0) {
        //console.log([authRequest,this.props.token,this.props.user]);
        if (!auth) auth={};
console.log(auth,this.state.user)
        return (    
            <div className='row'>
				<div className="navbar-dark fixed-top bg-dark" >
				
					<nav className="navbar navbar-expand-md" >
						<div className="navbar-brand" >
							<a  to="/" onClick={this.goHome}><img alt="Mnemos' Library" src="/mnemoicon-100.png"  data-toggle="collapse" data-target="#navbarCollapse" style={{float:'left',clear:'right' ,height:'4em'}}  /></a>
						</div>
					</nav>
				</div>
			
        
            <div className='col-12'><h4>Allow Alexa to integrate with Mnemo's Library ?</h4></div>
            
            <div className='col-4'>&nbsp;</div>
            <div className='col-2'><form action={config.authorizeUrl} method="POST">
            <input type='hidden' name='response_type'  value='code' />
            <input type='hidden' name='client_id'  value={config.clientId}/>
            <input type='hidden' name='client_secret'  value={config.clientSecret}/>
            <input type='hidden' name='redirect_uri'  value={auth.redirect_uri} />
            <input type='hidden' name='scope'  value={auth.scope}/>
            <input type='hidden' name='state'  value={auth.state}/>
            <input type='hidden' name='access_token'  value={this.state.token ? this.state.token.access_token : null}/>
            <button type='submit' className='btn btn-info' onClick={() => this.allowAlexa.bind(this)(false)} >Yes</button>
            </form></div>
            <div className='col-2'><a className='btn btn-info' href='/' onClick={() => this.allowAlexa.bind(this)(false)} >No</a></div>
            <div className='col-4'>&nbsp;</div>
            </div>
            
            );
    } else if (this.state.exitRedirect && this.state.exitRedirect.length > 0) {
		return <Router><Redirect to={this.state.exitRedirect} /></Router>
    } else if (this.isCurrentPage('disabled')) {
        return (<div>DISABLED!!</div>);
    } else {
        //let oauth=localStorage.getItem('oauth');
        let authRequest = localStorage.getItem('oauth_request');
        //console.log([authRequest,this.props.token,this.props.user]);
        let auth =JSON.parse(authRequest);
        if (!auth) auth={};
    
        let searchPage = <div><TopicsPage topicCollections={this.state.topicCollections} topics={topics}  topicTags={this.state.topicTags} tagFilter={this.state.tagFilter}  clearTagFilter={this.clearTagFilter} setQuizFromTopic={this.setQuizFromTopic} setQuiz={this.setQuizFromTopic} questionsMissingMnemonics={this.state.questionsMissingMnemonics} setQuizFromMissingMnemonic={this.setQuizFromMissingMnemonic} setCurrentPage={this.setCurrentPage} isLoggedIn={this.isLoggedIn} setQuizFromDiscovery={this.setQuizFromDiscovery} setQuizFromDifficulty={this.setQuizFromDifficulty} setQuizFromTopics={this.setQuizFromTopics}  setQuizFromQuestionId={this.setQuizFromQuestionId} title={title} user={this.state.user} showCollection={this.showCollection} hideCollection={this.hideCollection} collectionVisible={this.collectionVisible} collection={this.state.collection} analyticsEvent={this.analyticsEvent} fetch={this.fetch} token={this.state.token} /></div>
        
        let topicsPageOptions={ analyticsEvent:this.analyticsEvent, titleFilter:this.state.titleFilter,setTitleFilter:this.setTitleFilter,topicCollections:this.state.topicCollections,topics:topics,topicTags:this.state.topicTags,tagFilter:this.state.tagFilter,clearTagFilter:this.clearTagFilter,setQuizFromTopic:this.setQuizFromTopic,setQuiz:this.setQuizFromTopic,questionsMissingMnemonics:this.state.questionsMissingMnemonics,setQuizFromMissingMnemonic:this.setQuizFromMissingMnemonic,setCurrentPage:this.setCurrentPage,isLoggedIn:this.isLoggedIn,setQuizFromDiscovery:this.setQuizFromDiscovery,setQuizFromDifficulty:this.setQuizFromDifficulty,setQuizFromTopics:this.setQuizFromTopics,setQuizFromQuestionId:this.setQuizFromQuestionId,title:title,user:this.state.user,showCollection:this.showCollection,hideCollection:this.hideCollection,collectionVisible:this.collectionVisible,collection:this.state.collection,setQuizFromQuestionId:this.setQuizFromQuestionId ,newCommentReply:this.newCommentReply, fetch:this.fetch, token:this.state.token ,openLoginWindow: this.openLoginWindow}
        
        let profilePageOptions = {analyticsEvent:this.analyticsEvent,  token:this.state.token,setCurrentPage:this.setCurrentPage,setQuizFromDiscovery:this.setQuizFromDiscovery,reviewBySuccessBand:this.reviewBySuccessBand,setReviewFromTopic:this.setReviewFromTopic,setQuizFromTopic:this.discoverQuizFromTopic,searchQuizFromTopic:this.setQuizFromTopic, isAdmin:this.isAdmin,saveUser:this.saveUser,user:this.state.user,token:this.state.token,logout:this.logout,import:this.import,importMultipleChoice:this.importMultipleChoice,isLoggedIn:this.isLoggedIn, fetch:this.fetch, token:this.state.token,openLoginWindow: this.openLoginWindow}
        
        let reviewPageOptions = { analyticsEvent:this.analyticsEvent, isAdmin:this.isAdmin,saveSuggestion:this.saveSuggestion,setCurrentQuestion:this.setCurrentQuestion,setCurrentPage:this.setCurrentPage,setCurrentQuiz:this.setCurrentQuiz,setQuizFromTechnique:this.setQuizFromTechnique,setQuizFromDiscovery:this.setQuizFromDiscovery,setQuizFromTopic:this.setQuizFromTopic,setReviewFromTopic:this.setReviewFromTopic,discoverQuizFromTopic:this.discoverQuizFromTopic,setQuizFromTag:this.setQuizFromTag,blocks:this.state.discoveryBlocks,discoverQuestions:this.discoverQuestions,getQuestionsForReview:this.getQuestionsForReview,mnemonic_techniques:this.state.mnemonic_techniques,questions:this.state.questions,currentQuiz:this.state.currentQuiz,currentQuestion:this.state.currentQuestion,indexedQuestions:this.state.indexedQuestions,topicTags:this.state.topicTags,updateProgress:this.updateProgress,finishQuiz:this.finishReview,isReview:true,setMessage:this.setMessage,like:this.like,user:this.state.user,progress:progress,getCurrentTopic:this.getCurrentTopic,isLoggedIn:this.isLoggedIn,getCurrentBand:this.getCurrentBand,reviewBySuccessBand:this.reviewBySuccessBand,setQuizFromDifficulty:this.setQuizFromDifficulty,editComment:this.editComment,deleteComment:this.deleteComment,newComment:this.newComment,toggleCommentDialog:this.toggleCommentDialog,comments:this.state.comments,setComment:this.setComment,comment:this.state.comment,saveComment:this.saveComment,loadComments:this.loadComments,newCommentReply:this.newCommentReply,sendAllQuestionsForReview:this.sendAllQuestionsForReview,comment:this.state.comment, fetch:this.fetch, token:this.state.token,openLoginWindow: this.openLoginWindow}
        
        
        
        let discoverPageOptions ={ analyticsEvent:this.analyticsEvent, isAdmin:this.isAdmin,saveSuggestion:this.saveSuggestion,setCurrentQuestion:this.setCurrentQuestion,setCurrentPage:this.setCurrentPage,setCurrentQuiz:this.setCurrentQuiz,setQuizFromTechnique:this.setQuizFromTechnique,setQuizFromDiscovery:this.setQuizFromDiscovery,setQuizFromTopic:this.setQuizFromTopic,setReviewFromTopic:this.setReviewFromTopic,discoverQuizFromTopic:this.discoverQuizFromTopic,setQuizFromTag:this.setQuizFromTag,discoverQuestions:this.discoverQuestions,getQuestionsForReview:this.getQuestionsForReview,mnemonic_techniques:this.state.mnemonic_techniques,questions:this.state.questions,currentQuiz:this.state.currentQuiz,currentQuestion:this.state.currentQuestion,indexedQuestions:this.state.indexedQuestions,topicTags:this.state.topicTags,updateProgress:this.updateProgress,setMessage:this.setMessage,like:this.like,user:this.state.user,progress:progress,getCurrentTopic:this.getCurrentTopic,isLoggedIn:this.isLoggedIn,getCurrentBand:this.getCurrentBand,reviewBySuccessBand:this.reviewBySuccessBand,setQuizFromDifficulty:this.setQuizFromDifficulty,setQuizFromTopics:this.setQuizFromTopics,setQuizFromTechnique:this.setQuizFromTechnique,setQuizFromQuestionId:this.setQuizFromQuestionId ,setQuizFromMissingMnemonic:this.setQuizFromMissingMnemonic ,editComment:this.editComment,deleteComment:this.deleteComment,newComment:this.newComment,toggleCommentDialog:this.toggleCommentDialog,comments:this.state.comments,setComment:this.setComment,comment:this.state.comment,saveComment:this.saveComment,loadComments:this.loadComments,newCommentReply:this.newCommentReply,sendAllQuestionsForReview:this.sendAllQuestionsForReview,comment:this.state.comment, fetch:this.fetch, token:this.state.token}
        
         
        
         
         //commentText={this.state.comment.comment} commentType={this.state.comment.type} commentCreateDate={this.state.comment.createDate} question={this.state.comment.question}   user={this.state.user} visible={this.state.showCommentDialog}  loadComments={this.loadComments} toggleVisible={this.toggleCommentDialog}
        return (
        <Router>
			
        
        
			<div style={{width:'100%'}} className="mnemo">
				{(this.state.waiting) && <div onClick={this.stopWaiting} style ={{position: 'fixed', top: 0, left: 0, width:'100%',height:'100%',backgroundColor:'grey',zIndex:9999999,opacity:0.3}}  ><img style={{height:'7em' }} src='/loading.gif' /></div>}
				
				{this.state.message && <b style={{zIndex:99999999,position:'fixed',top:'7em',left:'50%',backgroundColor:'pink',border:'1px solid black',color:'black',padding:'0.8em'}}>{this.state.message}</b>}
				
				{false && this.state.message && <div className='page-message' ><b>{this.state.message}</b></div>}
				<PropsRoute  path="/" component={Navigation}  setCurrentTopic={this.setCurrentTopic} shout={this.shout} user={this.state.user} isLoggedIn={this.isLoggedIn} setCurrentPage={this.setCurrentPage} login={this.login} setQuizFromDiscovery={this.setQuizFromDiscovery} title={this.state.title} hideCollection={this.hideCollection} newCommentReply={this.newCommentReply} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  openLoginWindow={this.openLoginWindow} />
                
                <PropsRoute  exact={true} path="/sitemap" component={SiteMap} isAdmin={this.isAdmin} isLoggedIn={this.isLoggedIn} logout={this.logout} import={this.import} importMultipleChoice={this.importMultipleChoice} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  openLoginWindow={this.openLoginWindow} /> 
             
			
			
			    <PropsRoute exact={true} path='/recentcomments/:comment'  component={RecentComments} loadComments={this.loadComments} editComment={this.editComment} deleteComment={this.deleteComment} newComment={this.newComment} comments={this.state.comments} isAdmin={this.isAdmin} newCommentReply={this.newCommentReply}  editComment={this.editComment}  deleteComment={this.deleteComment} user={this.state.user} analyticsEvent={this.analyticsEvent} fetch={this.fetch} />
                
                <PropsRoute exact={true} path='/recentcomments'  component={RecentComments} loadComments={this.loadComments} editComment={this.editComment} deleteComment={this.deleteComment} newComment={this.newComment} comments={this.state.comments} isAdmin={this.isAdmin} newCommentReply={this.newCommentReply}  editComment={this.editComment}  deleteComment={this.deleteComment} user={this.state.user}  	analyticsEvent={this.analyticsEvent} fetch={this.fetch} />
                
                
                <PropsRoute  exact={true} path="/help" component={AboutPage} analyticsEvent={this.analyticsEvent}  />
                <PropsRoute  path="/help/about" component={AboutPage} analyticsEvent={this.analyticsEvent} />
                <PropsRoute  path="/help/intro" component={IntroPage} analyticsEvent={this.analyticsEvent}/>
                <PropsRoute  path="/help/termsofuse" component={TermsOfUse} analyticsEvent={this.analyticsEvent}/>
                <PropsRoute  path="/help/faq" component={FAQ} analyticsEvent={this.analyticsEvent}/>
                <PropsRoute  path="/help/create" isLoggedIn={this.isLoggedIn} component={CreateHelp} analyticsEvent={this.analyticsEvent} token={this.state.token}  user={this.state.user}  openLoginWindow={this.openLoginWindow} />
                <PropsRoute  path="/help/videos" component={HelpVideos} analyticsEvent={this.analyticsEvent} />
                
                
                <PropsRoute exact={true} path='/multiplechoicetopics/:topicCollection'  topicCollections={this.state.topicCollections} user={this.state.user} component={MultipleChoiceTopics} user={this.state.user} newCommentReply={this.newCommentReply} fetch={this.fetch}  />
                <PropsRoute exact={true} path='/multiplechoicetopics'  user={this.state.user} topicCollections={this.state.topicCollections} user={this.state.user} component={MultipleChoiceTopics}   newCommentReply={this.newCommentReply} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />
                
                <PropsRoute exact={true} path='/multiplechoicequestions/:topic'   user={this.state.user} isAdmin={this.isAdmin} component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch} />

                <PropsRoute exact={true} path='/mymultiplechoicequestions' mode="myquestions"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch} />

                <PropsRoute exact={true} path='/mymultiplechoicequestions/:topic' mode="myquestions"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />

                <PropsRoute exact={true} path='/mymultiplechoicetopics' mode="mytopics"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />

                <PropsRoute exact={true} path='/mymultiplechoicetopics/:topic' mode="mytopics"  user={this.state.user}  isAdmin={this.isAdmin}  component={MultipleChoiceQuestions} sendAllQuestionsForReview={this.sendAllQuestionsForReview} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />
                
                
                
                <PropsRoute  exact={true} path="/search" component={TopicsPage} {...topicsPageOptions} analyticsEvent={this.analyticsEvent}  />
                <PropsRoute  exact={true} path="/" component={TopicsPage} {...topicsPageOptions} analyticsEvent={this.analyticsEvent} />
                
                <PropsRoute  path="/search/tags" analyticsEvent={this.analyticsEvent} component={TagsPage}   titleFilter={this.state.titleFilter} setTitleFilter={this.setTitleFilter}  setCurrentPage={this.setCurrentPage} tags={tags} relatedTags={this.state.relatedTags} setQuiz={this.setQuizFromTag} analyticsEvent={this.analyticsEvent}  fetch={this.fetch}  />
                
                <PropsRoute  path="/search/questions" analyticsEvent={this.analyticsEvent} component={SearchPage}  titleFilter={this.state.titleFilter} setTitleFilter={this.setTitleFilter} mnemonic_techniques={this.state.mnemonic_techniques} setCurrentPage={this.setCurrentPage} questions={this.state.questions} setQuiz={this.setQuizFromQuestion} analyticsEvent={this.analyticsEvent}  fetch={this.fetch}  />
                
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
                 
                 <PropsRoute  exact={true} path="/access/search/:topic"  mode='searchtopic' component={TopicPassword}  user={this.state.user} saveUser={this.saveUser} analyticsEvent={this.analyticsEvent} fetch={this.fetch}   />
                 <PropsRoute  path="/access/search/:topic/:topicquestion"  mode='searchtopic' component={TopicPassword} user={this.state.user} saveUser={this.saveUser} analyticsEvent={this.analyticsEvent} fetch={this.fetch}   />
                 
                 <PropsRoute  exact={true} path="/access/discover/:topic"  mode='topic'  component={TopicPassword}  user={this.state.user} saveUser={this.saveUser} analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />
                 <PropsRoute  path="/access/discover/:topic/:topicquestion" mode='topic' component={TopicPassword} user={this.state.user} saveUser={this.saveUser} analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />
                
                 
                 
                 <PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} path='/ala'  component={AtlasLivingAustraliaSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} path='/ala/:searchFor'  component={AtlasLivingAustraliaSearch}  fetch={this.fetch} />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user}  path='/ala/:searchFor/mode/:searchMode'  component={AtlasLivingAustraliaSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user}   path='/ala/mode/:searchMode'  component={AtlasLivingAustraliaSearch} fetch={this.fetch}  />
						
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/ala/search/:searchFor'  component={AtlasLivingAustraliaSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/ala/search/:searchFor/mode/:searchMode'  component={AtlasLivingAustraliaSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/ala/search/:searchFor/:index'  component={AtlasLivingAustraliaSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/ala/search/:searchFor/mode/:searchMode/:index'  component={AtlasLivingAustraliaSearch}  />
						
						
						
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} path='/life'  component={LifeSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} path='/life/:searchFor'  component={LifeSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user}  path='/life/:searchFor/mode/:searchMode'  component={LifeSearch} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user}   path='/life/mode/:searchMode'  component={LifeSearch} fetch={this.fetch}  />
						
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/life/search/:searchFor'  component={LifeSearch}  fetch={this.fetch} />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/life/search/:searchFor/mode/:searchMode'  component={LifeSearch} fetch={this.fetch}   />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/life/search/:searchFor/:index'  component={LifeSearch}  fetch={this.fetch} />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/life/search/:searchFor/mode/:searchMode/:index'  component={LifeSearch} fetch={this.fetch}  />
						
						
						
						<div><PropsRoute exact={true} routerBaseUrl="/musicbrainz" analyticsEvent={this.analyticsEvent} user={this.state.user} path='/musicbrainz'  component={MusicBrainzSearch}  fetch={this.fetch} />
						<PropsRoute exact={true} routerBaseUrl="/musicbrainz"  analyticsEvent={this.analyticsEvent} user={this.state.user} path='/musicbrainz/:searchFor'  component={MusicBrainzSearch}  fetch={this.fetch} />
						<PropsRoute exact={true} routerBaseUrl="/musicbrainz"  analyticsEvent={this.analyticsEvent} user={this.state.user}  path='/musicbrainz/:searchFor/mode/:searchMode'  component={MusicBrainzSearch} fetch={this.fetch}  />
						<PropsRoute exact={true}  routerBaseUrl="/musicbrainz" analyticsEvent={this.analyticsEvent} user={this.state.user}   path='/musicbrainz/mode/:searchMode'  component={MusicBrainzSearch} fetch={this.fetch}  />
						
						<PropsRoute exact={true}  routerBaseUrl="/musicbrainz" analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/musicbrainz/search/:searchFor'  component={MusicBrainzSearch}  fetch={this.fetch} />
						<PropsRoute exact={true}  routerBaseUrl="/musicbrainz" analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/musicbrainz/search/:searchFor/mode/:searchMode'  component={MusicBrainzSearch}  fetch={this.fetch} />
						<PropsRoute exact={true}  routerBaseUrl="/musicbrainz" analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/musicbrainz/search/:searchFor/:index'  component={MusicBrainzSearch}  fetch={this.fetch} />
						<PropsRoute exact={true}  routerBaseUrl="/musicbrainz" analyticsEvent={this.analyticsEvent} user={this.state.user} rawSearch={true} path='/musicbrainz/search/:searchFor/mode/:searchMode/:index'  component={MusicBrainzSearch} fetch={this.fetch}  />
						</div>
                 
                 
                 
                {<div>
					
					
					<PropsRoute exact={true} path='/recentnotes'  component={RecentNotes} loadNotes={this.loadNotes} editComment={this.editComment} deleteComment={this.deleteComment} newComment={this.newComment} comments={this.state.comments} isAdmin={this.isAdmin} newCommentReply={this.newCommentReply}  editComment={this.editComment}  deleteComment={this.deleteComment} user={this.state.user} token={this.state.token} openLoginWindow={this.openLoginWindow}	analyticsEvent={this.analyticsEvent} fetch={this.fetch} />
                
                
					
					 {this.state.comment && !this.state.editCommentReply && <CommentEditor comment={this.state.comment} setComment={this.setComment} user={this.state.user}  token={this.state.token} openLoginWindow={this.openLoginWindow} saveComment={this.saveComment}  getCurrentQuestion={this.getCurrentQuestion} 	analyticsEvent={this.analyticsEvent} fetch={this.fetch}  />}

					 {this.state.comment && this.state.editCommentReply && <CommentReplyEditor  comment={this.state.comment} commentReplyIndex={this.state.commentReplyIndex} commentReply={this.state.commentReply} cancelCommentReply={this.cancelCommentReply}  saveCommentReply={this.saveCommentReply} getCurrentQuestion={this.getCurrentQuestion} user={this.state.user} token={this.state.token} openLoginWindow={this.openLoginWindow} 	analyticsEvent={this.analyticsEvent}  fetch={this.fetch} />}
					
					<PropsRoute  path="/create" analyticsEvent={this.analyticsEvent} component={CreatePage} fetchTopicCollections={this.fetchTopicCollections} user={this.state.user}  token={this.state.token} openLoginWindow={this.openLoginWindow} isAdmin={this.isAdmin}  mnemonic_techniques={this.state.mnemonic_techniques} saveQuestion={this.saveQuestion} setQuizFromTopic={this.setQuizFromTopic} setCurrentPage={this.setCurrentPage} analyticsEvent={this.analyticsEvent}  fetch={this.fetch} startWaiting={this.startWaiting}  stopWaiting={this.stopWaiting}   />
					
					 

						<PropsRoute  path="/profile" component={ProfilePage} {...profilePageOptions} analyticsEvent={this.analyticsEvent}  token={this.state.token} openLoginWindow={this.openLoginWindow} />
						 <br/>
					   
						 <PropsRoute  path="/newslettertool"  exact={true} component={AdminNewsletterTool} isAdmin={this.isAdmin} user={this.state.user} analyticsEvent={this.analyticsEvent}  token={this.state.token}  user={this.state.user} fetch={this.fetch}  openLoginWindow={this.openLoginWindow} />
						<PropsRoute  path="/newslettertool/:id" exact={true}   component={AdminNewsletterTool} isAdmin={this.isAdmin} user={this.state.user} analyticsEvent={this.analyticsEvent}  token={this.state.token}  user={this.state.user} fetch={this.fetch}  openLoginWindow={this.openLoginWindow} />
						
						<PropsRoute  path="/settings"  component={SettingsPage} saveUser={this.saveUser} token={this.state.token} user={this.state.user} analyticsEvent={this.analyticsEvent}  fetch={this.fetch} startWaiting={this.startWaiting} stopWaiting={this.stopWaiting}  openLoginWindow={this.openLoginWindow}  token={this.state.token}  user={this.state.user}  openLoginWindow={this.openLoginWindow} />
						<PropsRoute  path="/leaderboard"  component={LeaderBoardPage}  user={this.state.user} analyticsEvent={this.analyticsEvent}  fetch={this.fetch}  token={this.state.token}  user={this.state.user}  openLoginWindow={this.openLoginWindow} />
						
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} path='/feedmuncher' startWaiting={this.startWaiting} stopWaiting={this.stopWaiting}  component={FeedMuncher} fetch={this.fetch}  />
						<PropsRoute exact={true} analyticsEvent={this.analyticsEvent} user={this.state.user} path='/quickmemo'  component={QuickMemo} fetch={this.fetch}   token={this.state.token}  user={this.state.user}  openLoginWindow={this.openLoginWindow} />
						
						
						
					</div>
				
				}
				
                
                <Footer/>
                
            </div>
            </Router>
        );
        
    }
  }
}
//{!this.isLoggedIn() && <div>
						//<PropsRoute  path="/profile" component={LoginPage} loginUrl={this.loginUrl+"&state=/profile"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/newslettertool" component={LoginPage} loginUrl={this.loginUrl+"&state=/newslettertool"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/settings" component={LoginPage} loginUrl={this.loginUrl+"&state=/settings"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/leaderboard" component={LoginPage} loginUrl={this.loginUrl+"&state=/leaderboard"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/feedmuncher" component={LoginPage} loginUrl={this.loginUrl+"&state=/feedmuncher"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/quickmemo" component={LoginPage} loginUrl={this.loginUrl+"&state=/quickmemo"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/ala" component={LoginPage} loginUrl={this.loginUrl+"&state=/ala"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/musicbrainz" component={LoginPage} loginUrl={this.loginUrl+"&state=/musicbrainz"} analyticsEvent={this.analyticsEvent}/>
						//<PropsRoute  path="/life" component={LoginPage} loginUrl={this.loginUrl+"&state=/life"} analyticsEvent={this.analyticsEvent}/>
					//</div>
				//}
