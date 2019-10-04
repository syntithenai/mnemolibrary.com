/* global navigator */
import React from 'react'
import {Component} from 'react'
// Polyfill: mediaDevices.
// Not work on Desktop Safari, IE.
// Not work on Mobile browsers.

let nav = {};
nav.mediaDevices = function() {
    if (navigator.mediaDevices) {
        return navigator.mediaDevices;
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        return {
            getUserMedia: function (c) {
                return new Promise(function(y, n) {
                        navigator.getUserMedia.call(navigator, c, y, n);
                    }
                );
            }
        }
    }
}();
if (!nav.mediaDevices) {
    alert("mediaDevices() not supported.");
    throw new Error("mediaDevices() not supported.")
}

// Polyfill: AudioContext.
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

export default class AudioMeter extends Component {

    constructor (props) {
        super(props);
        this.state = {
            volume: 10,
            debug: false
        };
        this.canvas = React.createRef();
    }

    componentDidMount () {
		let that = this;
        // Processing.
        var process = function (event) {
            var buf = event.inputBuffer.getChannelData(0);
            var sum = 0;
            var x;

            for (var i = 0; i < buf.length; i++) {
                x = buf[i];
                sum += x * x;
            }

            var rms = Math.sqrt(sum / buf.length);
            that.setState({
                volume: (Math.max(rms, that.state.volume * that.averaging) )
            });
            if (that.state.volume > (that.props.volumeWarning > 0 ? that.props.volumeWarning : 0.25)) that.canvasCtx.fillStyle =  that.props.style.tooLoudColor ? that.props.style.tooLoudColor  : '#FF0000';
            else that.canvasCtx.fillStyle =  that.props.style.color ? that.props.style.color  : '#00FF48';
            that.canvasCtx.clearRect(0, 0, that.canvasCtx.canvas.width, that.canvasCtx.canvas.height);
            that.canvasCtx.fillRect(0, that.canvasCtx.canvas.height * (1 - (that.state.volume * 4)), that.canvasCtx.canvas.width, that.canvasCtx.canvas.height);

        }.bind(this);

        // Init processing.
        nav.mediaDevices.getUserMedia(
            {
                audio: true
            }
        ).then(function(stream) {
			    var audioCtx = new AudioContext();
                var source = audioCtx.createMediaStreamSource(stream);
                var processor = audioCtx.createScriptProcessor(256);
                let gainNode = audioCtx.createGain();
                gainNode.gain.value = that.props.inputvolume > 0 ? that.props.inputvolume/100 : 0.5;
                that.averaging = 0.95;
                that.canvasCtx = that.canvas.current.getContext('2d');
                that.canvasCtx.fillStyle = that.props.style.color ? that.props.style.color  : '#00FF48';

                processor.onaudioprocess = process;
                processor.connect(audioCtx.destination);
                gainNode.connect(processor);
                source.connect(gainNode);
                if (that.props.addInputGainNode) that.props.addInputGainNode(gainNode);
            }.bind(this)
        ).catch(function(err){
                console.log('Error occurred while initalizing audio input: ' +  err.toString());
            });
    }


    render () {
		let that = this;
        let canvasStyle = this.props.style ? Object.assign({},this.props.style) : {};
        canvasStyle.height = this.props.style.height > 0 ? this.props.style.height : 78;
        canvasStyle.width = this.props.style.width > 0 ? this.props.style.width : 30;
        return (
                <canvas style={canvasStyle} ref={that.canvas} width={canvasStyle.width} height={canvasStyle.height}></canvas>
            
        );
    }
};
