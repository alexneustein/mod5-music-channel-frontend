import React, { Component } from 'react';
import { Button, Menu, Header, Icon, Segment } from 'semantic-ui-react'
// import pianoimage from './piano.jpg';

class Navbar extends Component {

   statusIcon = () => {
    switch (this.props.midiStatus) {
      case 'Piano Ready':
        return (<Icon color='green' name='checkmark' size='small' />)
      case 'MIDI Failure':
        return (<Icon color='red' name='exclamation circle' size='small' />)
      case ('Piano Not Found' || 'Piano Input Not Working' || 'Piano Output Not Working'):
        return (<Icon color='orange' name='exclamation triangle' size='small' />)
      default:
        return (<Icon color='violet' loading name='sync' size='small' />)
    }
  }

  render() {
    return (
      <div >
        <Menu>
          <Menu.Item>
            <Header as='h1'>
              <Icon name='music' size='huge' />
              <Header.Content>
                 PianoCast
                <Header.Subheader>Share your music</Header.Subheader>
              </Header.Content>
            </Header>
          </Menu.Item>
          <Menu.Item>
            <Menu.Header as='h4'>
              <Segment vertical>Welcome back, {this.props.currentUser.name_first} {this.props.currentUser.name_last}!</Segment>
            </Menu.Header>
          </Menu.Item>
          <Menu.Item position='right'>
            <Menu.Header>
              <Segment vertical>{this.statusIcon()} {this.props.midiStatus}</Segment>
              <Segment vertical>
                {/* PLAY CHIME */}
                {this.props.midiOutput ? <Button icon basic onClick={this.props.startChime}><Icon name='sound' />Test Chord</Button> : '' }
              </Segment>
            </Menu.Header>
          </Menu.Item>
        </Menu>

      </div>
    );
  }
}

export default Navbar;
