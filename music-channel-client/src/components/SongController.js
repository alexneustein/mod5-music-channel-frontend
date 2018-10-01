import React, { Component } from "react";
import { Button, Divider, Progress } from 'semantic-ui-react'


class SongController extends Component {

  // componentDidMount() {
  // }
  //
  // setDurationState = () => {
  //   let theduration = this.secondsToTime(this.props.currentSongDuration)
  //   this.setState({
  //     counterDuration: theduration
  //   })
  // }






  render() {

    let counterObj = this.props.counterObj

    if ((this.props.isRecording === false ) && (this.props.currentsonglength > 1)) {
      return (
        <div>
          <Divider />
          <Progress percent={this.props.counterObj.percent} value={this.props.counterObj.currenttext} total={this.props.counterObj.totaltext} progress='ratio' indicating />
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
