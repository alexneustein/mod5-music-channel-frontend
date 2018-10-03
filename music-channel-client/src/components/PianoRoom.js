import React, { Component } from "react";
import { ActionCable } from 'react-actioncable-provider'
import { WS_URL } from "./RailsURL";
import onairlogo from './onair.png';
import { Image, Button, Icon, Comment, Header } from 'semantic-ui-react'

class PianoRoom extends Component {
  state = {
    user: {},
    note: '',
    song: [],
    receivednotes: [],
    playednotes: [],
    adjustBy: null,
    isBroadcasting: false,
    isPlayingCast: null
  }

  componentDidMount() {
        this.setState({
          user: this.props.currentUser
        })
  }

  openConnection = () => {
    return new WebSocket(`${WS_URL}/cable`)
    // return new WebSocket("ws://10.39.104.225:3000/cable")
    // return new WebSocket("wss://flatironchatterbox-api.herokuapp.com/cable")
  }

  onReceived = (e) => {
    console.log('e.note.note: ', e.note.note);
    if(e.note.note){
      this.createNote(e.note.note)
    } else {
      this.createNote(e)
    }
  }

  playCast = () => {
    if (this.state.receivednotes.length > 0) {
      this.setState({
        isPlayingCast: true
      }, this.moveToCurrentSong(this.state.receivednotes))
    }
  }

  // moveToCurrentSong = (arg) => {
  //   if (arg.length > 0) {
  //     let currentCast = []
  //     let currentUser
  //     for (const note of arg) {
  //       let noteCopy = [...note.content]
  //       currentCast = [...currentCast, noteCopy]
  //       currentUser = note.user
  //       // arg.shift()
  //     };
  //     this.props.loadSongFromCast(currentCast, currentUser)
  //     // return currentCast;
  //   }
  // }

  createNote = (note) => {
    this.setState(prevState => ({
      receivednotes: [...prevState.receivednotes, note]
    }))
  }

  // sendNote = (noteArray) => {
  //   const postUser = () => {
  //     if(this.props.currentUser.username){
  //       return this.props.currentUser
  //     } else {
  //       return {username: `Anonymous`}
  //     }
  //   }
  //
  //   // if(userobject.user){
  //   //   this.refs.PianoChannel.perform('onPlay', {userobject})
  //   // } else {
  //     const postNote = noteArray
  //     const note = {user: postUser(), content: postNote}
  //     this.refs.PianoChannel.perform('onPlay', {note})
  //     this.setState({note: ''})
  //   // }
  // }

  // handleInput = (event) => {
  //   let noteArray = event
  //   // if (this.state.adjustBy === null) {
  //   //   let adjustStartTimeBy = noteArray[3] - 2
  //   //   this.setState({
  //   //     adjustBy: adjustStartTimeBy
  //   //   }, () => this.notesToState(noteArray))
  //   // } else {
  //     this.notesToState(noteArray)
  //   // }
  // }
  //
  // notesToState = (noteArray) => {
  //   // noteArray[3] = noteArray[3] - this.state.adjustBy;
  //   if (noteArray[0] === 144 && noteArray[1] === 64 && noteArray[2] === 127) {
  //     noteArray[0] = 176
  //   }
  //   console.log('notes to state: ', noteArray);
  //   this.setState({
  //     song: [...this.state.song, noteArray],
  //     note: noteArray
  //   }, this.sendNote(noteArray))
  // }

  // stopBroadcast = () => {
  //   this.setState({
  //     isBroadcasting: false
  //   }, this.props.stopRecord)
  // }

  // startBroadcast = () => {
  //   this.setState({
  //     isBroadcasting: true,
  //   }, this.props.promptShow)
  //   // const inputdevice = this.props.midiInput
  //   // inputdevice.onmidimessage = (message) => {
  //   //   if (this.state.isBroadcasting) {
  //   //     switch (message.data[0]) {
  //   //       case 144:
  //   //         let noteArray = [144, message.data[1], message.data[2], Math.round(message.timeStamp)]
  //   //         this.handleInput(noteArray)
  //   //         break;
  //   //       case 128:
  //   //         let noteOffArray = [128, message.data[1], message.data[2], Math.round(message.timeStamp)]
  //   //         this.handleInput(noteOffArray)
  //   //         break;
  //   //       case 176:
  //   //         let pedalArray = [176, message.data[1], message.data[2], Math.round(message.timeStamp)]
  //   //         console.log('PEDAL: ', pedalArray);
  //   //         this.handleInput(pedalArray)
  //   //         break;
  //   //       case 254:
  //   //         break;
  //   //       case 248:
  //   //         break;
  //   //       default:
  //   //         console.log('Command: ', message.data[0]);
  //   //         break;
  //   //     }
  //   //   }
  //   // }
  // }


  // BUTTON RENDERERS

  renderLiveBroadcastButton = () => {
    if (this.props.isBroadcasting) {
      return (<Button basic icon labelPosition='left' onClick={this.props.stopBroadcast}><Icon name='microphone slash' size='large' color='green' />STOP Cast</Button>)
    } else {
      return (<Button basic icon labelPosition='left' onClick={this.props.startBroadcast}><Icon name='microphone' size='large' color='red' />Cast Live Song</Button>)
    }
  }

  renderBroadcastCurrentButton = () => {
    if (this.props.isBroadcasted) {
      return (<Button basic icon labelPosition='left' disabled><Icon name='checkmark' size='large' color='green' />Broadcast Complete</Button>)
    } else {
      if (this.props.currentsong.length === 0) {
        return (<Button disabled basic icon labelPosition='left' onClick={this.broadcastCurrentSong}><Icon name='share' size='large' color='orange' />Cast Current Song</Button>)
      } else {
        return (<Button basic icon labelPosition='left' onClick={this.broadcastCurrentSong}><Icon name='share' size='large' color='orange' />Cast Current Song</Button>)
      }
    }
  }

  renderListenButton = () => {
    if (this.state.isPlayingCast) {
      return (<Button basic icon labelPosition='left' onClick={this.hearBroadcast}><Icon name='bell slash' size='large' color='orange' />Mute Broadcast</Button>)
    } else {
      return (<Button basic icon labelPosition='left' onClick={this.playCast}><Icon name='headphones' size='large' color='teal' />Listen to Cast</Button>)
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

           {/* BROADCAST CURRENT SONG BUTTON */}
           <p>{this.renderBroadcastCurrentButton()}</p>

          {/* LISTEN TO BROADCAST BUTTON */}
          <p>{this.renderListenButton()}</p>


         </Comment.Group>
        </div>
      )
  }
}

export default PianoRoom;
