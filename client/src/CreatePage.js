/* eslint-disable */ 
import React, { Component } from 'react';
//const config=require('../../config');
import TopicEditor from './TopicEditor';

import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'     

export default class CreatePage extends Component {
    
    constructor(props) {
        super(props);
        this.hideHelp = this.hideHelp.bind(this);
        this.showHelp = this.showHelp.bind(this);
        this.state = {
            showHelp:false,
        }
        this.props.analyticsEvent('create');
       // //console.log(['constr',this.state]);
    
    };
    
	componentDidUpdate(props) {
		//console.log(['CP UPDATE',props.token,this.props.token])
		if (props.token !== this.props.token) {
			//console.log('CP UPDATE TOKEN CHANGE')
			//console.log(this.props.user)
			if (!this.props.user) {
				this.props.openLoginWindow('create')
			}
		}
	}
    
    showHelp(e) {
        this.setState({showHelp:true});
        return false;
    };
    hideHelp(e) {
        this.setState({showHelp:false});
        return false;
    };
    
    render() {
        if (this.props.user && this.props.user._id && this.props.user._id.length > 0) {
            return <div>
                <TopicEditor fetchTopicCollections={this.props.fetchTopicCollections} user={this.props.user} setQuizFromTopic={this.props.setQuizFromTopic} mnemonic_techniques={this.props.mnemonic_techniques}  setCurrentPage={this.props.setCurrentPage} fetch={this.props.fetch} startWaiting={this.props.startWaiting} stopWaiting={this.props.stopWaiting} />
            </div>
        } else {
			//console.log('REDIR to /login#state='+encodeURIComponent('/create'))
            //return <b>{'REDIR to /login#state='+encodeURIComponent('/create')}</b> //
            //this.props.setLoginCallback('/create');
            //return <Redirect to="/login" />
            return null;
        }   
    }
    

}
