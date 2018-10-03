import React, { Component } from "react";
import { ActionCable } from 'react-actioncable-provider'
import { WS_URL } from "./RailsURL";
import CastSelector from "./CastSelector";
import onairlogo from './onair.png';
import { Image, Button, Icon, Comment, Header } from 'semantic-ui-react'

class PianoRoom extends Component {
  state = {
    receivedBuffer: [],
    receivedCasts: [],
    playednotes: [],
    isPlayingCast: null,
    isReceiving: null,
    receivingFrom: null
  }

  openConnection = () => {
    return new WebSocket(`${WS_URL}/cable`)
    // return new WebSocket("ws://10.39.104.225:3000/cable")
    // return new WebSocket("wss://flatironchatterbox-api.herokuapp.com/cable")
  }

  onReceived = (e) => {
    // console.log('e.note.note: ', e.note.note);
    if (this.props.currentUser.username !== e.note.note.user.username) {
      if(e.note.note){
        this.createNote(e.note.note)
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
      this.setState({ isReceiving: false, receivingFrom: null},this.saveCastToState)
    }
  }

  saveCastToState = () => {
    let receivedBuffer = this.state.receivedBuffer
    let newSong = []
    const newUser = receivedBuffer[0].user
    const newDate = new Date(receivedBuffer[0].content[3])
    for (const note of receivedBuffer) {
      if (note.content[0] === 1) {break;}
      if (note.content[0] !== 0) {
        let noteCopy = [...note.content]
        newSong = [...newSong, noteCopy]
      }
    };
    const adjustStartTimeBy = newSong[0][3] - 100;
    for (const note of newSong) { note[3] = note[3] - adjustStartTimeBy; }
    const newCast = {user: newUser, date: newDate, song: newSong}
    this.setState(prevState => ({
      receivedCasts: [newCast, ...prevState.receivedCasts],
      receivedBuffer: []
    }))
  }

  playCast = () => {
    if (this.state.receivedBuffer.length > 0) {
      this.setState({
        isPlayingCast: true
      }, this.moveToCurrentSong(this.state.receivedBuffer))
    }
  }

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

  renderReceiving = () => {
    if (this.state.isReceiving) {
      return (
        <div><Icon loading name='sync' size='large' />Receiving Cast from {this.state.receivingFrom.name_first} {this.state.receivingFrom.name_last}</div>
      )
    } else {
      return (<div></div>)
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
         <Comment.Group>
           <Header as='h3' dividing>
             Received Casts
           </Header>
         </Comment.Group>
         {this.renderReceiving()}
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
