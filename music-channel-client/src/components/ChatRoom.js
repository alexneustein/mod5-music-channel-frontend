import React, { Component } from "react";
import { ActionCable } from 'react-actioncable-provider'

import MessagesContainer from './MessagesContainer'


// import { Button, Divider, Progress } from 'semantic-ui-react'

const RAILS_URL = "http://localhost:3001/"

class ChatRoom extends Component {
  state = {
    user: {},
    message: '',
    messages: []
  }

  componentDidMount(){
    fetch(`${RAILS_URL}/users/1`)
      .then(r=>r.json())
      .then(resp => {
        this.setState({
          user: resp,
          messages: resp.messages
        })
      }
      )
  }

  openConnection = () => {
    return new WebSocket("ws://localhost:3001/cable")
    // return new WebSocket("ws://10.39.104.225:3000/cable")
    // return new WebSocket("wss://flatironchatterbox-api.herokuapp.com/cable")
  }

  onReceived = (e) => {
    console.log('e.message.message', e.message.message);
    if(e.message.message){
      this.createMessage(e.message.message)
    } else {
      this.createMessage(e)
    }
  }

  createMessage = (message) => {
    this.setState(prevState => ({
      messages: [...prevState.messages, message]
    }))
  }

  sendMessage = (userobject) => {
    const postUser = () => {
      if(this.props.currentUser.username){
        return this.props.currentUser
      } else {
        return {username: `Anonymous`}
      }
    }
    console.log('userobject.user: ',userobject.user);

    if(userobject.user){
      this.refs.RoomChannel.perform('onChat', {userobject})
    } else {
      const postMessage = this.state.message
      const message = {user: postUser(), content: postMessage}
      this.refs.RoomChannel.perform('onChat', {message})
      this.setState({message: ''})
    }

  }

  handleInput = (event) => {
    console.log('event: ',event)
    console.log('event.type: ',event.type)
    console.log('event.target: ',event.target)
    console.log('event.target.value: ',event.target.value)
      if(event.keyCode == 13){
        this.sendMessage()
      }
      if(event.message){
        this.setState(event)
      } else {
      const value = event.target.value
      this.setState({message: value})
    }
  }

  render() {
      return (
        <div>
          <ActionCable
            ref='RoomChannel'
            channel={{channel: 'RoomChannel'}}
            onReceived={this.onReceived}
           />
         <MessagesContainer
           onReceived={this.onReceived}
           messageValue={this.state.message}
           sendMessage={this.sendMessage}
           handleInput={this.handleInput}
           createMessage={this.createMessage}
           messages={this.state.messages}
           currentUser={this.props.currentUser}
           />
        </div>
      )
  }
}

export default ChatRoom;
