import React from 'react'
import {Component} from 'react'
//import AudioMeter from './AudioMeter.react'
import HermodReactComponent from './HermodReactComponent'
let hark = require('hark');

export default class HermodReactMicrophone extends HermodReactComponent  {

    constructor(props) {
        super(props);
        let that = this;
        this.state={}
        if (!props.siteId || props.siteId.length === 0) {
            throw "Hermod Microphone must be configured with a siteId property";
        }
        // state.sending is updated by hark voice detection
        // state.enabled when mic loaded and mic/start
        this.state={recording:false,messages:[],lastIntent:'',lastTts:'',lastTranscript:'',showMessage:false,activated:false,speaking:false,showConfig:false,listening:false,sessionId : "",enabled:false,sending:false}
        this.siteId = props.siteId ; //? props.siteId : 'browser'+parseInt(Math.random()*100000000,10);
        this.clientId = props.clientId ? props.clientId :  'client'+parseInt(Math.random()*100000000,10);
        this.hotwordId = props.hotwordId ? props.hotwordId :  'default';
        this.context = null;
        this.gainNode = null;
        this.messageTimeout = null;
        this.speakingTimeout = null;
        this.speechEvents =  null;
        //this.startDialog = this.startDialog.bind(this);
        
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        //this.startRecorder = this.startRecorder.bind(this);
        this.flashState = this.flashState.bind(this);
        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.showConfig = this.showConfig.bind(this);
        this.showConfigNow = this.showConfigNow.bind(this);
        this.clearConfigTimer = this.clearConfigTimer.bind(this);
        
        this.waitingForSession = null;
        this.configTimeout = null;
        
        let eventFunctions = {
        // SESSION
            'hermod/+/asr/text' : function(topic,siteId,payload) {
				// && payload.siteId === that.siteId
                if (siteId && siteId.length > 0 && payload.text && payload.text.length > 0 ) {
                    that.flashState('lastTranscript',payload.text);
                }
            }
            ,
            'hermod/+/tts/say' : function(topic,siteId,payload) {
                if (siteId && siteId.length > 0  && payload.text && payload.text.length > 0 ) {
                    that.flashState('lastTts',payload.text);
                }
            }
            ,
            'hermod/+/asr/start' : function(topic,siteId,payload) {
                if (siteId && siteId.length > 0) {
                    that.setState({sending:true});
                }
            }
            ,
            'hermod/+/asr/fail' : function(topic,siteId,payload) {
                if (siteId && siteId.length > 0) {
                    that.setState({sending:false});
                }
            }
            ,
            'hermod/+/asr/stop' : function(topic,siteId,payload) {
                if (siteId && siteId.length > 0) {
                    that.setState({sending:false});
                }
            }
        }  
        this.logger = this.connectToLogger(props.logger,eventFunctions);
    }  
    
  
    /**
     * Lifecycle functions
     */
     
    /**
     * Activate on mount if user has previously enabled.
     */ 
    componentDidMount() {
        let that = this;
        //
        if (localStorage.getItem(this.appendUserId('Hermodmicrophone_enabled',this.props.user)) === 'true') {
			setTimeout(function() {
				that.activate(false);
			},500);
		}
		//  if using server hotword, autostart microphone
		setTimeout(function() {
			if (that.props.enableServerHotword) {
			// initialise the dialog manager to start the hotword listener
				that.sendMqtt('hermod/'+that.props.siteId+'/microphone/start',{})
			}
			that.sendMqtt('hermod/'+that.props.siteId+'/hotword/start',{})
		},1000)
        
    }

    /** 
     * Functions to enable and disable configuration screen 
     * by default using a debounce to implement click and hold to enable config
     **/
    showConfig(e) {
		 let that = this;
         this.configTimeout = setTimeout(function() {
            that.setState({showConfig:true}); 
            if (that.props.showConfig) that.props.showConfig();
        },1000);
    }; 

