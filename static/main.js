function randomDeg() {
	return Math.round(Math.random() * 7) + 1;
}

var previous_notes = '';
var loaderNum = 0;
var currentSong = undefined;
var timeouts = [];
var songs;
var firstRun = true;
var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

function stopGuess() {
	$('#buttons a').unblock();
	clearSongTimeouts();
	previous_notes = '';
	$('#note').html(previous_notes + '<span style="color: blue">?</span>');
}

function clearSongTimeouts() {
	var tm = timeouts.pop();
	while (tm !== undefined) {
		console.log('clearing ' + tm);
		window.clearTimeout(tm);
		tm = timeouts.pop();
	}
}

function setSongTimeout(song, f, t) {
	var tm = window.setTimeout(function() {
		if (currentSong != song) {
			return;
		}
		f();
	}, t);
	timeouts.push(tm);
	return tm;
}

function blockUI(msg) {
	msg = (msg === undefined) ? null : msg;
	$.blockUI({
		message : msg
	});
}

function guess(song, pos) {
	var note = song['notes'][pos];

	if (currentSong != song) {
		return;
	}

	if (note === undefined) {
		$('#note').html(previous_notes + '.');
		$('#question').html(':)');
		return;
	}

	window.setTimeout(function() {
		play(note['midi'], note['duration']);
	}, 10);

	var deg = note['degree'];

	if (deg === null) {
		$("#question").css('color', 'blue');
		$('#question').html('X');
		deg = 'X';
		$('#buttons a').block({
			message : null
		});

	} else {
		$("#question").css('color', 'black');
		$('#question').html('?');
	}

	var check_answer = function(answer) {
		var answer = (answer < 8) ? answer : (answer % 8 + 1);
		if (deg !== 'X') {
			var correct = (answer == deg);
			var color = ( correct ? 'green' : 'red');
		} else {
			var color = 'blue';
		}
		$('#buttons a').unblock();

		previous_notes += ' ' + '<span style="color: ' + color + '">' + deg + '</span>';

		$("#question").css('color', color);

		$('.deg' + deg + ' span').css('background-color', color);
		//$('.deg' + answer + ' span').css('background-color', color);

		guessTimeout = setSongTimeout(song, function() {
			guess(song, pos + 1);
			$('#buttons span').css('background-color', '');
			$("#question").css('color', 'black');
		}, 500);

		$('#note').html(previous_notes + ' <span style="color: blue">?</span>');

		$(document).off('keypress', on_keypress);

	};

	var check_timeout = null;
	if ($('#timedGuess').is(':checked')) {
		check_timeout = setSongTimeout(song, function() {
			console.log('checking on timeout ' + (note['duration'] + 2000));
			check_answer();
		}, note['duration'] + 2000);
	}

	var on_keypress = function(event) {
		if (song != currentSong) {
			return;
		}
		window.clearTimeout(check_timeout);
		var c = String.fromCharCode(event.which);
		var answer = parseInt(c);
		if (answer !== undefined)
			check_answer(answer);
	};

	hookDegreeButtons(song, function(song, deg) {
		if ($('#answerAction').is(':checked')) {
			check_answer(deg);
		}
	});

	// if (pos <= 0) {
	// $('.previous').block({
	// message : null
	// });
	// } else {
	// $('.previous').unblock();
	// }

	$('.previous').off('click').click(function(e) {
		window.clearTimeout(check_timeout);
		if (pos > 0)
			guess(song, pos - 1);
	});

	$('.next').off('click').click(function(e) {
		window.clearTimeout(check_timeout);
		guess(song, pos + 1);
	});

	$('#repeatNote').off('click').click(function() {
		play(note['midi'], note['duration']);
	});

	$(document).off('keypress').on('keypress', on_keypress);

}

function hookDegreeButtons(song, cb) {
	var hookDegree = function(e) {
		var deg = parseInt($(this).text());
		if (deg === NaN) {
			return;
		}
		if ($('#previewAction').is(':checked')) {
			playDegree(song['degrees'], deg);
		}
		if ($('#previewSolfAction').is(':checked')) {
			playDegreesSolfege(song['degrees'], deg);
		}
		if (cb !== undefined) {
			cb(song, deg);
		}
	};
	$('#buttons a').off('click').click(hookDegree);
}

function play(note, duration, velocity) {
	if (note === undefined) {
		return;
	}
	var velocity = (velocity === undefined ? 127 : velocity);
	var delay = 0;
	var duration = duration / 1000.0;
	MIDI.noteOn(0, note, velocity, delay);
	MIDI.noteOff(0, note, delay + duration);
}

function playCadence(name, cb) {
	var url = './cadences/' + name + '.mp3';
	console.log(url);
	soundManager.createSound({
		id : 'c' + name,
		url : url
	});
	soundManager.play('c' + name, {
		onfinish : cb
	});
}

function playDegrees(degs, from, to, step) {
	to = (to === undefined) ? from : to;
	step = (step === undefined) ? 1 : step;

	var buttonNum = (from < 8) ? from : (from % 8 + 1);

	$('.deg' + buttonNum + ' span').css('background-color', 'blue');
	playDegree(degs, from);

	setTimeout(function() {
		$('.deg' + buttonNum + ' span').css('background-color', '');
		if (from !== to) {
			playDegrees(degs, from + step, to, step);
		}
	}, 1000);
}

function playDegree(degs, pos) {
	var deg = degs[(pos - 1) % 7];
	var midi = deg['midi'];
	if (pos > 7) {
		midi += 12;
	}
	play(midi, 500);
}

