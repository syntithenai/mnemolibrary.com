import React from 'react'
import {Component} from 'react'
import HermodMqttServer from './HermodMqttServer';
import HermodLogger from './HermodLogger'


export default class HermodReactComponent extends Component {
    
    constructor(props) {
        super(props);
        this.props = props;
        this.state={};
        this.logger = null;
        this.queueOneOffCallbacks = this.queueOneOffCallbacks.bind(this);
        this.connectToLogger = this.connectToLogger.bind(this);
        this.setLogData = this.setLogData.bind(this)
    };
    
    componentDidMount() {
        this.connectToLogger(this.props.logger,{});
    };
    
    
    connectToLogger(logger,eventFunctions) {
        if (logger) {
            logger.addCallbacks(eventFunctions);
            this.logger = logger;
            return this.logger;
        } else {
            this.logger =  new HermodLogger(Object.assign({logAudio:false,setLogData:this.setLogData , eventCallbackFunctions :eventFunctions},this.props));
            return this.logger;
        }
    };
    
    queueOneOffCallbacks(eventFunctions) {
        if (this.logger) {
            this.logger.addCallbacks(eventFunctions,true);
        }
    };
   
    sendMqtt(destination,payload) {
        if (this.logger) {
            this.logger.sendMqtt(destination,payload);
        }
    }; 
    // force update
    setLogData(sites,messages,sessionStatus,sessionStatusText,hotwordListening,audioListening) {
       this.setState(this.state);
   };
   
   /**
    *  MQTT SEND 
    */
     
     
    /**
     * Send Mqtt message to toggle on hotword
     * Used to forcibly initialise the local hotword server.
     */ 
    sendHotwordToggleOn(siteId) {
        this.sendMqtt("hermod/"+siteId+"/hotword/start",{});
    };
    
    /**
     * Send Mqtt message to fake hotword detection
     */ 
    sendHotwordDetected(siteId,hotwordId) {
        this.sendMqtt("hermod/"+siteId+"/hotword/detected",{hotword:hotwordId});
    }
    
    /**
     * Send Mqtt message to start a voice session
     */     
    sendStartSession(siteId,customData,text) {
        this.sendMqtt("hermod/"+siteId+"/dialog/start",{});
    };
    
    /**
     * Send Mqtt message to indicate that tts has finished
     */     
    sendSayFinished(id,sessionId) {
        this.sendMqtt("hermod/"+this.siteId+"/tts/finished",{id:id,sessionId:sessionId});
    };
    
    /**
     * Send Mqtt message to indicate audioserver playback has finished
     */ 
    sendPlayFinished(siteId,sessionId) {
        this.sendMqtt("hermod/"+this.siteId+"/speaker/finished",{id:sessionId});
    };

    /**
     * Send Mqtt message to end the session immediately
     */ 
    sendEndSession(siteId,sessionId,text) {
         let payload = {id:sessionId}
        if (text && text.length > 0) {
            payload.text = text;
        }
        this.sendMqtt("hermod/"+siteId+"/dialog/end",payload);
    };
   
   
   /**
     * Send Mqtt message to toggle on asr
     * Used to forcibly initialise the local asr server.
     */ 
    sendAsrToggleOn(siteId) {
        this.sendMqtt("hermod/"+siteId+"/asr/start",{});
    };
    
    /**
     * Send Mqtt message to toggle on asr
     * Used to forcibly initialise the local asr server.
     */ 
    sendAsrStopListening(siteId) {
        this.sendMqtt("hermod/"+siteId+"/asr/stop",{});
    };
   
    /**
     * Send Mqtt message to toggle on asr
     * Used to forcibly initialise the local asr server.
     */ 
    sendAsrStartListening(siteId) {
        this.sendMqtt("hermod/"+siteId+"/asr/start",{});
    };
   

     /**
     * Send Mqtt message to toggle on asr
     * Used to forcibly initialise the local asr server.
     */ 
    sendAsrToggleOff(siteId) {
        this.sendMqtt("hermod/"+siteId+"/asr/stop",{});
    };
    
     /**
     * Send Mqtt message to toggle on feedback
     */ 
    sendFeedbackToggleOn(siteId) {
      //  this.sendMqtt("hermod/feedback/sound/toggleOn",{siteId:siteId});
    };
    
     /**
     * Send Mqtt message to toggle off feedback
     */ 
    sendFeedbackToggleOff(siteId) {
      //  this.sendMqtt("hermod/feedback/sound/toggleOff",{siteId:siteId});
    };
    
    
    
    
    
    render() {
        return <b id="Hermodreactcomponent" ></b>
    }
}

