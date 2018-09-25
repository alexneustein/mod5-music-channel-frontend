import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import WebMidi from '../node_modules/webmidi/webmidi.min';

class App extends Component {
  state = {
    originalsong: [],
    currentsong: [[176, 64, 0, 1]],
    midiEnabled: false,
    midiAccess: null,
    midiInput: null,
    midiOutput: null,
    recording: false,
    playing: false,
    pageLoaded: 0
  }

  componentDidMount() {
    let timingInfo = new Date().valueOf()-800
    this.setState({
      pageLoaded: timingInfo
    }, () => {this.requestMIDI()})
  }

  startChime = ( outputdevice ) => {
    if (outputdevice.name === undefined) {
      outputdevice = this.state.midiOutput
    }
    const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded
    outputdevice.send( [ 0x90, 0x48, 0x50 ], msSinceLoad+0 );
    outputdevice.send( [ 0x90, 0x4C, 0x50 ], msSinceLoad+101 );
    outputdevice.send( [ 0x90, 0x4F, 0x50 ], msSinceLoad+201 );
    outputdevice.send( [ 0x90, 0x54, 0x50 ], msSinceLoad+301 );
    outputdevice.send( [ 0x90, 0x48, 0x00 ], msSinceLoad+600 );
    outputdevice.send( [ 0x90, 0x4C, 0x00 ], msSinceLoad+601 );
    outputdevice.send( [ 0x90, 0x4F, 0x00 ], msSinceLoad+602 );
    outputdevice.send( [ 0x90, 0x54, 0x00 ], msSinceLoad+603 );
  }

  requestMIDI = () => {
    if (this.state.midiEnabled) {
        console.log('MIDI already enabled!')
        this.getMIDIIO(this.state.midiAccess)
      } else {
        console.log('MIDI not yet enabled. Enabling...')
        navigator.requestMIDIAccess()
        .then(this.onMIDISuccess, this.onMIDIFailure);
      }
    }

  onMIDISuccess = (midiAccess) => {
    console.log('MIDI enabled!')
    this.setState({
      midiEnabled: true,
      midiAccess: midiAccess
    }, () => {this.getMIDIIO(midiAccess)})
  }

  getMIDIIO = (midiAccess) => {
    var inputs = midiAccess.inputs;
    var outputs = midiAccess.outputs;
    // for (var output of outputs.values()) {
    //   console.log(output);
    // }
    // ****Keyboard Select if time permits
    let outputdevice
    let inputdevice
    for (var output of outputs.values()) {
      if ((output.name === 'USB2.0-MIDI Port 1') || (output.name === 'P115 Digital Piano')) {
        outputdevice = output
      }
    }
    for (var input of inputs.values()) {
        if ((input.name === 'USB2.0-MIDI Port 1') || (input.name === 'P115 Digital Piano')) {
          inputdevice = input
        }
    }
    this.setState({
      midiInput: inputdevice,
      midiOutput: outputdevice
    }, () => {this.startChime(outputdevice)})
  }

  recordSong = () => {
    this.setState({
      recording: true,
      currentsong: [[176, 64, 0, 1]],
      originalsong: []
    })
    const inputdevice = this.state.midiInput
    inputdevice.onmidimessage = (message) => {
      if (this.state.recording) {
        switch (message.data[0]) {
          case 144:
            let noteArray = [144, message.data[1], message.data[2], Math.round(message.timeStamp)]
            console.log(noteArray);
            this.setState({
              currentsong: [...this.state.currentsong, noteArray]
            })
            break;
          case 176:
            let pedalArray = [176, message.data[1], message.data[2], Math.round(message.timeStamp)]
            console.log('PEDAL: ', pedalArray);
            this.setState({
              currentsong: [...this.state.currentsong, pedalArray]
            })
            break;
          case 254:
            break;
          case 248:
            break;
          default:
            console.log('Command: ', message.data[0]);
            break;
        }
      }
    }
  }

  stopRecord = () => {
    this.setState({
      recording: false,
    }, this.adjustStartTime)
  }

  getSongFromState = (arg) => {
    let adjustedSong = []
    for (const note of arg) {
      let noteCopy = [...note]
      adjustedSong = [...adjustedSong, noteCopy]
    };
    return adjustedSong;
  }

