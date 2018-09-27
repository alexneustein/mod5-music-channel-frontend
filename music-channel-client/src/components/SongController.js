import React, { Component } from "react";

class SongController extends Component {
  render() {
    return (
      <div>
        <p>{this.props.currentsonglength < 2 ? '' : <span><button onClick={this.props.makeLouder}>MAKE LOUDER</button>      <button onClick={this.props.makeSofter}>Make softer</button></span>}</p>
        <p>{this.props.currentsonglength < 2 ? '' : <span><button onClick={() => this.props.changeTempo(.77)}>Play Faster</button>      <button onClick={() => this.props.changeTempo(1.3)}>Play Slower</button></span>}</p>
        <p>{this.props.currentsonglength < 2 ? '' : <span><button onClick={() => this.props.transposeSong(1)}>Transpose Up</button>      <button onClick={() => this.props.transposeSong(-1)}>Transpose Down</button></span>}</p>
        <p>{this.props.currentsonglength < 2 ? '' : <button onClick={this.props.resetSong}>Undo All Changes</button>}</p>
      </div>
    )
  }
}

export default SongController;
