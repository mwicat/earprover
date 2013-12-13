from pprint import pprint
from pygame import midi

import music21 as m21

# midi.init()
# 
# 
# devices = list(enumerate(midi.get_device_info(i) for i in range(midi.get_count())))
# output_devices = [(pos, d) for pos, d in devices if d[3] == 1]
# input_devices = [(pos, d) for pos, d in devices if d[2] == 1]
# 
# print output_devices
# 
# import time
# midi.init()
# outp = midi.Output(5)

# def play(note, duration):
#     outp.note_on(note, 127)
#     time.sleep(duration / 1000.)
#     outp.note_off(note)
# 
# outp.set_instrument(25)


from pyquery import PyQuery as pq

def parse(fn):
    d = pq(open(fn).read())
    
    notes, durations = [], []
    
    title = d('tune')[0].get('title')
    
    for n in d('note'):
        notes.append(m21.note.Note(n.get('name')))
        durations.append(int(n.get('duration')))
        
    pitches = [n.pitch for n in notes]
    
    strm = m21.stream.Stream(notes)
    key = strm.analyze('key')
    
    scl = key
    scl2 = key.getRelativeMinor() if key.type == 'major' else key.getRelativeMajor()
    
    degs = [scl.getScaleDegreeFromPitch(p, comparisonAttribute='pitchClass') for p in pitches]
    degs2 = [scl2.getScaleDegreeFromPitch(p, comparisonAttribute='pitchClass') for p in pitches]
    
    s, d = (scl, degs) if (1 in [degs[0], degs[-1]] or 5 in [degs[0], degs[-1]]) else (scl2, degs2)
    
    if isinstance(s, m21.key.Key):
        mode = s.type
    elif isinstance(s, m21.scale.MajorScale):
        mode = 'major'
    elif isinstance(s, m21.scale.MinorScale):
        mode = 'minor'
    else:
        mode = None
    
    notes = [{'name': n.name,
              'midi': n.midi,
              'duration': durations[i],
             'degree': d[i]} for i, n in enumerate(notes)]
    
    tonic = s.getTonic()
    degrees = [s.pitchFromDegree(i) for i in range(1, 8)]
    degrees_data = [{'name': d.name,
                     'midi': d.midi} for d in degrees]
    
    info = {'title': title,
            'notes': notes,
              'mode': mode,
              'degrees': degrees_data,
              'tonic': {'name': tonic.name,
                        'midi': tonic.midi,
                        'pitchClass': tonic.pitchClass}              
              }
    
    return info

import glob

# for fn in glob.glob('xml/*.xml'):
#     key, degs, key2, degs2 = get_degs(fn)
#     k, d = (key, degs) if (1 in [degs[0], degs[-1]] or 5 in [degs[0], degs[-1]]) else (key2, degs2)
#     if (d[0] == 1 or d[0] == 5) and (d[-1] == 1 or d[-1] == 5):
#         print fn, 'OK', k, d[0], d[-1], None in d
#     else:
#         print fn, 'FAIL'

# for n, duration in notes_durations:
#     print n.midi-12, name_to_pitch(n.nameWithOctave), n.nameWithOctave, n, key.getScaleDegreeFromPitch(n.pitch, comparisonAttribute='pitchClass') 
#     play(n.midi-12, duration)
    # time.sleep(duration / 1000.)
     

if __name__ == '__main__':
    fn = 'xml/fur_elise.xml'
    info = parse(fn)
    pprint(info)
    print m21.pitch.Pitch('B-')

# scr = converter.parse('musicxml/Love_Story.mxl')


# del outp
# midi.quit()