    showConfigNow(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.showConfig) this.props.showConfig();
        else this.deactivate();
    }; 
    
    clearConfigTimer() {
        if (this.configTimeout) clearTimeout(this.configTimeout);
        delete this.configTimeout
    }; 
  
  
    
    /**
     * Connect to mqtt, start the recorder and optionally start listening
     * Triggered by microphone click or hotword when the mic is deactivated
     */
    activate(startSending = true) {
		let that = this;
        localStorage.setItem(this.appendUserId('Hermodmicrophone_enabled',this.props.user),'true');
			that.startRecording();
			that.setState({activated:true});
			if (startSending) {
				that.setState({sending:true});
				that.logger.sendMqtt('hermod/'+this.props.siteId+'/dialog/start',{});
			}
	};
   
    
    /**
     * Disable microphone and listeners
     */
    deactivate() {
		this.setState({sending:false});
    };

   
   
   
      //https://subvisual.co/blog/posts/39-tutorial-html-audio-capture-streaming-to-node-js-no-browser-extensions/
    startRecording() {
		let that = this;
		if (this.state.isRecording) return;
		this.setState({isRecording:true});
		
		this.setState({lastIntent:'',lastTts:'',lastTranscript:'',showMessage:false});
        
		if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }
         try {
            if (navigator.getUserMedia) {
              navigator.getUserMedia({audio:true}, success, function(e) {
                console.log(['MIC Error capturing audio.',e]);
              });
            } else {
                console.log('MIC getUserMedia not supported in this browser.');
            }
         }   catch (e) {
             console.log(e);
         }
        function success(e) {
			  let audioContext = window.AudioContext || window.webkitAudioContext;
              let context = new audioContext();
              let audioInput = context.createMediaStreamSource(e);
              var bufferSize = 2048;
              
				function convertFloat32ToInt16(buffer) {
				  if (buffer) {
					  let l = buffer.length;
					  let buf = new Int16Array(l);
					  while (l--) {
						buf[l] = Math.min(1, buffer[l])*0x7FFF;
					  }
					  return buf.buffer;
				  }
				}
				
				function resample(sourceAudioBuffer,TARGET_SAMPLE_RATE,onComplete) {
					  var offlineCtx = new OfflineAudioContext(sourceAudioBuffer.numberOfChannels, sourceAudioBuffer.duration * sourceAudioBuffer.numberOfChannels * TARGET_SAMPLE_RATE, TARGET_SAMPLE_RATE);
					  var buffer = offlineCtx.createBuffer(sourceAudioBuffer.numberOfChannels, sourceAudioBuffer.length, sourceAudioBuffer.sampleRate);
					  // Copy the source data into the offline AudioBuffer
					  for (var channel = 0; channel < sourceAudioBuffer.numberOfChannels; channel++) {
						  buffer.copyToChannel(sourceAudioBuffer.getChannelData(channel), channel);
					  }
					  // Play it from the beginning.
					  var source = offlineCtx.createBufferSource();
					  source.buffer = sourceAudioBuffer;
					  source.connect(offlineCtx.destination);
					  source.start(0);
					  offlineCtx.oncomplete = function(e) {
						// `resampled` contains an AudioBuffer resampled at 16000Hz.
						// use resampled.getChannelData(x) to get an Float32Array for channel x.
						var resampled = e.renderedBuffer;
						var leftFloat32Array = resampled.getChannelData(0);
						// use this float32array to send the samples to the server or whatever
						onComplete(leftFloat32Array);
					  }
					  offlineCtx.startRendering();
				}
     
				
              let recorder = context.createScriptProcessor(bufferSize, 1, 1);
              recorder.onaudioprocess = function(e){
                  if (that.state.activated  && that.state.sending ) {
		    		  resample(e.inputBuffer,16000,function(res) {
						that.logger.sendAudioMqtt('hermod/'+that.props.siteId+'/microphone/audio',Buffer.from(convertFloat32ToInt16(res)))
            		  });
            	  }
	    	  }
              
            audioInput.connect(recorder);
            recorder.connect(context.destination); 
         }
	
	}
   

    stopRecording = function() {
		 this.setState({sending:false});
         let session = this.logger.getSession(this.props.siteId,null);
		 if (session)  this.sendEndSession(session.siteId,session.id);
    }
        
    addInputGainNode(node) {
        this.inputGainNodes.push(node);
    };
    
    appendUserId(text,user) {
        if (user && user._id) {
            return text+"_"+user._id;
        } else {
            return text;
        }
    };
   
  
    
    ///**
     //* Bind silence recognition events to set speaking state
     //*/ 
    bindSpeakingEvents(audioContext,e) {
        let that = this;
        var options = {audioContext:audioContext};
         // bind speaking events care of hark
            this.speechEvents = hark(e, options);
            this.speechEvents.on('speaking', function() {
                 if (that.speakingTimeout) clearTimeout(that.speakingTimeout);
                  that.setState({speaking:true});
            });
            
            this.speechEvents.on('stopped_speaking', function() {
                  if (that.speakingTimeout) clearTimeout(that.speakingTimeout);
                  that.speakingTimeout = setTimeout(function() {
                      that.setState({speaking:false});
                  },1000);
            });            
        
    };

    getThreshholdFromVolume(volume) {
        return 10 * Math.log((101 - volume )/800);
    };

   
    
   flashState(key,value) {
       let that = this;
       if (this.props.config.enablenotifications !== "no") {
           if (key && key.length > 0 && value && value.length > 0) {
               if (this.messageTimeOut) clearTimeout(this.messageTimeOut);
               let newObj = {showMessage:true};
               if (key === "lastTranscript") {
                   newObj.lastIntent='';
                   newObj.lastTts='';
               }
               newObj[key] = value;
               this.setState(newObj);
               setTimeout(function() {
                   that.setState({showMessage:false});
               },that.props.messageTimeout > 0 ? that.props.messageTimeout : 10000);           
           }           
       }
   };
 

    
    
  render() {
      let that = this;
    const {
      text
    } = this.props
    
    let buttonStyle=this.props.buttonStyle ? this.props.buttonStyle : {};
    let speechBubbleSettings= {};
    let speechBubbleCSS= {position:'fixed'};
    
    let size= this.props.size && this.props.size.length > 0 ? this.props.size : '2em';
    buttonStyle.width = size
    buttonStyle.height = size
    
    let position = this.props.position && this.props.position.length > 0 ? this.props.position : 'topright';
    // set mic position and override bubble position
    buttonStyle.position = 'fixed';
    speechBubbleSettings.size ='20'
    if (position === "topleft") {
        buttonStyle.top = 0;
        buttonStyle.left = 0;
        speechBubbleSettings.triangle="top";
        speechBubbleSettings.side="right";
    } else if (position === "topright") {
        buttonStyle.top = 0;
        buttonStyle.right = 0;
        speechBubbleSettings.triangle="bottom";
        speechBubbleSettings.side="left";
    } else if (position === "bottomleft") {
        buttonStyle.bottom = 0;
        buttonStyle.left = 0;
        speechBubbleSettings.triangle="top";
        speechBubbleSettings.side="right";
    } else if (position === "bottomright") {
        buttonStyle.bottom = 0;
        buttonStyle.right = 0;
        speechBubbleSettings.triangle="bottom";
        speechBubbleSettings.side="left";
    }
    speechBubbleSettings.color="blue"
    
    let status = 0;
    if (this.state.activated) status = 2;
    //if (this.state.connected) status = 2;
    if (this.state.sending) status = 3;
    //if (this.state.sending) status = 3;
    let borderColor='black'
    let borderWidth = 2;
    if (status==3) {
        borderColor = (this.state.speaking) ? 'darkgreen' : (this.props.borderColor ? this.props.borderColor : 'green');
        buttonStyle.backgroundColor = 'lightgreen';
        if (this.state.speaking) borderWidth = 3;
    } else if (status==1) {
        borderColor = (this.state.speaking) ? 'darkorange' : (this.props.borderColor ? this.props.borderColor : 'orange')
        buttonStyle.backgroundColor = 'lightorange';
        if (this.state.speaking) borderWidth = 3;
    } else if (status==2) {
        borderColor = (this.state.speaking) ? 'orangered' : (this.props.borderColor ? this.props.borderColor : 'red');
        buttonStyle.backgroundColor = 'pink';
        if (this.state.speaking) borderWidth = 3;
    } else {
        borderColor = this.props.borderColor ? this.props.borderColor : 'black';
        buttonStyle.backgroundColor =  'lightgrey';
    }
    if (!buttonStyle.padding) buttonStyle.padding = '0.5em';
    if (!buttonStyle.margin) buttonStyle.margin = '0.5em';
    buttonStyle.border = borderWidth + 'px solid '+borderColor;
    if (!buttonStyle.borderRadius) buttonStyle.borderRadius = '100px';
    
    let micOffIcon =  <svg style={buttonStyle}  aria-hidden="true" data-prefix="fas" data-icon="microphone" className="svg-inline--fa fa-microphone fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"></path></svg>

    let micOnIcon = <svg style={buttonStyle}  aria-hidden="true" data-prefix="fas" data-icon="microphone-slash" className="svg-inline--fa fa-microphone-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M633.82 458.1l-157.8-121.96C488.61 312.13 496 285.01 496 256v-48c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 17.92-3.96 34.8-10.72 50.2l-26.55-20.52c3.1-9.4 5.28-19.22 5.28-29.67V96c0-53.02-42.98-96-96-96s-96 42.98-96 96v45.36L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.36 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.41-6.97 4.16-17.02-2.82-22.45zM400 464h-56v-33.77c11.66-1.6 22.85-4.54 33.67-8.31l-50.11-38.73c-6.71.4-13.41.87-20.35.2-55.85-5.45-98.74-48.63-111.18-101.85L144 241.31v6.85c0 89.64 63.97 169.55 152 181.69V464h-56c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16z"></path></svg>
    
    let resetIcon = 
<svg aria-hidden="true" style={{height:'1.1em'}}  role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M500.333 0h-47.411c-6.853 0-12.314 5.729-11.986 12.574l3.966 82.759C399.416 41.899 331.672 8 256.001 8 119.34 8 7.899 119.526 8 256.187 8.101 393.068 119.096 504 256 504c63.926 0 122.202-24.187 166.178-63.908 5.113-4.618 5.354-12.561.482-17.433l-33.971-33.971c-4.466-4.466-11.64-4.717-16.38-.543C341.308 415.448 300.606 432 256 432c-97.267 0-176-78.716-176-176 0-97.267 78.716-176 176-176 60.892 0 114.506 30.858 146.099 77.8l-101.525-4.865c-6.845-.328-12.574 5.133-12.574 11.986v47.411c0 6.627 5.373 12 12 12h200.333c6.627 0 12-5.373 12-12V12c0-6.627-5.373-12-12-12z"></path></svg>
    
    let stopIcon2=
<svg aria-hidden="true" style={{height:'1.4em'}}  role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M440.5 88.5l-52 52L415 167c9.4 9.4 9.4 24.6 0 33.9l-17.4 17.4c11.8 26.1 18.4 55.1 18.4 85.6 0 114.9-93.1 208-208 208S0 418.9 0 304 93.1 96 208 96c30.5 0 59.5 6.6 85.6 18.4L311 97c9.4-9.4 24.6-9.4 33.9 0l26.5 26.5 52-52 17.1 17zM500 60h-24c-6.6 0-12 5.4-12 12s5.4 12 12 12h24c6.6 0 12-5.4 12-12s-5.4-12-12-12zM440 0c-6.6 0-12 5.4-12 12v24c0 6.6 5.4 12 12 12s12-5.4 12-12V12c0-6.6-5.4-12-12-12zm33.9 55l17-17c4.7-4.7 4.7-12.3 0-17-4.7-4.7-12.3-4.7-17 0l-17 17c-4.7 4.7-4.7 12.3 0 17 4.8 4.7 12.4 4.7 17 0zm-67.8 0c4.7 4.7 12.3 4.7 17 0 4.7-4.7 4.7-12.3 0-17l-17-17c-4.7-4.7-12.3-4.7-17 0-4.7 4.7-4.7 12.3 0 17l17 17zm67.8 34c-4.7-4.7-12.3-4.7-17 0-4.7 4.7-4.7 12.3 0 17l17 17c4.7 4.7 12.3 4.7 17 0 4.7-4.7 4.7-12.3 0-17l-17-17zM112 272c0-35.3 28.7-64 64-64 8.8 0 16-7.2 16-16s-7.2-16-16-16c-52.9 0-96 43.1-96 96 0 8.8 7.2 16 16 16s16-7.2 16-16z"></path></svg>   

    
  
    let inputStyle={marginBottom:'0.5em',fontSize:'0.9em'};
    let config = this.props.config;
    return <div id="hermodreactmicrophone"   style={{zIndex:'9999'}}>
        {(!this.state.activated) && <span  onClick={this.activate}>{micOnIcon}</span>} 
        
        {(this.state.activated && this.state.sending) && <span onTouchStart={this.showConfig}  onTouchEnd={this.clearConfigTimer}   onMouseDown={this.showConfig} onMouseUp={this.clearConfigTimer} onContextMenu={this.showConfigNow} onClick={this.stopRecording}>{micOffIcon}</span>} 
        
        {(this.state.activated  && !this.state.sending) && <span onTouchStart={this.showConfig}  onTouchEnd={this.clearConfigTimer}   onMouseDown={this.showConfig} onMouseUp={this.clearConfigTimer} onContextMenu={this.showConfigNow} onClick={this.activate}>{micOnIcon}</span>} 
        
        {(this.state.showMessage ) && <div style={{position:'fixed', padding:'1em', borderRadius:'20px',backgroundColor:'skyblue',margin:'5%',width:'90%',top:'1.7em',color:'black',border:'2px solid blue',zIndex:'9999'}} >
                {this.state.lastTranscript && <div style={{fontStyle:'italic'}}>{this.state.lastTranscript}</div>}
                {false && this.state.lastIntent && <div>{this.state.lastIntent}</div>}
                {this.state.lastTts && <div>{this.state.lastTts}</div>}
            </div>} 
   
        <div id="audio"></div>
      
      </div>
     
  }
}

 
