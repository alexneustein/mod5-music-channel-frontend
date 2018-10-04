import React, { Component } from "react";
import { Menu, Container, Confirm } from 'semantic-ui-react'

class CastSelector extends Component {
  state = {
    prompt: false,
    activeCast: {}
  }

  show = (e) => {
    console.log(e.target);
    if (this.props.isSongSaved === false) {
      this.setState({ prompt: true, activeCast: this.props.castList[e.target.id]})
    }
    else {
      this.setState({ activeCast: this.props.castList[e.target.id]}, () => this.props.handleCast(this.state.activeCast))
    }
  }

  parseName = (song) => {
    const parsedName = `${song.content[0][2]} - ${song.user.name_first} ${song.user.name_last}`
    return (parsedName)
  }

  parseDate = (song) => {
    const parsedDate = `${song.date.toDateString()}, ${song.date.toLocaleTimeString()}`
    return parsedDate
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
                  <Menu.Item as='a' key={i} id={i} onClick={this.show} name={this.parseName(song)} active={activeItem === song}>
                    {this.parseName(song)} - {this.parseDate(song)}
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
