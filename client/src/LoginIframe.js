/* eslint-disable */ 
import React, { Component } from 'react';

export default class LoginIframe extends Component {
 
 
	constructor(props) {
		super(props)
		this.ifr = null;
	}
	
	componentDidMount() {
		this.ifr.onload = () => {
			if (this.ifr) this.ifr.contentWindow.postMessage('hello', "*");
		}
		
		window.addEventListener("message", this.handleFrameTasks);
	}
	
	componentWillUnmount() {
		window.removeEventListener("message", this.handleFrameTasks);
	}
	
	handleFrameTasks = (e) => {
		console.log(['IFRAME MESSAGE',e.data])
//		if(e.data.from.iframe === "load_products") then...
	}

	
	shouldComponentUpdate() {
		return false;
	}
   
    render() {
		return  (
			<div className="login" style={{}} >
				<b>loging</b>
				<iframe src={this.props.loginUrl} sandbox="allow-scripts" ref={(f) => this.ifr = f; } />

			</div>
        )
    }
}