  adjustStartTime = () => {
    let adjustedSong = this.getSongFromState(this.state.currentsong)
    let adjustStartTimeBy = adjustedSong[1][3] - 2;
    for (const note of adjustedSong) {
      note[3] = note[3] - adjustStartTimeBy;
    }
    adjustedSong[0][3] = 1
    this.setState({
      currentsong: adjustedSong
    }, this.adjustPedalBug)
  }

  adjustPedalBug = () => {
    let adjustedSong = this.getSongFromState(this.state.currentsong)
    for (const note of adjustedSong) {
      if (note[0] === 144 && note[1] === 64 && note[2] === 127) {
        note[0] = 176
      }
    }
    this.setState({
      currentsong: adjustedSong,
      originalsong: adjustedSong
    })
  }

  resetSong = () => {
    let resetSong = this.getSongFromState(this.state.originalsong)
    this.setState({
      currentsong: resetSong
    })
  }


  makeLouder = () => {
    let louderSong = this.getSongFromState(this.state.currentsong)
    for (const note of louderSong) {
      if (note[0] === 144) {
        note[2] = Math.round(Math.sqrt(127) * Math.sqrt(note[2]))
      }
    }
    this.setState({
      currentsong: louderSong
    })
  }

  makeSofter = () => {
    let softerSong = this.getSongFromState(this.state.currentsong)
    for (const note of softerSong) {
      if (note[0] === 144) {
        note[2] = Math.round(note[2] / 1.3)
      }
    }
    this.setState({
      currentsong: softerSong
    })
  }

  changeTempo = (float) => {
    let changedSong = this.getSongFromState(this.state.currentsong)
    for (const event of changedSong) {
        event[3] = Math.round(event[3] * float)
    }
    this.setState({
      currentsong: changedSong
    })
  }

  transposeSong = (arg) => {
    let changedSong = this.getSongFromState(this.state.currentsong)
    for (const note of changedSong) {
      if (note[0] === 144) {
        note[1] = note[1] + arg
      }
    }
    this.setState({
      currentsong: changedSong
    })
  }

  playSong = () => {
    if (this.state.playing === false) {
      let theSong = this.getSongFromState(this.state.currentsong)
      this.setState({
        playing: true
      }, () => {
        const outputdevice = this.state.midiOutput
        const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded
        for (const note of theSong) {
          outputdevice.send( [ note[0], note[1], note[2] ], msSinceLoad+note[3] );
        }
      })
      let theduration = theSong[theSong.length - 1][3];
      window.setTimeout(() => {
        this.setState({
          playing: false
        })
      }, theduration)
    }
  }

  onMIDIFailure = () => {
      console.log('Could not access your MIDI devices.');
  }


  render() {
    let storage = "<p>{this.state.midiEnabled ?  'MIDI IS ON' : <button onClick={this.requestMIDI}>Turn On Midi</button>}</p>"
    return (

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Song Recorder</h1>
        </header>

        <p>{this.state.midiEnabled ? <button onClick={this.startChime}>Play Chime</button> : '' }</p>
        <p>{this.state.midiEnabled ? (this.state.recording ? <button onClick={this.stopRecord}>STOP Record</button> : <button onClick={this.recordSong}>START Record</button>) : ''}</p>
        <p>{this.state.currentsong.length < 2 ? '' : <button onClick={this.playSong}>PLAY Song</button>}</p>
        <p>{this.state.currentsong.length < 2 ? '' : <span><button onClick={this.makeLouder}>MAKE LOUDER</button>      <button onClick={this.makeSofter}>Make softer</button></span>}</p>
        <p>{this.state.currentsong.length < 2 ? '' : <span><button onClick={() => this.changeTempo(.77)}>Play Faster</button>      <button onClick={() => this.changeTempo(1.3)}>Play Slower</button></span>}</p>
        <p>{this.state.currentsong.length < 2 ? '' : <span><button onClick={() => this.transposeSong(1)}>Transpose Up</button>      <button onClick={() => this.transposeSong(-1)}>Transpose Down</button></span>}</p>
        <p>{this.state.currentsong.length < 2 ? '' : <button onClick={this.resetSong}>Undo All Changes</button>}</p>
      </div>
    );
  }
}

export default App;
