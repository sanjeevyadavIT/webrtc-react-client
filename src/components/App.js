import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './Dashboard';
import VideoChat from './VideoChat';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      loggedIn: false,
      users: [],
      call: {
        status: false,

      }
    }
  }

  componentDidMount() {
    this.connection = new WebSocket('ws://webrtc29.herokuapp.com');
    this.connection.onopen = () => console.log('Connection Established!');
    this.connection.onmessage = (message) => {
      console.log('Message received!', message);
      this.handleMessage(message);
    }
  }

  parseMessage(message) {
    try {
      return JSON.parse(message.data);
    } catch (e) {
      console.log('enable to parse JSON');
      return {};
    }
  }

  handleMessage(message) {
    const data = this.parseMessage(message);
    switch (data.type) {
      case 'all_user':
        this.setState({ users: data.names });
        break;
      case 'new_user':
        this.setState({ users: [...this.state.users, data.name] })
        break;
      case 'login':
        this.setState({ loggedIn: data.success || false });
        break;
      case 'offer':
        this.call(this.state.username, data.from, data.from, data.offer);
        break;
      case 'answer':
        this.call(this.state.username, data.from, this.state.username, null, data.answer);
        break;
      case 'candidate':
          this.call(this.state.username, data.from, this.state.from, null, null, data.candidate);
          break;
      default:
        console.log('Unknown action ' + data.type);
    }
  }

  call(localUser, remoteUser, originalCaller, offer, answer, candidate) {
    this.setState({
      call: {
        status: true,
        localUser: localUser,
        remoteUser: remoteUser,
        originalCaller,
        offer,
        answer,
        candidate,
      }
    })
  }

  hangup() {
    this.setState({
      call: {
        status: false
      }
    })
  }

  sendMessage(message) {
    this.connection.send(JSON.stringify(message));
  }


  login() {
    const { username } = this.state;
    if (username === '') return;

    const payload = {};
    payload.type = 'login';
    payload.name = username;
    this.connection.send(JSON.stringify(payload));
  }

  render() {
    const { username, loggedIn, call } = this.state;
    if (loggedIn) {
      if (call.status) {
        return (
          <VideoChat
            localUser={call.localUser}
            remoteUser={call.remoteUser}
            originalCaller={call.originalCaller}
            offer={call.offer}
            answer={call.answer}
            candidate={call.candidate}
            hangup={this.hangup.bind(this)}
            sendMessage={this.sendMessage.bind(this)}
          />
        );
      } else {
        return <Dashboard currentUser={username} users={this.state.users} call={this.call.bind(this)} />
      }
    }

    return (
      <div>
        <input type="text" value={username} onChange={(e) => this.setState({ username: e.target.value })} />
        <button onClick={this.login.bind(this)}>Login</button>
      </div>
    );
  }

}

export default App;
