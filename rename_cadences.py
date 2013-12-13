import glob
import os
import shutil
import music21 as m21

for fn in glob.glob('cadences2/*.mp3'):
    basefn = os.path.basename(fn)
    idx1 = basefn.find('_') + 1
    idx2 = basefn.find('.')
    scale = basefn[idx1:idx2]
    scale = scale.replace('b', '-')
    scale = scale.replace('s', '#')
    minor_idx = scale.find('m')
    mode = 'minor' if minor_idx > 0 else 'major'
    tonic = scale[:minor_idx] if minor_idx > 0 else scale
    pitchClass = m21.pitch.Pitch(tonic).pitchClass
    fn2 = 'cadences/%s_%s.mp3' % (pitchClass, mode)
    shutil.copy(fn, fn2)