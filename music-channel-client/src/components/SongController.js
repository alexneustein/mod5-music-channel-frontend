import React, { Component } from "react";
import { Button, Divider } from 'semantic-ui-react'


class SongController extends Component {
  render() {
    if ((this.props.isRecording === false ) && (this.props.currentsonglength > 1)) {
      return (
        <div>
          <Divider />
          <p>{this.props.isPlaying === true ? <Button basic disabled>Song Is Playing</Button> : <Button basic onClick={this.props.playSong}>PLAY Song</Button>}</p>
          <p><Button basic onClick={this.props.makeLouder}>MAKE LOUDER</Button>      <Button basic onClick={this.props.makeSofter}>Make softer</Button></p>
          <p><Button basic onClick={() => this.props.changeTempo(.77)}>Play Faster</Button>      <Button basic onClick={() => this.props.changeTempo(1.3)}>Play Slower</Button></p>
          <p><Button basic onClick={() => this.props.transposeSong(1)}>Transpose Up</Button>      <Button basic onClick={() => this.props.transposeSong(-1)}>Transpose Down</Button></p>
          <p><Button basic onClick={this.props.resetSong}>Undo All Changes</Button></p>
        </div>
      )
    } else {
      return (
        <div></div>
      )
    }
  }
}

export default SongController;
