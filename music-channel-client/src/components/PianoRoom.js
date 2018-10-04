import React, { Component } from "react";
import { ActionCable } from 'react-actioncable-provider'
import { WS_URL } from "./RailsURL";
import CastSelector from "./CastSelector";
import onairlogo from './onair.png';
import { Image, Confirm, Button, Icon, Comment, Header } from 'semantic-ui-react'

class PianoRoom extends Component {
  state = {
    receivedBuffer: [],
    playBuffer: [],
    isBuffering: null,
    bufferSize: 0,
    receivedCasts: [],
    playednotes: [],
    isPlayingCast: null,
    isReceiving: null,
    receivingFrom: null,
    shouldPrompt: false,
    adjustStartTimeBy: null,
    msSinceLoad: null
  }

  openConnection = () => {
    return new WebSocket(`${WS_URL}/cable`)
    // return new WebSocket("ws://10.39.104.225:3000/cable")
    // return new WebSocket("wss://flatironchatterbox-api.herokuapp.com/cable")
  }

  promptShow = (e) => {
    if (this.props.isSongSaved === false) {
      this.setState({ shouldPrompt: true })
    }
    else {
      this.props.startBroadcast()
    }
  }

  promptConfirm = () => this.setState({ shouldPrompt: false }, () => this.props.startBroadcast())
  promptCancel = () => this.setState({ shouldPrompt: false })

  onReceived = (e) => {
    // console.log('e.note.note: ', e.note.note);
    if (this.props.currentUser.username !== e.note.note.user.username) {
      if(e.note.note){
        this.createNote(e.note.note)
        if (this.state.isPlayingCast) {
          this.bufferNote(e.note.note.content);
        }
      } else {
        this.createNote(e)
      }
    }
  }


  createNote = (note) => {
    if (note.content[0] === 0) {
      this.setState({ isReceiving: true, receivingFrom: note.user})
    }
    this.setState(prevState => ({
      receivedBuffer: [...prevState.receivedBuffer, note]
    }))
    if (note.content[0] === 1) {
      this.setState({ isReceiving: false, isPlayingCast: false, isBuffering: false, receivingFrom: null},this.saveCastToState)
    }
  }

  bufferNote = (note) => {
    if (note[0] !== 0) {
      // console.log('Now reading note: ', note);
      if (this.state.adjustStartTimeBy === null) {
        const adjustStartTimeBy = note[3] - 100;
        const msSinceLoad = (new Date().valueOf()) - this.props.pageLoaded + 1500
        this.setState({adjustStartTimeBy: adjustStartTimeBy, msSinceLoad: msSinceLoad })
        console.log('Setting adjustment factor of ', adjustStartTimeBy);
      }
      if (this.state.playBuffer.length > 0) {
        const bufferSize = this.state.playBuffer[this.state.playBuffer.length - 1][3] - this.state.playBuffer[0][3]
        this.setState({ bufferSize: bufferSize})
      }
      this.setState(prevState => ({
        playBuffer: [...prevState.playBuffer, note]
      }), this.playNotesInBuffer)
    }
  }

  playNotesInBuffer = () => {
    if ((this.state.bufferSize < 1000) && (this.state.playBuffer[this.state.playBuffer.length-1][0] !== 1)) {
      this.setState({isBuffering: true })
    } else {
      this.setState({isBuffering: false })
      const outputdevice = this.props.midiOutput
      const msSinceLoad = this.state.msSinceLoad
      const adjustStartTimeBy = this.state.adjustStartTimeBy
      const chunkToPlay = this.props.getSongFromState(this.state.playBuffer)
      console.log('adjustStartTimeBy: ', adjustStartTimeBy);
      console.log('msSinceLoad: ', msSinceLoad);
      console.log('factor: ', msSinceLoad-adjustStartTimeBy);
      for (const note of chunkToPlay) {
        console.log('now playing note at: ', msSinceLoad-adjustStartTimeBy+note[3]);
        outputdevice.send( [ note[0], note[1], note[2] ], msSinceLoad-adjustStartTimeBy+note[3] );
      }
      this.setState({ playBuffer: [], bufferSize: 0 })
    }
  }


  saveCastToState = () => {
    let receivedBuffer = this.state.receivedBuffer
    if ((receivedBuffer.length > 1) && (receivedBuffer[0].content[0] === 1)) {
      receivedBuffer.shift()
    }
    if (receivedBuffer.length > 0) {
      let newSong = []
      const newUser = receivedBuffer[0].user
      const newDate = new Date(receivedBuffer[0].content[3])
      for (const note of receivedBuffer) {
        if (note.content[0] === 1) {
          break;
        }
        if (note.content[0] !== 0) {
          let noteCopy = [...note.content]
          newSong = [...newSong, noteCopy]
        }
      };
      if (newSong.length > 0) {
        const adjustStartTimeBy = newSong[0][3] - 100;
        for (const note of newSong) { note[3] = note[3] - adjustStartTimeBy; }
        const newCast = {user: newUser, date: newDate, song: newSong}
        this.setState(prevState => ({
          receivedCasts: [newCast, ...prevState.receivedCasts],
          receivedBuffer: []
        }))
      }
    }
  }

