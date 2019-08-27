/* eslint-disable */ 
import React, { Component } from 'react';
import Utils from './Utils';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import NotesList from './NotesList'

export default class QuestionList extends Component {
	
	
	constructor(props) {
		super(props)
		this.loadMnemonics = this.loadMnemonics.bind(this) 
		this.state = {
			mnemonics : {}
		}
	}
	
	componentDidMount() {
		// load mnemonics
		this.loadMnemonics()
	}
	componentDidUpdate(props) {
		// load mnemonics
		if (this.props.question != props.question) this.loadMnemonics()
	}	
	
	
	
	loadMnemonics() {
		let that=this;
		let ids = this.props.questions ? this.props.questions.map(function(q) { return q._id} ): null;
		if (ids) {
			
			if (ids) {
			  that.props.fetch('/api/mnemonics',{
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/json'
				  },
				  body: JSON.stringify({
					questions: ids.join(",")
				  })
			  })
			  .then(function(response) {
				////console.log(['got response', response])
				return response.json()
			  }).then(function(json) {
				    console.log(['got response', json])
					let mnemonicsByQuestion={};
					let mnemonics={};
					let selectedMnemonics={};
					if (json) {
						json.map(function(mnemonic) {
							if (mnemonic && !mnemonicsByQuestion.hasOwnProperty(mnemonic.question)) mnemonicsByQuestion[mnemonic.question] = [];
							mnemonics[mnemonic._id] = mnemonic;
							mnemonicsByQuestion[mnemonic.question].push(mnemonic._id)
						})
				   }
					// now iterate questions and select first or user selected mnemonic
					that.props.questions.map(function(question) {
						if (that.props.user && that.props.user.selectedMnemonics && that.props.user.selectedMnemonics.hasOwnProperty(question._id) && that.props.user.selectedMnemonics[question._id].length > 0 && mnemonics.hasOwnProperty(that.props.user.selectedMnemonics[question._id])) {
							selectedMnemonics[question._id] = mnemonics[that.props.user.selectedMnemonics[question._id]].mnemonic;
						} else {
							selectedMnemonics[question._id] = mnemonicsByQuestion.hasOwnProperty(question._id) && mnemonicsByQuestion[question._id].length > 0 && mnemonics.hasOwnProperty(mnemonicsByQuestion[question._id][0]) ? mnemonics[mnemonicsByQuestion[question._id][0]].mnemonic : '';
						}
					})
				   console.log(['COLLATED',mnemonics,mnemonicsByQuestion,selectedMnemonics])
							
				   
					that.setState({mnemonics:selectedMnemonics});
			  }).catch(function(ex) {
				console.log(['parsing failed', ex])
			  })
			}
		}
	}
	
    render() {
       // //console.log(['QL',this.props.questions]);
        if (Array.isArray(this.props.questions)) {
            let questions = this.props.questions.map((question, key) => {
                if (question && question._id) {
                    let title=Utils.getQuestionTitle(question);
                    let excerpt='';
                    //console.log(this.props);
                    if (this.props.isReview===false) {
                        excerpt='-->' + question.answer.split(' ').slice(0,3).join(' ')+'...';
                    } 
                    let details=null;
                    if (this.props.showQuestionListDetails) {
						title = <b>{title}</b>
						details=<div>
							{this.state.mnemonics.hasOwnProperty(question._id) && <div style={{marginTop:'0.2em'}}>
								<b>Memory Aid: </b><i>{this.state.mnemonics[question._id]}</i>
							</div>}
							<div style={{marginTop:'0.2em'}}>
								<b>Answer: </b><pre>{question.answer}</pre>
							</div>
							{this.props.user && <NotesList user={this.props.user._id} question={question._id} fetch={this.props.fetch} />}
						</div>
					}
                    
                    if (this.props.onClick) {
                       return <div className='list-group-item' key={question._id} onClick={(e) => this.props.onClick(question)}  >
                        <span  >{title} ? {excerpt}</span>
                        {details}
                        </div>
                    } else {
                         return <Link to={"/discover/topic/"+question.quiz+"/"+question._id}  ><div className='list-group-item' key={question._id} >
                        {title} ? {excerpt}
                        {details}
                        </div>
                        </Link>
                    }
                  
                  
                }
                return '';
            })
            return (
              <div style={{fontSize:'1.2em'}} className="questions list-group">
                  {
                    questions
                  }
                
              </div>
            )
        } else {
            return null
        }
        
        
    };
}
