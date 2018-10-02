import React from 'react';
import { Button, Comment, Form } from 'semantic-ui-react'

const Message = (props) => {
    return (
        <div>
          <Comment.Group size='mini'>
              <Comment>
                <Comment.Content>
                  <Comment.Author as='a'>{props.message.user.name_first} {props.message.user.name_last}</Comment.Author>
                  <Comment.Metadata>
                    <div>{props.message.user.username}</div>
                  </Comment.Metadata>
                  <Comment.Text>{props.message.content}</Comment.Text>

                </Comment.Content>
              </Comment>
            </Comment.Group>
        </div>
    )
}

export default Message
