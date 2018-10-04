import React, { Component } from 'react';
import { ActionCable } from 'react-actioncable-provider'
import './App.css';
import Navbar from './Navbar';
import SongSelector from "./SongSelector";
import SongController from "./SongController";
import SongSave from "./SongSave";
import SongTitleChange from "./SongTitleChange";
import ChatRoom from "./ChatRoom";
import PianoRoom from "./PianoRoom";
import { MIDIinit } from "./MIDIinit";
import { RAILS_URL, RAILS_USER, WS_URL } from "./RailsURL";
import { Container, Header, Segment, Grid, Divider, Confirm, Button, Icon} from 'semantic-ui-react'

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
     currentsong: [],
     currentSongDuration: null,
     currentSongAuthor: null,
     isBroadcasting: null,
     isCastingCurrent: null,
     isBroadcasted: null,
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
     playingSongQueue: 0,
     counterObj: { playprogress: null, total: null, percent: 0, currenttext: "0:00", totaltext: "0:00", remaining: 0 }
   }
 }

  componentDidMount() {
    window.setTimeout(() => {
      this.setState({
        midiInput: MIDIinit.midiInput,
        midiOutput: MIDIinit.midiOutput,
        midiSuccess: MIDIinit.midiSuccess
      });
    }, 1000)
  }

  openConnection = () => {
    return new WebSocket(`${WS_URL}/cable`)
    // return new WebSocket("ws://10.39.104.225:3000/cable")
    // return new WebSocket("wss://flatironchatterbox-api.herokuapp.com/cable")
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
      currentsong: [],
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
            this.setState({
              currentsong: [...this.state.currentsong, noteArray]
            }, () => {if (this.state.isBroadcasting) {this.sendNote(noteArray)}})
            break;
          case 128:
            let noteOffArray = [128, message.data[1], message.data[2], Math.round(message.timeStamp)]
            this.setState({
              currentsong: [...this.state.currentsong, noteOffArray]
            }, () => {if (this.state.isBroadcasting) {this.sendNote(noteOffArray)}})
            break;
          case 176:
            let pedalArray = [176, message.data[1], message.data[2], Math.round(message.timeStamp)]
            console.log('PEDAL: ', pedalArray);
            this.setState({
              currentsong: [...this.state.currentsong, pedalArray]
            }, () => {if (this.state.isBroadcasting) {this.sendNote(pedalArray)}})
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

  // START AND STOP BROADCASTS

  startBroadcast = () => {
    const starttime = new Date()
    let songTitle = null
    let startNote = [0,0,0,starttime]
    if (this.state.currentSongTitle !== null) {
      startNote = [0,0,this.state.currentSongTitle,starttime]
    }
    this.sendNote(startNote)
    this.setState({
      isBroadcasting: true,
      shouldPrompt: false
    }, this.recordSong)
  }

  stopBroadcast = () => {
    const endtime = new Date()
    this.sendNote([1,1,1,endtime])
    this.setState({
      isBroadcasting: false,
      isBroadcasted: true
    }, this.stopRecord)
  }

  // prepareBroadcast = (noteArray) => {
  //   console.log('note to broadcast: ',noteArray);
  // }

  sendNote = (noteArray) => {
    const postUser = () => {
      if(this.state.currentUser.username){
        return this.state.currentUser
      } else {
        return {username: `Anonymous`}
      }
    }
      const postNote = noteArray
      const note = {user: postUser(), content: postNote}
      this.refs.PianoChannel.perform('onPlay', {note})
      // this.setState({note: ''})
  }

  broadcastCurrentSong = () => {
    let songToCast = this.getSongFromState(this.state.currentsong)
    console.log('songToCast: ', songToCast);
    this.setState({
      isCastingCurrent: true,
      shouldPrompt: false
    }, () => {
      const starttime = new Date();
      this.sendNote([0,0,0,starttime])
      for (const note of songToCast) {
        this.sendNote( [ note[0], note[1], note[2] ], note[3] );
      }
    })

    this.setState({
      isCastingCurrent: false,
      isBroadcasting: false,
      isBroadcasted: true
    }, () => { const endtime = new Date(); this.sendNote([1,1,1,endtime])})




  }



  getSongFromState = (arg) => {
    let adjustedSong = []
    for (const note of arg) {
      let noteCopy = [...note]
      adjustedSong = [...adjustedSong, noteCopy]
    };
    return adjustedSong;
  }

  // HELPER FUNCTIONS FOR SAVING

  adjustStartTime = () => {
    let adjustedSong = this.getSongFromState(this.state.currentsong)
    let adjustStartTimeBy = adjustedSong[0][3] - 100;
    for (const note of adjustedSong) {
      note[3] = note[3] - adjustStartTimeBy;
    }
    adjustedSong.unshift([176, 64, 0, 1]) // Adds Pedal off to start of song
    this.setState({
      currentsong: adjustedSong,
      currentsongbackup: adjustedSong
    }, this.adjustPedalBug)
  }

  adjustPedalBug = () => {
    // console.log(midiOutput.name === 'USB2.0-MIDI Port 1');
    let adjustedSong = this.getSongFromState(this.state.currentsong)
    if (this.state.midiOutput.name) {
      for (const note of adjustedSong) {
        if (note[0] === 144 && note[1] === 64 && note[2] === 127) {
          note[0] = 176
        }
      }
    }
    this.setState({
      currentsong: adjustedSong,
      currentsongbackup: adjustedSong
    }, this.populateCounter)
  }

  //SONG MANIPULATION FUNCTIONS

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
      const newQueue = this.state.playingSongQueue + this.state.counterObj.remaining
      this.setState({
        isPlaying: true,
        counterObj: {...this.state.counterObj, playprogress: 0},
        playingSongQueue: newQueue
      }, () => {
        const outputdevice = this.state.midiOutput
        const msSinceLoad = (new Date().valueOf()) - this.state.pageLoaded + 500
        const playingSongQueue = this.state.playingSongQueue
        for (const note of theSong) {
          outputdevice.send( [ note[0], note[1], note[2] ], msSinceLoad+playingSongQueue+note[3] );
        }
      })
      const theduration = this.state.currentSongDuration;
      this.startCounter()
      window.setTimeout(() => {
        this.setState({
          isPlaying: false,
          playingSongQueue: 0
        })
      }, theduration)
    }
  }



  // GETTING LIST OF SONGS FROM DATABASE

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

  // LOADING SONGS FROM DATABASE

  handleSelect = (song_id) => {
    const selectedSong = this.state.savedsongs.find(song => song.id === parseInt(song_id, 10))
    this.setState({
      currentSongID: selectedSong.id,
      currentSongTitle: selectedSong.title,
      counterObj: { playprogress: null, total: null, percent: 0, currenttext: "0:00", totaltext: "0:00", remaining: 0 }
    }, () => this.fetchSong())
  }

  // FETCHING SONGS FROM DATABASE

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
      isBroadcasted: false,
      isCastingCurrent: false,
      currentSongAuthor: resData.user
    }, this.populateCounter)
  }

  // LOADING RECEIVED CASTS

  handleCast = (song) => {
    const parsedName = `${song.user.name_first} ${song.user.name_last}`
    const parsedDate = `${song.date.toDateString()}, ${song.date.toLocaleTimeString()}`
    const newTitle = `${parsedName} ${parsedDate}`
    this.setState({
      currentSongTitle: newTitle,
      currentSongID: null
    }, () => this.loadSongFromCast(song.song, song.user))
  }


  loadSongFromCast = (songArray, user) => {
    console.log('songArray: ', songArray);
    console.log('user: ', user);
    this.setState({
      currentsong: songArray,
      currentsongbackup: songArray,
      isSongSaved: null,
      currentSongAuthor: user,
    }, this.adjustStartTime)
  }

  // SAVE SONG TO DATABASE

  saveSong = (arg) => {
    let songToSave = this.getSongFromState(this.state.currentsong)
    if (this.state.currentSongAuthor === null) {
      this.setState({
        currentSongAuthor: this.state.currentUser
      })
    }
    let songObj = {}
    songObj["title"] = this.state.currentSongTitle
    songObj["user_id"] = this.state.currentSongAuthor.id
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

  // DELETE SONG

  deleteSong = (songID) => {
    console.log('Delete this: ',songID);
    fetch(`${RAILS_URL}/songs/${songID}`, {
      method: 'DELETE',
    }).then(this.fetchSongList)
  }

  // SUPPORT FUNCTIONS FOR THE PROGRESS COUNTER

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
      let remaining = (this.state.counterObj.total - newprogress)*1000
      if (newprogress === duration) {
        clearInterval(interval);
      }
      this.setState({
        counterObj: {...this.state.counterObj, percent: percent, playprogress: newprogress, currenttext: newtext, remaining: remaining}
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

  populateCounter = () => {
    let theSong = this.getSongFromState(this.state.currentsong)
    const songDuration = (theSong[theSong.length - 1][3])
    const songDurationSec = Math.round(songDuration/1000)
    const songDurationTime = this.secondsToTime(Math.round(songDuration/1000))
    this.setState({
      currentSongDuration: songDuration,
      counterObj: {...this.state.counterObj, playprogress: 0, remaining: 0, currenttext: "0:00", percent: 0, total: songDurationSec, totaltext: songDurationTime}
    })
  }

  // GETTING THE ACTIVE USER

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


  showPlayLabel = () => {
    if (this.state.playingSongQueue !== 0) {
      return (<div>QUEUED UP!</div>)
    }
  }


  render() {
    return (

      <Container>
        <Segment vertical>
          <Navbar currentUser={this.state.currentUser} midiStatus={MIDIinit.midiStatus} midiOutput={this.state.midiOutput} startChime={this.startChime}/>
        </Segment>
        <Segment vertical>
          <Grid divided>
            <Grid.Column width={3}>
              {/* FETCH SAVED SONGS */}
              <Header as='h3' dividing>Saved Songs</Header>
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
            <Grid.Column width={7}>
              <Header as='h3' dividing>Song Control</Header>
              {/* RECORD BUTTON */}
              <p>{this.state.midiInput ? (this.state.isRecording ?  (this.state.isBroadcasting ? <Button disabled basic  onClick={this.stopRecord}><Icon name='stop circle' size='large' color='green' />STOP Record</Button>  : <Button basic  onClick={this.stopRecord}><Icon name='stop circle' size='large' color='green' />STOP Record</Button> ): <Button basic icon labelPosition='left' onClick={this.promptShow}><Icon name='circle' size='large' color='red' />RECORD NEW SONG</Button>) : ''}
              <Confirm open={this.state.shouldPrompt} content='Proceed without saving changes?' cancelButton='No'
              confirmButton="Yes" size='mini' onCancel={this.promptCancel} onConfirm={this.promptConfirm} />
            {this.state.isPlaying === true ? <Button icon labelPosition='left' basic disabled><Icon name='play circle outline' size='large' color='green' />Song Is Playing</Button> : (this.state.currentsong.length > 1 ? (this.state.isRecording ? <Button icon disabled labelPosition='left' basic onClick={this.playSong}><Icon name='play' size='large' color='green' />PLAY Song</Button> : <Button icon labelPosition='left' basic onClick={this.playSong}><Icon name='play' size='large' color='green' />PLAY Song</Button>) : '')}</p>
          {this.showPlayLabel()}


            {/* TITLE AND CHANGE TITLE BUTTON */}
            <Divider />
              <SongTitleChange
                currentSongTitle={this.state.currentSongTitle}
                changeTitle={this.changeTitle}
                currentSongAuthor={this.state.currentSongAuthor}
                />

            <Divider />
              {/* SAVE BUTTON */}
              <SongSave
                currentsonglength={this.state.currentsong.length}
                isRecording={this.state.isRecording}
                isSongSaved={this.state.isSongSaved}
                currentSongID={this.state.currentSongID}
                saveSong={this.saveSong}
                deleteSong={this.deleteSong}
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
              <Grid.Column width={3}>
              {/* PIANO ROOM */}
              <ActionCable
                ref='PianoChannel'
                channel={{channel: 'PianoChannel'}}
                onReceived={this.onReceived}
               />
              {<PianoRoom
                currentsong={this.state.currentsong}
                currentUser={this.state.currentUser}
                midiInput={this.state.midiInput}
                isPlaying={this.state.isPlaying}
                isBroadcasting={this.state.isBroadcasting}
                isBroadcasted={this.state.isBroadcasted}
                loadSongFromCast={this.loadSongFromCast}
                stopRecord={this.stopRecord}
                startBroadcast={this.startBroadcast}
                stopBroadcast={this.stopBroadcast}
                handleCast={this.handleCast}
                isSongSaved={this.state.isSongSaved}
                midiOutput={this.state.midiOutput}
                pageLoaded={this.state.pageLoaded}
                getSongFromState={this.getSongFromState}
                broadcastCurrentSong={this.broadcastCurrentSong}
                isCastingCurrent={this.isCastingCurrent}
                />}
            </Grid.Column>
            <Grid.Column width={3}>
              {/* CHAT ROOM */}
              <ChatRoom currentUser={this.state.currentUser}/>
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
