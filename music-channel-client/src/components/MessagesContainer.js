import React, { Component } from "react";
import ChatInput from './ChatInput'
import Message from './Message'
import { Comment, Header } from 'semantic-ui-react'


export default class MessagesContainer extends Component {

  render() {
    console.log('this.props.messages: ',this.props.messages)
    return (
      <div>
        <Comment.Group>
        <Header as='h3' dividing>
          Messages
        </Header>

        <div>
        {this.props.messages.map((messageBody, i) => [
          <Message key={i} message={messageBody} />
        ])}
        </div>
        <ChatInput handleInput={this.props.handleInput} messageValue={this.props.messageValue} createMessage={this.props.createMessage} sendMessage={this.props.sendMessage} currentUser={this.props.currentUser}/>
        {/* <h1>Messages</h1> */}
      </Comment.Group>
      </div>
    )
  }
}
