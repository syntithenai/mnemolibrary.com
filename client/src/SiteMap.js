import React, { Component } from 'react';
import 'whatwg-fetch'
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

export default class SiteMap extends Component {

    constructor(props) {
        super(props);
       
    };
    
    render() {
	
		let that = this;
		let buttonStyle = {marginTop:'0.3em',marginBottom:'0.3em',paddingLeft:'1em',paddingRight:'1em'} //padding:'0.3em',fontSize:'1.2em',margin:'0.3em'
		let blockStyle={marginBottom:'1em', backgroundColor:'#eee', padding:'0.1em', border: '1px solid black', borderRadius:'10px'}
		return (
			<div className="container" >
				
				  <div className="row" style={blockStyle}>
				 {this.props.isLoggedIn() && <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/profile"  >Profile</Link><Link style={buttonStyle} className='btn btn-info'  to="/settings"  >Settings</Link></div>}
				  {(this.props.isLoggedIn()) && <div className="col"><div onClick={this.props.logout} style={buttonStyle} className='btn btn-danger'  to="/profile"  >Logout</div></div>}
				  {!this.props.isLoggedIn() && <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/login"  >Login</Link></div>}
				  
				  <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/help"  >Help</Link></div>
				 	
					
					</div>
				
					

				<div className="row" style={blockStyle}>
				 <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/"  >Discover</Link></div>
				  <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/multiplechoicetopics"  >Quizzes</Link></div>
				  <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/review"  >Review</Link></div>
			  <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/search/tags"  >Search Tags</Link></div>
				  <div className="col"><Link style={buttonStyle} className='btn btn-info'  to="/search/questions"  >Search Questions</Link></div>
			

				  
				</div>
			
				  
			</div>
			)
	}
}
          
           
