import React, { Component } from "react";
import { Menu, Container, Confirm } from 'semantic-ui-react'

class CastSelector extends Component {
  state = {
    prompt: false,
    activeCast: {}
  }

  show = (e) => {
    if (this.props.isSongSaved === false) {
      this.setState({ prompt: true, activeCast: e.target.id})
    }
    else {
      this.setState({ activeCast: e.target.id}, () => this.props.handleCast(this.state.activeCast))
    }
  }

  parseName = (song) => {
    // parsedName = `${song.user.name_first} ${song.user.name_last}`
    // parsedDate = song.date.toDateString()
    // return (`${parsedName} ${parsedDate}`)
    return 'test'
  }

  handleConfirm = () => this.setState({ prompt: false }, () => this.props.handleCast(this.state.activeCast))
  handleCancel = () => this.setState({ prompt: false })

    render() {
      const castList = this.props.castList
      const { prompt } = this.state
      const { activeItem } = this.state.activeCast

      if (this.props.castList.length > 0) {
        return (
          <div>
            <Container>
            <Menu secondary vertical>
              {castList.map((song, i) => {
                return (
                  <Menu.Item as='a' key={i} id={i} onClick={this.show} name={() => this.parseName(song)} active={activeItem === song}>
                    {song.title}
                  </Menu.Item>
                );
              })}

              <Confirm open={prompt} content='Save your new recording first?' cancelButton='Yes'
            confirmButton="No" size='mini' onCancel={this.handleCancel} onConfirm={this.handleConfirm} />

        </Menu>
            {/*castList.length > 0 ? <Divider /> : ''*/}
          </Container>
          </div>
        );
      } else {
        return (<div></div>)
      }
  }
};

export default CastSelector;
