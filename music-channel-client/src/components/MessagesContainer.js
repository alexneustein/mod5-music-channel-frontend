import React, { Component } from "react";
import ChatInput from './ChatInput'
import Message from './Message'

export default class MessagesContainer extends Component {

  render() {
    console.log('this.props.messages: ',this.props.messages)
    return (
      <div>
        <div>Messages</div>
        <div>
        {this.props.messages.map((messageBody, i) => [
          <Message key={i} content={messageBody} currentUser={this.props.currentUser} />
        ])}
      </div>
        <ChatInput handleInput={this.props.handleInput} messageValue={this.props.messageValue} createMessage={this.props.createMessage} sendMessage={this.props.sendMessage} currentUser={this.props.currentUser}/>
        {/* <h1>Messages</h1> */}
      </div>
    )
  }
}
