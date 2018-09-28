export const MIDIinit = {
  midiEnabled: false,
  midiAccess: null,
  midiInput: null,
  midiOutput: null,
  requestMIDI: () => {
    if (MIDIinit.midiEnabled) {
        console.log('MIDI already enabled!')
        MIDIinit.getMIDIIO(MIDIinit.midiAccess)
      } else {
        console.log('MIDI not yet enabled. Enabling...')
        navigator.requestMIDIAccess( { sysex: true } )
        .then(MIDIinit.onMIDISuccess, MIDIinit.onMIDIFailure);
      }
    },
  onMIDIFailure: () => {
      console.log('Could not access your MIDI devices.');
  },
  onMIDISuccess: (midiAccessObject) => {
    console.log('MIDI enabled!')
    MIDIinit.midiEnabled = true
    MIDIinit.midiAccess = midiAccessObject
    MIDIinit.getMIDIIO()
  },
  getMIDIIO: () => {
    var inputs = MIDIinit.midiAccess.inputs;
    var outputs = MIDIinit.midiAccess.outputs;
    // ****Keyboard Select if time permits
    let outputdevice
    let inputdevice
    for (var output of outputs.values()) {
      if ((output.name === 'USB2.0-MIDI Port 1') || (output.name === 'P115 Digital Piano')) {
        outputdevice = output
      }
    }
    for (var input of inputs.values()) {
        if ((input.name === 'USB2.0-MIDI Port 1') || (input.name === 'P115 Digital Piano')) {
          inputdevice = input
        }
    }
    MIDIinit.midiInput = inputdevice
    MIDIinit.midiOutput = outputdevice
  }
}
