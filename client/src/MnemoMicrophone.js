import React from 'react'
import {Component} from 'react'

import HermodReactHotwordServer from './HermodReactHotwordServer'
import HermodReactMicrophone from './HermodReactMicrophone'
import HermodReactTts from './HermodReactTts'
import HermodReactSpeaker from './HermodReactSpeaker'
import HermodReactConfig from './HermodReactConfig'
import HermodLogger from './HermodLogger'
//import HermodReactAppServer from './HermodReactAppServer'
//import HermodReactLogger from './HermodReactLogger'
//import HermodReactFlatLogger from './HermodReactFlatLogger'
//import HermodReactTrackerView from './HermodReactTrackerView'
//import HermodReactDisplayService from './HermodReactDisplayService'

export default class MnemoMicrophone extends Component  {

	render() {
		return null;
	}
    //constructor(props) {
        //super(props);
        //this.siteId = 'browser_'+parseInt(Math.random()*100000000,10);
        //this.inputGainNodes=[];
        //this.setLogData = this.setLogData.bind(this);
        //this.setConfig = this.setConfig.bind(this);
        //this.showConfig = this.showConfig.bind(this);
        //this.hideConfig = this.hideConfig.bind(this);
        //this.addInputGainNode = this.addInputGainNode.bind(this);
        //this.logger = props.logger ? props.logger : new HermodLogger(Object.assign({logAudio:true,setLogData:this.setLogData },props));
        //this.state = {showConfig:false,config:{}};
        //let configString = localStorage.getItem(this.appendUserId('Hermodmicrophone_config',props.user));
        //let config = null;
        //this.setLogData = this.setLogData.bind(this)
        //try {
            //config = JSON.parse(configString)
        //} catch(e) { 
        //}
        //if (config) {
            //this.state.config = config;
        //} else {
            //// default config
            //let newConfig = this.getDefaultConfig();
            //this.state.config = newConfig;
            //localStorage.setItem(this.appendUserId('Hermodmicrophone_config',this.props.user),JSON.stringify(newConfig));
        //}
    //}  
 
  
    //appendUserId(text,user) {
        //if (user && user._id) {
            //return text+"_"+user._id;
        //} else {
            //return text;
        //}
    //};
    
   
    
    //// force update
    //setLogData(sites,messages,sessionStatus,sessionStatusText,hotwordListening,audioListening) {
        //this.setState({sites:sites,messages:messages,sessionStatus:sessionStatus,sessionStatusText:sessionStatusText,hotwordListening:hotwordListening,audioListening:audioListening});
    //};
    
    //setConfig(config) {
        //this.setState({config:config});
    //};
    
    //showConfig() {
        //this.setState({showConfig:true});
    //};
    
    //hideConfig() {
        //this.setState({showConfig:false});
    //};
    
    //addInputGainNode(node) {
        //this.inputGainNodes.push(node);
    //};

    //getDefaultConfig() {
       //return  {
            //inputvolume:'70',
            //outputvolume:'70',
            //voicevolume:'70',
            //ttsvoice: 'default', //this.state.voices && this.state.voices.length > 0 ? this.state.voices[0].name :
            //voicerate:'50',
            //voicepitch:'50',
            //hotword:'browser:ok lamp',
            //hotwordsensitivity:'90',
            //enabletts:'yes',
            //enableaudio:'yes',
            //enablenotifications:'yes'
        //};
    //};
 

    //render() {
		//let position=this.props.position ? this.props.position  : 'top right'
        
        //return <div id ="Hermodreactsatellite" >
        
			//<HermodReactHotwordServer  logger={this.logger} siteId={this.siteId} config={this.getDefaultConfig()}/>
			//<HermodReactSpeaker {...this.props} logger={this.logger} siteId={this.siteId}  config={this.state.config} />
           
            //<div style={{position:'fixed',top:0,right:94, fontSize:'2em',zIndex:999999999}}>
            //<HermodReactMicrophone {...this.props} position={position} logger={this.logger} siteId={this.siteId} config={this.state.config} showConfig={this.showConfig} hideConfig={this.hideConfig} localHotword={true} addInputGainNode={this.addInputGainNode} />
            //</div>
            
           //<HermodReactDisplayService siteId={this.siteId} logger={this.logger} navigateTo={this.props.navigateTo} >
			
              
           
          //{this.state.showConfig && <div style={{width:'100%', zIndex:999999,backgroundColor:'white', position:'fixed', top:0,right:0, height:'700px'}}><HermodReactConfig  siteId={'fred'} setConfig={this.setConfig} configurationChange={this.setConfig} hideConfig={this.hideConfig} config={this.state.config} addInputGainNode={this.addInputGainNode} inputGainNodes={this.inputGainNodes} /></div>}
          
            //</div>
    //};
  
  
} 
