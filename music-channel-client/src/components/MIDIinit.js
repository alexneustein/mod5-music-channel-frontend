export const MIDIinit = {
  midiEnabled: false,
  midiAccess: null,
  midiInput: null,
  midiOutput: null,
  midiStatus: null,
  requestMIDI: () => {
    if (MIDIinit.midiEnabled) {
        console.log('MIDI already enabled!')
        MIDIinit.midiStatus = 'MIDI is running'
        MIDIinit.getMIDIIO(MIDIinit.midiAccess)
      } else {
        MIDIinit.midiStatus = 'Starting MIDI'
        navigator.requestMIDIAccess( { sysex: true } )
        .then(MIDIinit.onMIDISuccess, MIDIinit.onMIDIFailure);
      }
    },
  onMIDIFailure: () => {
      console.log('Could not access your MIDI devices.');
      MIDIinit.midiStatus = 'MIDI Failure'
  },
  onMIDISuccess: (midiAccessObject) => {
    MIDIinit.midiStatus = 'MIDI is running'
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
        MIDIinit.midiStatus = 'Output Connected'
      }
    }
    for (var input of inputs.values()) {
        if ((input.name === 'USB2.0-MIDI Port 1') || (input.name === 'P115 Digital Piano')) {
          inputdevice = input
          MIDIinit.midiStatus = 'Input Connected'
        }
    }
    if ((inputdevice === undefined) && (outputdevice === undefined)) {
      MIDIinit.midiStatus = 'Piano Not Found';
    } else if (inputdevice === undefined) {
      MIDIinit.midiOutput = outputdevice
      MIDIinit.midiStatus = 'Piano Input Not Working';
    } else if (outputdevice === undefined) {
      MIDIinit.midiInput = inputdevice
      MIDIinit.midiStatus = 'Piano Output Not Working';
    } else {
      MIDIinit.midiStatus = 'Piano Ready'
      MIDIinit.midiInput = inputdevice
      MIDIinit.midiOutput = outputdevice
    }
  }
}