  playCast = () => {
    if (this.state.receivedBuffer.length > 0) {
      this.setState({
        isPlayingCast: true
      })
    }
  }

  playFromStart = () => {
    if (this.state.receivedBuffer.length > 0) {
      let currentBuffer = this.state.receivedBuffer
      console.log(this.state.receivedBuffer);
      let playBuffer = []
      for (const note of currentBuffer) {
        playBuffer = [...playBuffer, note.content]
      }

      console.log('now playing: ', playBuffer);
      this.setState({
        isPlayingCast: true,
      })
    }
  }

  broadcastCurrentSong = () => {

  }

  // BUTTON RENDERERS

  renderLiveBroadcastButton = () => {
    if (this.props.isBroadcasting) {
      return (<Button basic icon labelPosition='left' onClick={this.props.stopBroadcast}><Icon name='microphone slash' size='large' color='green' />STOP Cast</Button>)
    } else {
      return (<Button basic icon labelPosition='left' onClick={this.promptShow}><Icon name='microphone' size='large' color='red' />Cast Live Song</Button>)
    }
  }

  renderBroadcastCurrentButton = () => {
    if (this.props.isBroadcasted) {
      return (<Button basic icon labelPosition='left' disabled><Icon name='checkmark' size='large' color='green' />Broadcast Complete</Button>)
    } else {
      if ((this.props.currentsong.length === 0) || this.props.isBroadcasting) {
        return (<Button disabled basic icon labelPosition='left' onClick={this.props.broadcastCurrentSong}><Icon name='share' size='large' color='orange' />Cast Current Song</Button>)
      } else {
        return (<Button basic icon labelPosition='left' onClick={this.props.broadcastCurrentSong}><Icon name='share' size='large' color='orange' />Cast Current Song</Button>)
      }
    }
  }

  renderListenButton = () => {
    if (this.state.isPlayingCast) {
      return (<Button basic icon labelPosition='left' onClick={this.muteCast}><Icon name='bell slash' size='large' color='orange' />Mute Broadcast</Button>)
    } else {
      return (<div><Button basic icon labelPosition='left' onClick={this.playCast}><Icon name='headphones' size='large' color='teal' />Listen to Cast</Button><Button basic icon labelPosition='left' onClick={this.playFromStart}><Icon name='headphones' size='large' color='teal' />Listen from Start</Button></div>)
    }
  }

  renderReceiving = () => {
    if (this.state.isReceiving) {
      return (
        <div><Icon loading name='sync' size='large' />Receiving Cast from {this.state.receivingFrom.name_first} {this.state.receivingFrom.name_last}
        {this.renderListenButton()}</div>

      )

    } else {
      return (<div></div>)
    }
  }

  renderBuffering = () => {
    if (this.state.isBuffering) {
      return (
        <span><Icon name="sync" loading size="small" />Buffer size: {this.state.bufferSize}</span>
      )
    } else {
      return ('')
    }
  }

  renderPlaying = () => {
    if (this.state.isPlayingCast) {
      return (
        <span><Icon name="compass" loading size="small" />PLAYING BROADCAST</span>
      )
    } else {
      return ('')
    }
  }

  render() {
      return (
        <div>
          <ActionCable
            ref='PianoChannel'
            channel={{channel: 'PianoChannel'}}
            onReceived={this.onReceived}
           />
         <Comment.Group>
           <Header as='h3' dividing>
             Broadcast {this.props.isBroadcasting ? <Image src={onairlogo} size="big" spaced alt="ON AIR"/> : ''}
           </Header>

           {/* LIVE BROADCAST BUTTON */}
           <p>{this.renderLiveBroadcastButton()}</p>
             <Confirm open={this.state.shouldPrompt} content='Proceed without saving changes?' cancelButton='No'
             confirmButton="Yes" size='mini' onCancel={this.promptCancel} onConfirm={this.promptConfirm} />

           {/* BROADCAST CURRENT SONG BUTTON */}
           <p>{this.renderBroadcastCurrentButton()}</p>



         </Comment.Group>
         <Comment.Group>
           <Header as='h3' dividing>
             Received Casts
           </Header>
         </Comment.Group>
         {this.renderReceiving()}
         <p>{this.renderBuffering()}</p>
         <p>{this.renderPlaying()}</p>

         {/* LISTEN TO BROADCAST BUTTON */}

         <CastSelector
           isSongSaved={this.props.isSongSaved}
           castList={this.state.receivedCasts}
           handleCast={this.props.handleCast}
           />
        </div>
      )
  }
}

export default PianoRoom;
