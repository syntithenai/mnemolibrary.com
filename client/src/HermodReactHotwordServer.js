/* global Porcupine */
/* global PicovoiceAudioManager */

import React from 'react'
import HermodReactComponent from './HermodReactComponent'
import Resources from './resources'

export default class HermodReactHotwordServer extends HermodReactComponent {

   constructor(props) {
        super(props);
        this.sensitivities = new Float32Array([1]);
        this.hotwordManager =  null;
        if (!props.siteId || props.siteId.length === 0) {
            throw Error("HOTWORD Server must be configured with a siteId property");
        }
        let that = this;
        that.props = props;
        this.gainNode = null;
        this.hotwordId = this.props.hotwordId && this.props.hotwordId.length > 0 ? this.props.hotwordId : 'default';
        
        this.sendHotwordDetected = this.sendHotwordDetected.bind(this);
        this.sendHotwordToggleOn = this.sendHotwordToggleOn.bind(this);
        
        this.startHotword = this.startHotword.bind(this);
        this.stopHotword = this.stopHotword.bind(this);
        this.hotwordCallback = this.hotwordCallback.bind(this)
        let eventFunctions = {
        // SESSION
            'hermod/+/hotword/start' : function(topic,siteId,payload) {
                if (siteId && siteId.length > 0) { // && payload.siteId === that.props.siteId) {
                    that.startHotword(siteId);
                }
            },
            'hermod/+/hotword/stop' : function(topic,siteId,payload) {
                if (siteId && siteId.length > 0) { // && payload.siteId === that.props.siteId) {
                    that.stopHotword();
                }
            }
        }
        this.logger = this.connectToLogger(props.logger,eventFunctions);
     }  
        
   
    
    componentDidUpdate(props,state) {
        let that = this;
        if (props.inputvolume !== this.props.inputvolume) {
            
        }
        if (props.config.hotword !== this.props.config.hotword) {
            this.hotwordManager = null;
            if (this.props.config.hotword.startsWith("browser:")) {
               setTimeout(function() {
                    that.startHotword(that.props.siteId);
               },1000)
            }
        }
        return false;
        
    };
    
    
    /**
     * Pause the hotword manager
     */ 
    stopHotword() {
        if (this.hotwordManager) this.hotwordManager.pauseProcessing();
    };
    
    /**
     * Create or continue the hotword manager
     */ 
    startHotword(siteId) {
      if (siteId === this.props.siteId ) {
          if (this.hotwordManager === null) {
             let parts = this.props.config.hotword.split(":");
              if (parts.length > 1) {
                  let localHotword = parts[1];
                  this.hotwordManager =  new PicovoiceAudioManager(this.props.addInputGainNode,this.props.config.inputvolume);
                  let singleSensitivity = this.props.config.hotwordsensitivity ? this.props.config.hotwordsensitivity/100 : 0.9;
                  let sensitivities=new Float32Array([singleSensitivity]);
                  let selectedKeyword = null;
                  if (Resources.keywordIDs.hasOwnProperty(localHotword)) {
                      selectedKeyword = Resources.keywordIDs[localHotword];
                      this.hotwordManager.start(Porcupine.create([selectedKeyword], sensitivities), this.hotwordCallback, function(e) {
                        console.log(['HOTWORD error',e]);
                      });
                  }                  
              }
          } else {
              if(this.hotwordManager) this.hotwordManager.continueProcessing();
          }
      }
    };
        
    hotwordCallback(value) {
		 if (!isNaN(value) && parseInt(value,10)>=0) {
            this.sendStartSession(this.props.siteId,{startedBy:'Hermodreacthotword',user:this.props.user ? this.props.user._id : ''});
        }
    };
    
        
    render() {
        return <span id="Hermodreacthotwordserver" ></span>
    };
}
