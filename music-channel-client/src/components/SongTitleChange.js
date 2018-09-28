import React, { Component } from "react";
import { Button, Modal, Container } from 'semantic-ui-react'
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
            <Modal size='mini' open={this.state.changeTitleOpen} trigger={<Button onClick={this.handleOpen} basic color='blue' basic size='mini'>Change Title</Button>}>
                <Modal.Header>Enter New Title</Modal.Header>
                  <Modal.Description>
                    <Container>
                    <Form
                      ref={ ref => this.form = ref }
                      onValidSubmit={ this.onValidSubmit }
                      >
                    <Form.Group widths="equal">
                      <Form.Input focus
                      name="title"
                      placeholder={this.props.currentSongTitle}
                      validations="isWords"
                      validationErrors={{
                        isWords: 'No numbers or special characters allowed',
                        isDefaultRequiredValue: 'Title is Required',
                      }}
                    />
                </Form.Group>
                <Form.Group>
                  <Form.Button content="Submit" color="green"/>
                </Form.Group>
              </Form>
            </Container>
                  </Modal.Description>
              </Modal>
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
