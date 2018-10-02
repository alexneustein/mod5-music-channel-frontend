import React, { Component } from "react";
import { Menu, Container, Loader, Confirm } from 'semantic-ui-react'

class SongSelector extends Component {
  state = {
    prompt: false,
    song_id: 0
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
      const { activeItem } = this.state.song_id

      if(this.props.songsLoading) {
        return (
          <Container>
              <Loader active inline>Loading Songs</Loader>
          </Container>
        )
      }
      if (this.props.songList.length > 0) {
        return (
          <div>
            <Container>
            <Menu secondary vertical>
              {songList.map((song, i) => {
                return (
                  <Menu.Item as='a' key={i} id={song.id} onClick={this.show} name={song.title} active={activeItem === song.id}>
                    {song.title}
                  </Menu.Item>
                );
              })}

              <Confirm open={prompt} content='Save your new recording first?' cancelButton='Yes'
            confirmButton="No" size='mini' onCancel={this.handleCancel} onConfirm={this.handleConfirm} />

        </Menu>
            {/*songList.length > 0 ? <Divider /> : ''*/}
          </Container>
          </div>
        );
      } else {
        return (<div></div>)
      }
  }
};

export default SongSelector;
