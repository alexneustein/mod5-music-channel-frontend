import React, { Component } from "react";
import { Button } from 'semantic-ui-react'

class SongSave extends Component {

    render() {
      if ((this.props.currentsonglength > 1) && (this.props.isRecording === false)) {
        return (
          <div>
            {((this.props.currentSongID === null) || (this.props.isSongSaved !== false)) ? <Button basic disabled onClick={() => this.props.saveSong()}>Save Changes</Button> : <Button basic onClick={() => this.props.saveSong()}>Save Changes</Button>}

                <Button basic onClick={() => this.props.saveSong('new')}>Save As New Song</Button>
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
