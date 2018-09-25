import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import WebMidi from '../node_modules/webmidi/webmidi.min';

class App extends Component {
  state = {
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
    })
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
      midiOutput: outputdevice,
    }, () => {this.startChime(outputdevice)})
  }

  logMIDIinputs = () => {
    let inputdevice = this.state.midiInput
    inputdevice.onmidimessage = (message) => {
      switch (message.data[0]) {
        case 144:
          console.log('outputdevice.send( [', message.data[0], ', ', message.data[1], ', ', message.data[2],'], ', Math.round(message.timeStamp), ');');
          break;
        case 176:
          console.log('SUSTAIN PEDAL');
          console.log('Command: ', message.data[0]);
          console.log('Velocity: ', message.data[2]);
          console.log('Timestamp: ', Math.round(message.timeStamp))
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

  recordSong = () => {
    this.setState({
      recording: true,
      currentsong: [[176, 64, 0, 1]]
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

  copyCurrentSong = () => {
    let adjustedSong = []
    for (const note of this.state.currentsong) {
      let noteCopy = [...note]
      adjustedSong = [...adjustedSong, noteCopy]
    };
    return adjustedSong;
  }

  adjustStartTime = () => {
    let adjustedSong = this.copyCurrentSong()
    let adjustStartTimeBy = adjustedSong[1][3] - 1;
    for (const note of adjustedSong) {
      note[3] = note[3] - adjustStartTimeBy;
    }
    adjustedSong[0][3] = 1
    this.setState({
      currentsong: adjustedSong
    }, this.adjustPedalBug)
  }

  adjustPedalBug = () => {
    let adjustedSong = this.copyCurrentSong()
    for (const note of adjustedSong) {
      if (note[0] === 144 && note[1] === 64 && note[2] === 127) {
        note[0] = 176
      }
    }
    this.setState({
      currentsong: adjustedSong
    })
  }

  playSong = () => {
    if (this.state.playing === false) {
      this.setState({
        playing: true
      })
      const outputdevice = this.state.midiOutput
      const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded
      let theSong = this.copyCurrentSong()
        for (const note of theSong) {
          outputdevice.send( [ note[0], note[1], note[2] ], msSinceLoad+note[3] );
        }
    }
    this.setState({
      playing: false
    })
  }

  onMIDIFailure = () => {
      console.log('Could not access your MIDI devices.');
  }


  render() {

    return (

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p>{this.state.midiEnabled ?  'MIDI IS ON' : <button onClick={this.requestMIDI}>Turn On Midi</button>}</p>
        <p>{this.state.midiEnabled ? <button onClick={this.logMIDIinputs}>Log MIDI Inputs </button> : '' }</p>
        <p>{this.state.midiEnabled ? <button onClick={this.startChime}>Play Chime</button> : '' }</p>
        <p>{this.state.midiEnabled ? (this.state.recording ? <button onClick={this.stopRecord}>STOP Record</button> : <button onClick={this.recordSong}>START Record</button>) : ''}</p>
        <p>{this.state.currentsong.length < 2 ? '' : <button onClick={this.playSong}>PLAY Song</button>}</p>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
