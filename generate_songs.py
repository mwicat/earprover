import json
import service
import os

songs = {}
for fn in os.listdir('xml'):
    fullfn = os.path.join('xml', fn)
    song_data = service.parse(fullfn)
    song_title = song_data['title']
    if song_data['notes'][-1]['degree'] != 1:
        continue
    songs[song_title] = song_data
    print song_title
    
json.dump(songs, open('static/songs.json', 'w'), indent=4)
