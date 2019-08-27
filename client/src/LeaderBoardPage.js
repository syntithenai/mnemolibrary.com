import React, { Component } from 'react';
//import 'whatwg-fetch'
//import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
//import { confirmAlert } from 'react-confirm-alert'; // Import
//import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import LeaderBoard from './LeaderBoard'

export default class LeaderBoardPage extends Component {

    constructor(props) {
        super(props);
     };
     
     componentDidUpdate(props) {
		if (props.token !== this.props.token) {
			if (!this.props.user) this.props.openLoginWindow('leaderboard')
		}
	}
    
    render() {
		if (this.props.user) {
			this.props.analyticsEvent('leaderboard');
				
			return (<div style={{marginLeft:'1em'}} >
					<div  style={{height: '660px'}} >
						<LeaderBoard type="streak" user={this.props.user} fetch={this.props.fetch} />
					</div>
					<div  style={{height: '660px'}} >
					   <LeaderBoard type="questions" user={this.props.user} fetch={this.props.fetch}   />
					</div>
					<div  style={{height: '660px'}} >
					   <LeaderBoard type="recall" user={this.props.user}  fetch={this.props.fetch} />
					</div>
			 </div>)
		} else {
			return null
		}
     }
     
}             
