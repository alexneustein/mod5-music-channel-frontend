import React, { Component } from "react";
import { Divider } from 'semantic-ui-react'


class SongController extends Component {
  render() {
    if ((this.props.isRecording === false ) && (this.props.currentsonglength > 1)) {
      return (
        <div>
          <Divider />
          <p>{this.props.isPlaying === true ? <button disabled>Song Is Playing</button> : <button onClick={this.props.playSong}>PLAY Song</button>}</p>
          <p><button onClick={this.props.makeLouder}>MAKE LOUDER</button>      <button onClick={this.props.makeSofter}>Make softer</button></p>
          <p><button onClick={() => this.props.changeTempo(.77)}>Play Faster</button>      <button onClick={() => this.props.changeTempo(1.3)}>Play Slower</button></p>
          <p><button onClick={() => this.props.transposeSong(1)}>Transpose Up</button>      <button onClick={() => this.props.transposeSong(-1)}>Transpose Down</button></p>
          <p><button onClick={this.props.resetSong}>Undo All Changes</button></p>
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
