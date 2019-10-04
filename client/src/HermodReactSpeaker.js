import React from 'react'
import {Component} from 'react'
import HermodReactComponent from './HermodReactComponent'

export default class HermodReactSpeaker extends HermodReactComponent  {

    constructor(props) {
        super(props);
        let that = this;
        
        if (!props.siteId || props.siteId.length === 0) {
            throw "Speaker must be configured with a siteId property";
        }
        this.playSound = this.playSound.bind(this);
        this.setVolume = this.setVolume.bind(this);
        this.state = {volume:.5}
        
        let eventFunctions = {
        // SESSION
            'hermod/+/speaker/play' : function(destination,siteId,audio) {
                if (siteId && siteId.length > 0) { // && siteId === that.props.siteId) {
                    that.sendMqtt("hermod/"+siteId+"/speaker/started",{}); 
						
                    that.playSound(audio).then(function(res) {
                        that.sendMqtt("hermod/"+siteId+"/speaker/finished",{}); 
					}); 
                }
            },
            'hermod/+/hotword/detected': function(topic,siteId,payload) {
                // quarter volume for 10 seconds
            }
        }
        
        this.logger = this.connectToLogger(props.logger,eventFunctions);
    }  
   
   
    setVolume(volume) {
        this.setState({volume:volume});
        if (this.gainNode) this.gainNode.gain.value = volume;
    };
    
    playSound(bytes) {
        let that = this;
        return new Promise(function(resolve,reject) {
            try {
				if (bytes && bytes.length > 0 && that.props.config && that.props.config.enableaudio !== "no") {
				var buffer = new Uint8Array( bytes.length );
				buffer.set( new Uint8Array(bytes), 0 );
				let audioContext = window.AudioContext || window.webkitAudioContext;
				let context = new audioContext();
				let gainNode = context.createGain();
				// initial set volume
					gainNode.gain.value = that.props.config && that.props.config.outputvolume/100 ? that.props.config.outputvolume/100 : 0.5;
				context.decodeAudioData(buffer.buffer, function(audioBuffer) {
						try {
							var source = context.createBufferSource();
							source.buffer = audioBuffer;
							source.connect(gainNode);
							gainNode.connect( context.destination );
							source.start(0);
							source.onended = function() {
								resolve();
							};
						} catch (e) {
							console.log(e)
							resolve()
						}
					});
				} else {
					resolve();
				}
			} catch (e) {
				console.log(e)
				resolve()
			}
        });                        
    }
    
    
    
    render() {
        return <span id="Hermodreactspeaker" ></span>
    };
}
