import React, { Component } from "react";
import { Icon, Segment, Dimmer, Loader, Button, Divider, Progress } from 'semantic-ui-react'


class SongController extends Component {

  loaderLogic = () => {
    if (this.props.isRecording) {
      return (
          <Dimmer active>
            <Loader color='red' inline indeterminate>Recording MIDI</Loader>
          </Dimmer>
      )
    }
  }


  render() {

    let counterObj = this.props.counterObj
    if ((this.props.isRecording) && (this.props.currentsonglength < 2)) {
      return (
        <Segment color='red'><Icon name='hand paper' circular flipped='horizontally' size='big' color='purple' /><Icon name='hand paper' circular size='big' color='purple' /><h3>Start Playing!</h3></Segment>
      )
    }
    if (this.props.currentsonglength > 1) {
      return (
        <Segment>
          {this.loaderLogic()}
          <Divider />
          <Progress progress='ratio' percent={counterObj.percent} value={counterObj.currenttext} total={counterObj.totaltext} indicating />
          <Segment vertical><Button compact attached='left' basic onClick={this.props.makeLouder}><Icon name='volume up' size='small' color='grey' />MAKE LOUDER</Button>      <Button compact attached='right' basic onClick={this.props.makeSofter}><Icon name='volume down' size='small' color='grey' />Make softer</Button></Segment>
          <Segment vertical><Button compact basic onClick={() => this.props.changeTempo(.77)}>Play Faster</Button>      <Button compact basic onClick={() => this.props.changeTempo(1.3)}>Play Slower</Button></Segment>
          <Segment vertical><Button compact basic onClick={() => this.props.transposeSong(1)}>Transpose Up</Button>      <Button compact basic onClick={() => this.props.transposeSong(-1)}>Transpose Down</Button></Segment>
          <Segment vertical><Button compact basic onClick={this.props.resetSong}>Undo All Changes</Button></Segment>
        </Segment>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}

export default SongController;
