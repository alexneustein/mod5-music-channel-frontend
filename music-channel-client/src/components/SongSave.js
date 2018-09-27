import React, { Component } from "react";
// import { List, Confirm, Divider } from 'semantic-ui-react'

class SongSave extends Component {

    render() {
      if ((this.props.currentsonglength > 1) && (this.props.isRecording === false)) {
        return (
          <div>
            {this.props.isSongSaved === false ? <button onClick={() => this.props.saveSong()}>Save Changes</button> : <button disabled onClick={() => this.props.saveSong()}>Save Changes</button>}

                <button onClick={() => this.props.saveSong('new')}>Save As New Song</button>
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
