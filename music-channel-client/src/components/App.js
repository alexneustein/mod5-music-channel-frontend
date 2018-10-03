import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import SongSelector from "./SongSelector";
import SongController from "./SongController";
import SongSave from "./SongSave";
import SongTitleChange from "./SongTitleChange";
import ChatRoom from "./ChatRoom";
import PianoRoom from "./PianoRoom";
import { MIDIinit } from "./MIDIinit";
import { RAILS_URL, RAILS_USER } from "./RailsURL";
import { Container, Segment, Grid, Confirm, Button, Icon, Divider} from 'semantic-ui-react'

class App extends Component {
 constructor(props) {
   super(props);
   const timingInfo = new Date().valueOf()-800
   MIDIinit.requestMIDI()
   this.fetchUser()
   this.state = {
     savedsongs: [],
     currentSongTitle: null,
     currentSongID: null,
     currentsongbackup: [],
     currentsong: [[176, 64, 0, 1]],
     currentSongDuration: null,
     currentSongAuthor: null,
     isSongSaved: null,
     midiStatus: null,
     midiInput: null,
     midiOutput: null,
     isRecording: false,
     isPlaying: false,
     pageLoaded: timingInfo,
     shouldPrompt: false,
     songsLoading: false,
     currentUser: {},
     counterObj: { playprogress: null, total: null, percent: 0, currenttext: "0:00", totaltext: "0:00" }
   }
 }

  componentDidMount() {
    window.setTimeout(() => {
      this.setState({
        midiInput: MIDIinit.midiInput,
        midiOutput: MIDIinit.midiOutput,
        midiSuccess: MIDIinit.midiSuccess
      }, () => {this.startChime()});
    }, 1000)
  }

  startChime = () => {
    const outputdevice = this.state.midiOutput
    const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded + 1000
    if (outputdevice) {
      outputdevice.send( [ 0x90, 0x2A, 0x70 ], msSinceLoad+1000 );
      outputdevice.send( [ 0x90, 0x31, 0x70 ], msSinceLoad+1010 );
      outputdevice.send( [ 0x90, 0x3A, 0x70 ], msSinceLoad+1020 );
      outputdevice.send( [ 0x90, 0x3D, 0x70 ], msSinceLoad+1030 );
      outputdevice.send( [ 0x90, 0x46, 0x70 ], msSinceLoad+1040 );
    }
  }

  promptShow = (e) => {
    if (this.state.isSongSaved === false) {
      this.setState({ shouldPrompt: true })
    }
    else {
      this.recordSong()
    }
  }

  promptConfirm = () => this.setState({ shouldPrompt: false }, () => this.recordSong())
  promptCancel = () => this.setState({ shouldPrompt: false })

  recordSong = () => {
    this.setState({
      isRecording: true,
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
    if (this.state.currentsong.length > 1) {
      this.setState({
        isRecording: false,
        isSongSaved: false,
        currentSongTitle: 'Untitled Song'
      }, this.adjustStartTime)
    } else {
      this.setState({
        isRecording: false,
      })
    }
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
    }, this.populateCounter)
  }

  resetSong = () => {
    let resetSong = this.getSongFromState(this.state.currentsongbackup)
    this.setState({
      currentsong: resetSong,
      isSongSaved: null
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
      currentsong: louderSong,
      isSongSaved: false
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
      currentsong: softerSong,
      isSongSaved: false
    })
  }

  changeTempo = (float) => {
    let changedSong = this.getSongFromState(this.state.currentsong)
    for (const event of changedSong) {
        event[3] = Math.round(event[3] * float)
    }
    this.setState({
      currentsong: changedSong,
      isSongSaved: false
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
      currentsong: changedSong,
      isSongSaved: false
    })
  }

  changeTitle = (newTitle) => {
    this.setState({
      currentSongTitle: newTitle,
      isSongSaved: false
    })
  }

  playSong = () => {
    if (this.state.isPlaying === false) {
      let theSong = this.getSongFromState(this.state.currentsong)
      this.setState({
        isPlaying: true,
        counterObj: {...this.state.counterObj, playprogress: 0}
      }, () => {
        const outputdevice = this.state.midiOutput
        const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded + 500
        for (const note of theSong) {
          outputdevice.send( [ note[0], note[1], note[2] ], msSinceLoad+note[3] );
        }
      })
      const theduration = this.state.currentSongDuration;
      this.startCounter()
      window.setTimeout(() => {
        this.setState({
          isPlaying: false
        })
      }, theduration)
    }
  }


