/* eslint-disable */ 
import React, { Component } from 'react';

//import FindQuestions from './FindQuestions';
import QuizCarousel from './QuizCarousel';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import ModalDialog from './ModalDialog'

export default class ReviewPage extends Component {

    constructor(props) {
        super(props);
        this.state={modalDialog:  null};
        //this.state = {
            //questions : this.props.questions,
            //indexedQuestions : this.props.indexedQuestions,
            //currentQuiz : this.props.currentQuiz
        //}
        this.finishReview = this.finishReview.bind(this);
        this.getQuestionsForReview = this.getQuestionsForReview.bind(this);
        this.reviewQuestions = this.reviewQuestions.bind(this);
        this.discoverQuestions = this.discoverQuestions.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this)
    };

    componentDidMount() {
		//this.props.analyticsEvent('start review');
        let that = this;
     //   console.log(['REVIEW PAGE DID MOUNT',this.props.match]); 
        //setTimeout(function() {
           this.reviewQuestions();
        //},1000);
      // this.getQuestionsForReview();
    }
    
    componentDidUpdate(props) {
		if (props.token !== this.props.token && this.props.token) {
			this.reviewQuestions()
		}
	}
        
    goto(page) {
		this.setState({modalDialog: null})
       this.setState({exitRedirect:page});
       window.removeEventListener('keydown',this.handleKeyDown)
	};
      
      
    // return seen questionIds sorted by 'review status'
    getQuestionsForReview() {
		this.setState({modalDialog: null})
      //console.log('getQuestionsForReview');
      //let topic = this.props.getCurrentTopic();
      this.props.getQuestionsForReview(this.props.user);
    };
    
    
    discoverQuestions() {
		this.setState({modalDialog: null})
		window.removeEventListener('keydown',this.handleKeyDown)
		  let that = this;
			 if (this.props.match && this.props.match.params.topic && this.props.match.params.topic.length > 0) {
               // setTimeout(function() {
                    //console.log(['REVIEW PAGE call ',that.props.match]); 
                    //that.props.setReviewFromTopic(that.props.match.params.topic,that.props.match.params.topicquestion);
                    that.goto("/discover/"+that.props.match.params.topic);
                //},1000);
            } else {
                //setTimeout(function() {
                    //that.props.getQuestionsForReview();
                    that.goto("/discover")
                //},1000);
            }
        //this.props.setQuizFromDiscovery();
        //let topic = this.props.getCurrentTopic();
        ////console.log(['finish quiz',topic]);
        //this.props.discoverQuizFromTopic(topic);
    };
    
    
    reviewQuestions() {
		this.setState({modalDialog: null})
		window.removeEventListener('keydown',this.handleKeyDown)
		let that = this;
		 if (this.props.match && this.props.match.params.topic && this.props.match.params.topic.length > 0) {
                setTimeout(function() {
                   // console.log(['REVIEW PAGE call ',that.props.match]); 
                    that.props.setReviewFromTopic(that.props.match.params.topic,that.props.match.params.topicquestion, that.props.user);
                },1000);
            } else if (this.props.match && this.props.match.params && this.props.match.params.band && this.props.match.params.band.length > 0) {
                setTimeout(function() {
                   // console.log(['REV review from band',that.props.match.params.band,that.props.reviewBySuccessBand]);
                    that.props.reviewBySuccessBand(that.props.match.params.band, that.props.user);
                },1000);
            } else {
                setTimeout(function() {
                    that.props.getQuestionsForReview(that.props.user);
                },1000);
            }
        //let topic = this.props.getCurrentTopic();
        ////console.log(['REVUIEW PAGEfinish quiz',topic,this.props.setReviewFromTopic]);
        //if (topic && topic.length > 0) {
            //this.props.setReviewFromTopic(topic);
        //} else {
            //let band = this.props.getCurrentBand();
            //this.props.reviewBySuccessBand(band);
        //}
        
        //this.props.setCurrentPage('review')
    };
    
    handleKeyDown(e) {
		let that = this
		//console.log(['review key',e])
		if (e.code === "ArrowRight") {
			that.reviewQuestions()
			this.setState({modalDialog: null})
			window.removeEventListener('keydown',this.handleKeyDown)
		}
	}
		
    
    finishReview(questions,success) {
		let that = this
      // //console.log('finish review');
       //this.setCurrentPage('review');
       //let topic = this.props.getCurrentTopic();
       //console.log(['finish review',topic]);
        
       
        window.addEventListener('keydown',this.handleKeyDown)
        this.setState({modalDialog: {
          title: 'Review set complete',
          message: 'You recalled '+success.length+' out of '+questions.length+' questions.',
          buttons: [
            {
              label: 'Continue Review',
              onClick: () => this.reviewQuestions(),
              variant: 'success'
            },
            {
              label: 'Discover',
              onClick: () => this.discoverQuestions(that.props.user)
            },
            {
              label: 'Search',
              onClick: () => this.goto('/search')
            },
            {
              label: 'Profile',
              onClick: () => this.goto('/profile')
            }
          ]
        }})
        //,
          //willUnmount: function() {
			   //window.removeEventListener('keydown',handleKeyDown)
		  //}
      // this.props.setMessage('Review complete. You recalled '+success.length+' out of '+questions.length+' questions.'); 
       
    };
    
    render() {
         if (this.state.exitRedirect && this.state.exitRedirect.length > 0) {
            return <Redirect to={this.state.exitRedirect} />
        } else if (this.state.modalDialog) {
            return <ModalDialog {...this.state.modalDialog} />
        } else {
		    //console.log(['REVIEW',this.props.user]);
		   if (this.props.isLoggedIn()) {
				//console.log(['REVIEW USER',this.props.questions]);
				if (this.props.questions && this.props.questions.length > 0) {
				   //  //console.log(['REVIEW questions']);
					return (
					<div>
						<QuizCarousel  isAdmin={this.props.isAdmin}  saveSuggestion={this.props.saveSuggestion} mnemonic_techniques={this.props.mnemonic_techniques} setQuizFromTechnique={this.props.setQuizFromTechnique} setQuizFromTopic={this.props.setQuizFromTopic} discoverQuizFromTopic={this.props.discoverQuizFromTopic} setReviewFromTopic={this.props.setReviewFromTopic}  setQuizFromTag={this.props.setQuizFromTag}  setCurrentQuestion={this.props.setCurrentQuestion} discoverQuestions={this.props.discoverQuestions}  questions={this.props.questions} currentQuiz={this.props.currentQuiz} currentQuestion={this.props.currentQuestion} finishQuiz={this.finishReview} indexedQuestions={this.props.indexedQuestions} user={this.props.user}  progress={this.props.progress} updateProgress={this.props.updateProgress} setCurrentPage={this.props.setCurrentPage} successButton={true} setMessage={this.props.setMessage}  like={this.props.like} isLoggedIn={this.props.isLoggedIn} setCurrentQuiz={this.props.setCurrentQuiz} isReview={true} sendAllQuestionsForReview={this.props.sendAllQuestionsForReview}  fetch={this.props.fetch} reviewQuestions={this.reviewQuestions} startWaiting={this.props.startWaiting} stopWaiting={this.props.stopWaiting}/>
 
					</div>
					)
				} else {
					return (
					<div  style={{marginLeft:'1em'}} ><br/><b>You have no questions available for review. <br/>Note that questions that you have seen in the last hour are excluded from review. <br/><br/>Time to discover something new ! </b> <br/><br/>
					<Link  style={{marginTop:'1em'}} className="btn btn-info" to="/discover" >Discover</Link>
					<Link  style={{marginTop:'1em'}} className="btn btn-info" to="/search" >Topics</Link>
					<Link  style={{marginTop:'1em'}} className="btn btn-info" to="/search/tags" >Tags</Link>
					<Link style={{marginTop:'1em'}}  className="btn btn-info" to="/search/questions" >Questions</Link>
					<div style={{marginTop:'1em'}} className="btn btn-success" onClick={this.reviewQuestions} >Refresh</div>
				   </div>
					)
				}
		  } else {
			return (
				<div><b><Link to="/login" className="btn btn-info"   >Join</Link> the library to build your knowledge bank.</b></div>
			);
		  }
		}
    }
};
