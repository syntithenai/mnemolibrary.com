/* eslint-disable */ 

import React, { Component } from 'react';
import HelpNavigation from './HelpNavigation';            
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'

export default class MyMultipleChoiceStats extends Component {
    
    
    constructor(props) {
		super(props)
		this.state={}
		
	}
    
    
    componentDidMount(props) {
		let that = this;
		this.props.fetch('/api/mymcstats').then(function(response) {
			return response.json();
		}).then(function(stats) {
		//	console.log(['stats',stats])
			that.setState({stats:stats})
		})
	}
    
    render() {
		let that = this;
		let stats = this.state.stats ? Object.keys(this.state.stats) : [];
		stats.sort(function(a,b) {
			if (a < b) {
				return -1 
			} else {
				return 1
			}
		})
        return  (
        <div className='mymcstats' >
        <h4>Multiple Choice Quizzes</h4>
        	{stats.map(function(topic) {
				let details = that.state.stats[topic] 
				let correct = parseInt(details.correct,10) !== NaN ? parseInt(details.correct,10) : 0;
				let attempts = parseInt(details.attempts,10) !== NaN ? parseInt(details.attempts,10) : 0;
				let total = parseInt(details.total,10) !== NaN ? parseInt(details.total,10) : 0;
				let percentCorrect = attempts > 0 && correct > 0 ? parseInt(correct/attempts*100,10) : 0;
				return <div key={topic} ><div style={{marginTop:'0.6em'}}><Link to={'/multiplechoicequestions/'+encodeURI(topic)}><b>{topic}</b></Link></div> <div><i>{percentCorrect}% correct of {attempts} answers.</i> {total - attempts} questions remaining in this topic.</div></div>
			 })}
        </div>
)}}