  startCounter = () => {
    let playprogress = this.state.counterObj.playprogress
    // let playtext = this.state.counterObj.current
    let interval
    const duration = Math.round(this.state.currentSongDuration/1000)
    const countUp = () => {
      let playprogress = this.state.counterObj.playprogress
      let newprogress = playprogress + 1;
      let newtext = this.secondsToTime(newprogress)
      let percent = (newprogress / this.state.counterObj.total)*100
      if (newprogress === duration) {
        clearInterval(interval);
      }
      this.setState({
        counterObj: {...this.state.counterObj, percent: percent, playprogress: newprogress, currenttext: newtext}
      })
      }
    if (this.state.currentSongDuration !== null && playprogress !== null) {
      interval = setInterval(countUp, 1000);
    }
  }

  secondsToTime = (secs) => {
    // let hours = Math.floor(secs / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    if (seconds < 10) {
      seconds = "0" + seconds
    }

    let string = minutes + ":" + seconds
    return string;
  }

  // setDurationState = (duration) => {
  //   this.setState({
  //     counterDuration: duration
  //   })
  // }

  betterPlaySong = () => {
    if (this.state.isPlaying === false) {

    }
  }

  stopPlaying = () => {
    // const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded + 1000
    // const outputdevice = this.state.midiOutput
    // outputdevice.send( [ 176, 7, 0 ], msSinceLoad+1000);
    // outputdevice.send( [ 252 ], msSinceLoad+1000);
    // outputdevice.send( [ 252 ], msSinceLoad+1000);
  }



  saveSong = (arg) => {
    let songToSave = this.getSongFromState(this.state.currentsong)
    if (this.state.currentSongAuthor === null) {
      this.setState({
        currentSongAuthor: this.state.currentUser
      })
    }
    let songObj = {}
    songObj["title"] = this.state.currentSongTitle
    songObj["user_id"] = "1"
    songObj["songdata"] = songToSave
    const songJSON = JSON.stringify(songObj)
    this.setState({
      isSongSaved: true
    })
    if (arg === 'new' ) {
      fetch(`${RAILS_URL}/songs/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: songJSON
      }).then(res => res.json())
      .then(this.fetchSongList)
    } else {
      fetch(`${RAILS_URL}/songs/${this.state.currentSongID}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: songJSON
      }).then(res => res.json())
      .then(this.fetchSongList)
    }
  }

  fetchSongList = () => {
    this.setState({
      songsLoading: true
    })
    fetch(`${RAILS_URL}/songs/`)
    .then(res => res.json())
    .then(this.renderSongList)
  }

  renderSongList = (resData) => {
    this.setState({
      savedsongs: resData,
      songsLoading: false
    })
  }

  handleSelect = (song_id) => {
    const selectedSong = this.state.savedsongs.find(song => song.id === parseInt(song_id))
    this.setState({
      currentSongID: selectedSong.id,
      currentSongTitle: selectedSong.title
    }, () => this.fetchSong())
  }

  fetchSong = () => {
    const fetchPath = `${RAILS_URL}/songs/${this.state.currentSongID}`
    fetch(fetchPath)
    .then(res => res.json())
    .then(this.loadSong)
  }

  loadSong = (resData) => {
    const songArray = resData.songdata.slice()
    let convertedSongArray = [];
    for (var note of songArray) {
      convertedSongArray.push(note.map(Number))
    }
    this.setState({
      currentsong: convertedSongArray,
      currentsongbackup: convertedSongArray,
      isSongSaved: null,
    }, this.populateCounter)
  }

  loadSongFromCast = (songArray, user) => {
    console.log('songArray: ', songArray);
    console.log('user: ', user);
    this.setState({
      currentsong: songArray,
      currentsongbackup: songArray,
      isSongSaved: null,
      currentSongAuthor: user
    })
  }

  populateCounter = () => {
    let theSong = this.getSongFromState(this.state.currentsong)
    const songDuration = (theSong[theSong.length - 1][3])
    const songDurationSec = Math.round(songDuration/1000)
    const songDurationTime = this.secondsToTime(Math.round(songDuration/1000))
    this.setState({
      currentSongDuration: songDuration,
      counterObj: {...this.state.counterObj, playprogress: 0, currenttext: "0:00", percent: 0, total: songDurationSec, totaltext: songDurationTime}
    })
  }

  fetchUser = () => {
    const fetchPath = `${RAILS_URL}/users/${RAILS_USER}`
    fetch(fetchPath)
    .then(res => res.json())
    .then(this.loadUser)
  }

  loadUser = (user) => {
    this.setState({
      currentUser: user
    })
  }



  render() {
    return (

      <Container>
        <Segment vertical>
          <Navbar currentUser={this.state.currentUser} midiStatus={MIDIinit.midiStatus} midiOutput={this.state.midiOutput} startChime={this.startChime}/>
        </Segment>
        <Segment vertical>
          <Grid divided>
            <Grid.Column width={4}>
              {/* FETCH SAVED SONGS */}
              <p>{this.state.midiOutput ? <Button basic labelPosition='left' icon onClick={this.fetchSongList}><Icon name='folder open' size='large' color='blue' />Open Saved Songs</Button> : '' }</p>
              {/* SONG LIST COMPONENT */}
              <Container>
              <SongSelector
                isSongSaved={this.state.isSongSaved} handleSelect={this.handleSelect}
                songList={this.state.savedsongs}
                songsLoading={this.state.songsLoading}
                />
              </Container>
            </Grid.Column>
            <Grid.Column width={8}>
              {/* RECORD BUTTON */}
              <p>{this.state.midiInput ? (this.state.isRecording ? <Button basic  onClick={this.stopRecord}><Icon name='stop circle' size='large' color='green' />STOP Record</Button> : <Button basic icon labelPosition='left' onClick={this.promptShow}><Icon name='circle' size='large' color='red' />RECORD NEW SONG</Button>) : ''}
              <Confirm open={this.state.shouldPrompt} content='Proceed without saving changes?' cancelButton='No'
              confirmButton="Yes" size='mini' onCancel={this.promptCancel} onConfirm={this.promptConfirm} />
            {this.state.isPlaying === true ? <Button icon labelPosition='left' basic disabled><Icon name='play circle outline' size='large' color='green' />Song Is Playing</Button> : (this.state.currentsong.length > 1 ? <Button icon labelPosition='left' basic onClick={this.playSong}><Icon name='play' size='large' color='green' />PLAY Song</Button> : '')}</p>


              {/* SONG TITLE */}
              <h3>{this.state.currentSongTitle}</h3>

              {/* CHANGE TITLE BUTTON */}
              <SongTitleChange
                currentSongTitle={this.state.currentSongTitle}
                changeTitle={this.changeTitle}
                />

              {/* SAVE BUTTON */}
              <SongSave
                currentsonglength={this.state.currentsong.length}
                isRecording={this.state.isRecording}
                isSongSaved={this.state.isSongSaved}
                currentSongID={this.state.currentSongID}
                saveSong={this.saveSong}
                />

              {/* SONG CONTROLS */}
              <SongController
                currentsonglength={this.state.currentsong.length}
                isPlaying={this.state.isPlaying}
                isRecording={this.state.isRecording}
                playSong = {this.playSong}
                makeLouder={this.makeLouder}
                makeSofter={this.makeSofter}
                changeTempo={this.changeTempo}
                transposeSong={this.transposeSong}
                resetSong={this.resetSong}
                currentSongDuration={this.state.currentSongDuration}
                counterObj={this.state.counterObj}
                />

            </Grid.Column>
            <Grid.Column width={4}>
              {/* CHAT ROOM */}
              <ChatRoom currentUser={this.state.currentUser}/>
              <Divider />
              {/* PIANO ROOM */}
              {<PianoRoom currentsong={this.state.currentsong} currentUser={this.state.currentUser} midiInput={this.state.midiInput} isPlaying={this.state.isPlaying} loadSongFromCast={this.loadSongFromCast}/>}
            </Grid.Column>
          </Grid>
        </Segment>

          {/* BETTER PLAY CONTROLS
          <Button basic onClick={this.stopPlaying}>BETTER PLAY</Button>

          <Button basic onClick={this.stopPlaying}>STOP</Button>*/}



      </Container>
    );
  }
}

export default App;
