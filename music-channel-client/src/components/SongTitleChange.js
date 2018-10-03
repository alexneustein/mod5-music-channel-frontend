import React, { Component } from "react";
import { Segment, Button, Modal } from 'semantic-ui-react'
import { Form } from 'formsy-semantic-ui-react'

class SongTitleChange extends Component {

  state = { changeTitleOpen: false }
  handleOpen = () => this.setState({ changeTitleOpen: true })
  onValidSubmit = (formData) => {
    this.setState({ changeTitleOpen: false })
    this.props.changeTitle(formData.title)
  }
    render() {
      if (this.props.currentSongTitle !== null) {
        return (
          <div>
            <h3>{this.props.currentSongTitle}
            <Modal size='mini' closeOnEscape={true} closeOnDimmerClick={true} closeOnDocumentClick={true} onClose={this.close}  open={this.state.changeTitleOpen} trigger={<Button onClick={this.handleOpen} size='mini' floated='right' compact basic>Rename</Button>}>
                <Modal.Header>Enter New Title</Modal.Header>
                  <Modal.Description>
                    <Segment vertical>
                    <Form
                      ref={ ref => this.form = ref }
                      onValidSubmit={ this.onValidSubmit }
                      >
                      <Form.Input focus
                      name="title"
                      value={this.props.currentSongTitle}
                      placeholder={this.props.currentSongTitle}
                      validations="isWords"
                      validationErrors={{
                        isWords: 'No numbers or special characters allowed',
                        isDefaultRequiredValue: 'Title is Required',
                      }}
                    />
                  <Button.Group>
                      <Button>Cancel</Button>
                      <Button.Or />
                      <Form.Button positive basic content="Submit" color="green"/>
                    </Button.Group>

              </Form>
            </Segment>
          </Modal.Description>
      </Modal></h3>
    <h5>{!!this.props.currentSongAuthor === true ? `played by ${this.props.currentSongAuthor.name_first} ${this.props.currentSongAuthor.name_last}` : ''}</h5>
          </div>
        )
      } else {
        return (
          <div></div>
        )
      }
    }
  }

export default SongTitleChange;
