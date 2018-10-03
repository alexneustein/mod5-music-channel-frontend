import React from 'react';
import { Form } from 'semantic-ui-react'

export default class ChatInput extends React.Component{

  handleEnter = (e) => {
    if(e.key === 'Enter'){
      this.props.sendMessage(e)
    }
  }

  render () {
    return (
        <div>
          <Form onSubmit={this.props.sendMessage}>
          <Form.Input name='Message' placeholder='Type your message here...' type='text' value={this.props.messageValue} onSubmit={this.props.sendMessage} onChange={this.props.handleInput}/>
          <Form.Button basic onSubmit={this.props.sendMessage}>Send</Form.Button>
          </Form>
        </div>
    )
  }
}
