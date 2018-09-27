import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SongSelector from "./SongSelector";
import SongController from "./SongController";
// import { Button, Confirm } from 'semantic-ui-react'
// import WebMidi from '../node_modules/webmidi/webmidi.min';

class App extends Component {
  state = {
    savedsongs: [],
    currentSongTitle: null,
    currentSongID: null,
    currentsongbackup: [],
    currentsong: [[176, 64, 0, 1]],
    isSongSaved: null,
    midiEnabled: false,
    midiAccess: null,
    midiInput: null,
    midiOutput: null,
    isRecording: false,
    isPlaying: false,
    pageLoaded: 0
  }

  componentDidMount() {
    const timingInfo = new Date().valueOf()-800
    window.setTimeout(() => {
      this.setState({
        pageLoaded: timingInfo
      }, () => {this.requestMIDI()})
    }, 1000)
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

  onMIDIFailure = () => {
      console.log('Could not access your MIDI devices.');
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

  startChime = ( outputdevice ) => {
    if (outputdevice.name === undefined) {
      outputdevice = this.state.midiOutput
    }
    const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded
    outputdevice.send( [ 0x90, 0x2A, 0x70 ], msSinceLoad+500 );
    outputdevice.send( [ 0x90, 0x31, 0x70 ], msSinceLoad+501 );
    outputdevice.send( [ 0x90, 0x3A, 0x70 ], msSinceLoad+502 );
    outputdevice.send( [ 0x90, 0x3D, 0x70 ], msSinceLoad+503 );
    outputdevice.send( [ 0x90, 0x46, 0x70 ], msSinceLoad+504 );
  }

  recordSong = () => {
    this.setState({
      isRecording: true,
      isSongSaved: false,
      currentsong: [[176, 64, 0, 1]],
      currentsongbackup: [],
      currentSongID: null,
      currentSongTitle: null
    })
    const inputdevice = this.state.midiInput
    inputdevice.onmidimessage = (message) => {
      if (this.state.isRecording) {
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
      isRecording: false,
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
      currentsongbackup: adjustedSong
    })
  }

  resetSong = () => {
    let resetSong = this.getSongFromState(this.state.currentsongbackup)
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
    if (this.state.isPlaying === false) {
      let theSong = this.getSongFromState(this.state.currentsong)
      this.setState({
        isPlaying: true
      }, () => {
        const outputdevice = this.state.midiOutput
        const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded + 100
        for (const note of theSong) {
          outputdevice.send( [ note[0], note[1], note[2] ], msSinceLoad+note[3] );
        }
      })
      let theduration = theSong[theSong.length - 1][3];
      window.setTimeout(() => {
        this.setState({
          isPlaying: false
        })
      }, theduration)
    }
  }

  saveCurrentSong = () => {
    let songToSave = this.getSongFromState(this.state.currentsong)
    let songObj = {}
    songObj["title"] = "Song Title"
    songObj["user_id"] = "1"
    songObj["songdata"] = songToSave
    const songJSON = JSON.stringify(songObj)
    this.setState({
      isSongSaved: true
    })
    fetch('http://localhost:3001/songs/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: songJSON
    }).then(res => res.json())
    .then(console.log())
  }

  fetchSongList = () => {
    fetch('http://localhost:3001/songs/')
    .then(res => res.json())
    .then(this.renderSongList)
  }

  renderSongList = (resData) => {
    this.setState({
      savedsongs: resData
    })
  }

  handleSelect = (e) => {

    const selectedSong = this.state.savedsongs.find(song => song.id === parseInt(e.target.id))
    console.log(selectedSong);
    this.setState({
      currentSongID: selectedSong.id,
      currentSongTitle: selectedSong.title
    },
      this.setCurrentSong)
  }




  render() {

    return (

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Song Recorder</h1>
        </header>

        <p>{this.state.midiEnabled ? <button onClick={this.startChime}>Play Chime</button> : '' }</p>
        <p>{this.state.midiEnabled ? <button onClick={this.fetchSongList}>See Saved Songs</button> : '' }</p>

        <SongSelector handleSelect={this.handleSelect} songList={this.state.savedsongs}/>

        <p>{this.state.midiEnabled ? (this.state.isRecording ? <button onClick={this.stopRecord}>STOP Record</button> : <button onClick={this.recordSong}>RECORD NEW SONG</button>) : ''}</p>

        <p>{this.state.currentsong.length < 2 ? '' : (this.state.isPlaying === true ? <button disabled>Song Is Playing</button> : <button onClick={this.playSong}>PLAY Song</button>)}</p>

        <p>{this.state.currentsong.length < 2 ? '' : <button onClick={this.saveCurrentSong}>Save As New Song</button>}</p>

          <SongController
            currentsonglength={this.state.currentsong.length}
            makeLouder={this.makeLouder}
            makeSofter={this.makeSofter}
            changeTempo={this.changeTempo}
            transposeSong={this.transposeSong}
            resetSong={this.resetSong}/>
      </div>
    );
  }
}

export default App;
