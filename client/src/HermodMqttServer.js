var mqtt = require('mqtt')

export default class HermodMqttServer {

    constructor(props) { 
		this.props = props;
        this.failCount = 0;
        this.mqttClient = null;
        this.sessionId = null;
        this.clientId = props.clientId ? props.clientId :  'client'+parseInt(Math.random()*100000000,10);
        this.state={};
        this.connectTimeout = null;
        this.started = false;
        this.onMessageArrived = this.onMessageArrived.bind(this);
        this.onConnect = this.onConnect.bind(this);
        //this.onConnectionLost = this.onConnectionLost.bind(this);
        this.mqttConnect = this.mqttConnect.bind(this);       
     }   
     
     setState(newState) {
         return Object.assign(this.state,newState);
     };

    start() {
        this.started = true;
        this.mqttConnect() ;
    };
    
    stop() {
        this.started = false;
        if (this.mqttClient) this.mqttClient.end() ;
    };
      
        
   /**
     * Connect to mqtt server
    */
    mqttConnect() {
		let that = this
        let port = this.props.mqttPort && this.props.mqttPort > 0 ? parseInt(this.props.mqttPort,10) : 9001
        let server = this.props.mqttServer && this.props.mqttServer.length > 0 ? this.props.mqttServer : (this.state.mqttServer && this.state.mqttServer.length > 0 ? this.state.mqttServer :  'ws://'+window.location.hostname+':'+port) ;
        
        
		this.mqttClient  = mqtt.connect(server,{username:this.props.username,password:this.props.password}) //host:server,port:port,
		 
		this.mqttClient.on('connect', this.onConnect)
		this.mqttClient.on('error', console.error)
		this.mqttClient.on('offline', console.log)
		this.mqttClient.on('reconnect', console.log)
		this.mqttClient.on('close', console.log)
		this.mqttClient.on('end', console.log)
		this.mqttClient.on('packetsend', console.log)
		this.mqttClient.on('packetreceive', console.log)
		this.mqttClient.on('message',function(topic,message) {   that.onMessageArrived(topic,message) });
		 
    };
        
    /**
     * Subscribe to to mqtt channels then start recorder
     */
    onConnect(err) {
		if (err) console.log(['CONNECT ERROR',err])
      let that = this;
      this.setState({'connected':true});
      this.failCount = 0;
      if (this.props.subscribe && this.props.subscribe.length  > 0) { 
		  
		that.mqttClient.subscribe(this.props.subscribe,function(err) {
		   if (err) console.log(['SUBSCRIBE ERROR',err])
		   that.afterConnect(that);  
		});
	  }
    } 
    
    afterConnect() {
    };
 
    /**
     * When the client loses its connection, reconnect after 5s
     */ 
    //onConnectionLost(responseObject) {
        //let that = this;
        //this.setState({'connected':false});
        //if (responseObject.errorCode !== 0) {
            //console.log(["  SERVER onConnectionLost:"+responseObject.errorMessage]);
            //if (this.props.onConnectionLost && typeof this.props.onConnectionLost === "function") {
                //this.props.onConnectionLost(this);
            //} else {
                //let timeout=1000;
                //if (this.failCount > 5) {
                    //timeout=10000;
                //} else if (this.failCount > 10) {
                    //timeout=30000;
                //} else if (this.failCount > 15) {
                    //timeout=360000;
                //}
                //this.failCount++;
                //clearTimeout(this.connectTimeout);
                //this.connectTimeout = setTimeout(function() {
                  //that.mqttClient.connect({onSuccess:that.onConnect});  
                //},timeout)                
            //}
        //}

    //}
    //;
    
    
    // respond to hermod/hotword/toggleOn or toggleOff where the siteId matches props.siteId
    onMessageArrived(topic,message) {
       // console.log(['IMPLEMENT ONMESSAGE',message]);
    }
    
}
