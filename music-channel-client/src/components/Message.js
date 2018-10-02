import React from 'react';
import { Button, Comment, Form } from 'semantic-ui-react'

const Message = (props) => {
console.log('Message Component props: ',props);
    return (
        <div>
          <Comment.Group size='mini'>
              <Comment>
                <Comment.Content>
                  <Comment.Author as='a'>{props.currentUser.name_first} {props.currentUser.name_last}</Comment.Author>
                  <Comment.Metadata>
                    <div>{props.currentUser.username}</div>
                  </Comment.Metadata>
                  <Comment.Text>{props.content.content}</Comment.Text>

                </Comment.Content>
              </Comment>
            </Comment.Group>
        </div>
    )
}

export default Message
