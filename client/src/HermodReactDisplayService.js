import React from 'react'
import {Component} from 'react'
import HermodReactComponent from './HermodReactComponent'

export default class HermodReactDisplayService extends HermodReactComponent  {

    constructor(props) {
        super(props);
        if (!props.siteId || props.siteId.length === 0) {
            throw "TTS Server must be configured with a siteId property";
        }
        //this.props.config={}
        let that = this;
        this.state={}
        let eventFunctions = {
        // SESSION
            'hermod/+/display/image' : function(topic,siteId,payload) {
				if (siteId && siteId.length > 0) { 
                   that.setState({image:payload.image});
				}
            },
            'hermod/+/display/buttons' : function(topic,siteId,payload) {
				if (siteId && siteId.length > 0) { 
                   that.setState({buttons:payload.buttons});
				}
            },
            'hermod/+/display/attachement' : function(topic,siteId,payload) {
				if (siteId && siteId.length > 0) { 
                   that.setState({attachement:payload.attachement});
				}
            }
        }
        
        this.logger = this.connectToLogger(props.logger,eventFunctions);
    }  
    
    componentDidMount() {
    };
    
  


    render() {
        return <div id="HermodreactDisplayService" style={{border:'2px solid blue'}}  >
        {this.state.image && <img src={this.state.image} style={{maxHeight: '100px'}} />}
        {this.state.buttons && <button>buttons{JSON.stringify(this.state.buttons)}</button>}
        {this.state.attachement && <a href={this.state.attachement}  >Download</a>}
        
        </div>
    };
//{JSON.stringify(this.state,null,1)}
        
  
}

