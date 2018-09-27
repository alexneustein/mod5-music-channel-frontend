import React, { Component } from "react";
import { List, Confirm, Divider } from 'semantic-ui-react'

class SongSelector extends Component {
  state = {
    prompt: false,
    song_id: null
  }

  show = (e) => {
    if (this.props.isSongSaved === false) {
      this.setState({ prompt: true, song_id: e.target.id})
    }
    else {
      this.setState({ song_id: e.target.id}, () => this.props.handleSelect(this.state.song_id))
    }
  }

  handleConfirm = () => this.setState({ prompt: false }, () => this.props.handleSelect(this.state.song_id))
  handleCancel = () => this.setState({ prompt: false })

    render() {
      const songList = this.props.songList
      const { prompt } = this.state
      return (
        <div className="sixteen wide column">
          <List>
            {songList.map((song, i) => {
              return (
                <List.Item as='a' key={i} id={song.id} onClick={this.show}>
                  {song.title}
                </List.Item>
              );
            })}

            <Confirm open={prompt} content='Save your new recording first?' cancelButton='Yes'
          confirmButton="No" size='mini' onCancel={this.handleCancel} onConfirm={this.handleConfirm} />

          </List>
          {songList.length > 0 ? <Divider /> : ''}
        </div>
      );
  }
};

export default SongSelector;
