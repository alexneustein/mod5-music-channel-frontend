import React, { Component } from "react";
import { Button, Icon, Confirm } from 'semantic-ui-react'

class SongSave extends Component {
  state = {
    shouldPrompt: false,
  }

  promptShow = (e) => {
      this.setState({ shouldPrompt: true })
  }

  promptConfirm = () => this.setState({ shouldPrompt: false }, () => this.props.deleteSong(this.props.currentSongID))
  promptCancel = () => this.setState({ shouldPrompt: false })


    render() {


      if ((this.props.currentsonglength > 1) && (this.props.isRecording === false)) {
        return (
          <div>
            {((this.props.currentSongID === null) || (this.props.isSongSaved !== false)) ? <Button labelPosition='left' icon basic disabled onClick={() => this.props.saveSong()}><Icon name='save' size='large' />Save Changes</Button> : <Button labelPosition='left' icon basic onClick={() => this.props.saveSong()}><Icon name='save' size='large' />Save Changes</Button>}

                <Button labelPosition='left' icon basic onClick={() => this.props.saveSong('new')}>
    <Icon name='add square' size='large'/>
  Save As New </Button>
<Button basic labelPosition='left' icon onClick={() => this.promptShow()}><Icon name='delete' size='large'/>Delete</Button>
                <Confirm open={this.state.shouldPrompt} content='Are you sure you want to delete?' cancelButton='No'
                confirmButton="Yes" size='mini' onCancel={this.promptCancel} onConfirm={this.promptConfirm} />
          </div>
        )
      } else {
        return (
          <div>

          </div>
        )
      }
  }
};

export default SongSave;
