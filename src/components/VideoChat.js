import React from 'react';

class VideoChat extends React.Component {
    constructor(props) {
        super(props);
        this.localVideoref = React.createRef();
        this.remoteVideoref = React.createRef();
        this.pc = null;
        this.createOffer = this.createOffer.bind(this);

        this.state = {
            receivedAnswerFirstTime: true,
            receivedCandidateFirstTime: true,
            candidate: null,
        }
    }

    componentDidMount() {
        console.log('cdm');
        const constraints = { video: true, audio: true };
        const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

        this.pc = new RTCPeerConnection(configuration);

        this.pc.onicecandidate = (event) => {
            console.log('onicecandidate')
            if (event.candidate){
                console.log(JSON.stringify(event.candidate));
                if(!this.state.candidate && this.props.originalCaller === this.props.localUser){
                    this.setState({
                        candidate: event.candidate,
                    })
                }
            }
        }

        this.pc.oniceconnectionstatechange = (event) => {
            console.log('oniceconnectionstatechange')
            console.log(event);
        }

        this.pc.onaddstream = (event) => {
            this.remoteVideoref.current.srcObject = event.stream;
        }

        const success = (stream) => {
            this.localVideoref.current.srcObject = stream;
            //stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
            this.pc.addStream(stream);
            if(this.props.originalCaller === this.props.localUser)
                this.createOffer();
            else if(this.props.offer){
                console.log('setting offer as remoteDescription and generating answer')
                this.setRemoteDescription(this.props.offer);
                this.createAnswer();
            }
        }

        const failure = (e) => {
            console.log('get userMedia error', e);
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(success)
            .catch(failure);
    }

    componentDidUpdate(){
        if(this.props.answer && this.state.receivedAnswerFirstTime){
            console.log('Setting Answer ')
            this.setRemoteDescription(this.props.answer)
            this.props.sendMessage({
                type: 'candidate',
                to: this.props.remoteUser,
                from: this.props.localUser,
                candidate: this.state.candidate,
            })
            this.setState({
                receivedAnswerFirstTime: false,
            })
        } else if(this.props.candidate && this.state.receivedCandidateFirstTime) {
            console.log('Setting candidate');
            this.setRemoteDescription(this.props.candidate);
        }
    }

    createOffer() {
        console.log('offer');
        console.log(this.pc);
        this.pc.createOffer({ offerToReceiveVideo: 1, offerToReceiveAudio: 1})
            .then(sdp => {
                console.log(JSON.stringify(sdp))
                this.pc.setLocalDescription(sdp);
                this.props.sendMessage({
                    type: 'offer',
                    to: this.props.remoteUser,
                    from: this.props.localUser,
                    offer: sdp,
                });
            })
            .catch(error => {
                console.log('Unable to offer error', error);
            })
    }

    setRemoteDescription(desc) {
        this.pc.setRemoteDescription(new RTCSessionDescription(desc));
    }

    createAnswer () {
        console.log('answer')
        this.pc.createAnswer({offerToReceiveVideo: 1, offerToReceiveAudio: 1})
        .then(sdp=>{
            console.log(JSON.stringify(sdp));
            this.pc.setLocalDescription(sdp);
            this.props.sendMessage({
                type: 'answer',
                to: this.props.remoteUser,
                from: this.props.localUser,
                answer: sdp,
            });
        })
    }

    addCandidate(candidate) {
        console.log('adding candidate');
        this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    render() {
        const {
            /**
             * local user name
             */
            localUser,
            /**
             * remote user name
             */
            remoteUser,
            /**
             * hangup
             */
            hangup
        } = this.props;
        console.log('++++++++++++++++++++++++++')
        console.log(this.props);
        return (
            <div>
                <div style={{ display: 'flex' }}>
                    <div>
                        <video style={{ width: 240, height: 240, margin: 5, backgroundColor: 'black ' }} ref={this.localVideoref} autoPlay></video>
                        <p>You</p>
                    </div>
                    <div>
                        <video style={{ width: 240, height: 240, margin: 5, backgroundColor: 'black ' }} ref={this.remoteVideoref} autoPlay></video>
                        <p>{remoteUser}</p>
                    </div>
                </div>
                <button onClick={hangup}>Hangup</button>
            </div >
        );
    }
}

export default VideoChat;




