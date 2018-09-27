import React, { Component } from "react";
import { List, Confirm } from 'semantic-ui-react'

class SongSelector extends Component {
  state = {
    open: false,
    result: null,
    song_id: null
  }

  show = (e) => this.setState({ open: true, song_id: e.target.id})
  handleConfirm = () => this.setState({ result: 'confirmed', open: false }, handleSelect)
  handleCancel = () => this.setState({ result: 'cancelled', open: false })

    render() {
      const songList = this.props.songList
      const { open, result } = this.state
      return (
        <div className="sixteen wide column">
          <List>
            <List.Item active>Select one...</List.Item>
            {songList.map((song, i) => {
              return (
                <List.Item as='a' key={i} id={song.id} onClick={this.show}>
                  {song.title}
                </List.Item>
              );
            })}
            <Confirm open={open} content='Save your new recording first?' cancelButton='Yes'
          confirmButton="No" size='mini' onCancel={this.handleCancel} onConfirm={this.handleConfirm} />

          </List>
        </div>
      );
  }
};

export default SongSelector;