function playDegreesSolfege(degs, deg) {
	if (deg < 5) {
		playDegrees(degs, deg, 1, -1);
	} else {
		playDegrees(degs, deg, 8, 1);
	}
}

function playMidiCadence(cadence, cb) {
	var delay = 1.0;
	var chords = [[48, 64, 79], [53, 60, 69], [55, 59, 62], [48, 64, 79]];
	var i = 0;
	for (; i < chords.length; i++) {
		var chord = chords[i];
		MIDI.chordOn(0, chord, 127, i * delay);
		MIDI.chordOff(0, chord, (i + 1) * delay);
	}
	setTimeout(cb, i * delay);
}

function playSong(song, pos) {
	if (pos === undefined) {
		blockUI('Playing "' + song['title'] + '"');
	}
	var pos = (pos === undefined) ? 0 : pos;
	var note = song['notes'][pos];
	if (note === undefined) {
		$.unblockUI();
		return;
	}
	play(note['midi'], note['duration']);
	window.setTimeout(function() {
		playSong(song, pos + 1);
	}, note['duration']);

}

function startGuess(song) {
	previous_notes = '';
	loaderNum++;
	currentSong = song;
	var loader2 = new widgets.Loader({
		id : "loader" + loaderNum,
		message : "Now, you will hear " + song['mode'] + " cadence. It will establish your impression how the tonic should sound in this song."
	});

	// MIDI.noteOn(0, 60, 1, 0);
	// MIDI.noteOff(0, 60, 1);

	soundManager.setup({
		url : './soundmanager/swf/',
		onready : function() {
			var tonic = song['tonic']['pitchClass'];
			var cadence = tonic + '_' + song['mode'];
			$.blockUI({
				message : null
			});
			playCadence(cadence, function() {
				$.unblockUI();
				loader2.stop();
				window.setTimeout(function() {
					guess(song, 0);
				}, 1000);
			});
		}
	});

	// playMidiCadence(function() {
	// guess(song, 0);
	// });

}

function initMidi() {
	MIDI.loadPlugin({
		soundfontUrl : "./soundfont/",
		instrument : "acoustic_grand_piano",
		callback : function() {
			MIDI.loader.stop();
			MIDI.setVolume(0, 127);

			var jqxhr = $.getJSON("./songs.json", function(songs_data) {
				songs = songs_data;
				var sorted = [];
				for (var key in songs_data) {
					sorted[sorted.length] = key;
				}
				sorted.sort();

				var majors = [];
				var minors = [];

				$.each(sorted, function(idx, title) {
					var s = songs_data[title];
					if (s['mode'] == 'major') {
						majors.push(title);
					} else if (s['mode'] == 'minor') {
						minors.push(title);
					}
				});

				function appendOptions(grpname, items) {
					var grp = $('#songs').append($('<optgroup>', {
						label : grpname
					}));

					$.each(items, function(idx, title) {
						$(grp).append($('<option>', {
							value : title,
							text : title
						}));
					});

				}

				appendOptions('Major', majors);
				appendOptions('Minor', minors);

				function getSelectedSong() {
					var songName = $("select#songs option:selected").text();
					return songs_data[songName];
				}

				hookDegreeButtons(getSelectedSong());

				$('select#songs').change(function() {
					// $("select option:selected").each(function() {
					// stopGuess();
					// var songName = $(this).text();
					// startGuess(songs_data[songName]);
					// });
					$('#restart span').text('Start');
					var song = getSelectedSong();
					hookDegreeButtons(song);
					var firstDeg = song['degrees'][0]['midi'];
					offset = firstDeg % 12;
				});

				$('#restart').button().click(function() {
					if (iOS && firstRun) {
						play(60, 100, 1);
						firstRun = false;
					}
					stopGuess();
					var songName = $("select option:selected").text();
					$('#restart span').text('Restart');
					startGuess(getSelectedSong());
				});

				$('#stop').button().click(function() {
					stopGuess();
				});

				$('#preview').click(function() {
					playSong(getSelectedSong());
				});

				$('#playCadence').button().click(function() {
					blockUI();
					var song = getSelectedSong();
					var tonic = song['tonic']['pitchClass'];
					var cadence = tonic + '_' + song['mode'];

					playCadence(cadence, function() {
						$.unblockUI();
					});
				});

				$('#playTonic').button().click(function(e) {
					var song = getSelectedSong();
					var tonic = song['tonic'];
					play(tonic['midi'], 500);
				});

				// $('#buttons a').on('mousedown', function(e) {
				// if (e.which !== 2) {
				// return;
				// }
				// var song = getSelectedSong();
				// var deg = parseInt($(this).text());
				// var deg_note = song['degrees'][deg - 1];
				// play(deg_note['midi'], 500);
				// });

				$.unblockUI();

				//startGuess(songs_data['Jingle Bells']);
			});

		}
	});
}

$(function() {
	$.blockUI({
		message : null
	});
	//window.webkitAudioContext = window.webkitAudioContext || window.AudioContext;
	MIDI.loader = new widgets.Loader();
	initMidi();
	$('#buttons a').button().width(80).height(50);
	$('#repeatNote').button();
	$('#restart').button();
	$('#stop').button();
	$('#playCadence').button();
	$('#playTonic').button();
	$('.previous').button();
	$('.next').button();
	$('#buttons span').css('margin-top', '10%');
});
