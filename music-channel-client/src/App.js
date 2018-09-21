import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import WebMidi from '../node_modules/webmidi/webmidi.min';

class App extends Component {
  state = {
    input: null,
    connection: null
  }

  startRecord = () => {
    WebMidi.enable(function (err) {
      const midiin = WebMidi.getInputByName("USB2.0-MIDI Port 1");
      midiin.addListener('noteon', "all",
        function (e) {
          let note = e.note.name + e.note.octave
          let velo = e.velocity
          let time = e.timestamp
          console.log(note, ' ', velo, ' ', time);
        }
      );
    })
  }



  startPlay = () => {
    WebMidi.enable(function (err) {
      const midiout = WebMidi.getOutputByName("USB2.0-MIDI Port 1");
      midiout.playNote("Gb2", 1, {duration: 2000, velocity: 0.75});
    })
  }

  requestMIDI = () => {
    navigator.requestMIDIAccess()
    .then(this.onMIDISuccess, this.onMIDIFailure);
  }

  onMIDISuccess = (midiAccess) => {
    for (var input of midiAccess.inputs.values()) {
        if (input.name === 'USB2.0-MIDI Port 1') {
          var mididevice = input
          console.log(mididevice);
          mididevice.onmidimessage = this.getMIDIMessage
        }
    }
  }

  getMIDIMessage = (message) => {
    switch (message.data[0]) {
      case 144:
        console.log('Note: ', message.data[1]);
        console.log('Velocity: ', message.data[2]);
        console.log('Timestamp: ', message.timeStamp)
        break;
      case 176:
        console.log('SUSTAIN PEDAL');
        console.log('Velocity: ', message.data[2]);
        console.log('Timestamp: ', message.timeStamp)
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

  onMIDIFailure = () => {
      console.log('Could not access your MIDI devices.');
  }


  render() {

    return (

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 onClick={this.requestMIDI} className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p><a onClick={this.startRecord}>Record Me!</a></p><p><a onClick={this.startPlay}>Play Sample!</a></p>
      </div>
    );
  }
}

export default App;
