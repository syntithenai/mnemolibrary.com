
import React from 'react'
import HermodReactComponent from './HermodReactComponent'

export default class HermodAppServer extends HermodReactComponent {

    constructor(props) {
        super(props);
        let that = this;
        this.state={};
         let eventFunctions = {
        // SESSION
            'hermod/intent/#' : function(payload,message) {
                let parts = message.destinationName ? message.destinationName.split("/") : [];
                if (parts.length > 0 && parts[0] === "hermod") {
                    if (parts.length > 1 &&  parts[1] === "intent") {
                        let payload = {};
                        let intent = parts[2];
                        if (intent && intent.length > 0) {
                            try {
                                payload = JSON.parse(message.payloadString);
                                if (that.props.intents && that.props.intents.hasOwnProperty(intent) && that.props.intents[intent]) {
                                    let p = that.props.intents[intent].bind(that)(payload);
                                    if (p && p.then) {
                                        p.then(function(v) {
                                            that.sendEndSession.bind(that)(payload.sessionId);
                                        }).catch(function(v) {
                                            that.sendEndSession.bind(that)(payload.sessionId);
                                        });
                                    } else {
                                        that.sendEndSession.bind(that)(payload.sessionId);
                                    }
                                    
                                    
                                } else {
                                   that.sendEndSession.bind(that)(payload.sessionId);
                                }
                                
                            } catch (e) {
                            }                    
                        } else {
                        }
                    }
                }
                      
            }
        }
        
        this.logger = this.connectToLogger(props.logger,eventFunctions);
     }   
    
    
    cleanSlots(slots) { 
        let final={};
        if (slots) {
            slots.map(function(slot) {
                final[slot.slotName] = {type:slot.value.kind,value:slot.value.value}
                return null;
            });
        }
        return final;
    };
       

    render() {
        return <span id="Hermodreactappserver" ></span>
    };
}
