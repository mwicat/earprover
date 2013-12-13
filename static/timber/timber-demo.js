var bar_heights = new Array();
var offset = 0;

for(i=0; i<12; i++) {
    bar_heights[i] = 0;
}

function note_detected(noteNumber, amplitude) {
    var below = Math.floor(noteNumber);
    var deltaBelow = 10 * (1 - Math.abs(below - noteNumber));
    var above = below + 1;
    var deltaAbove = 10 * (1 - Math.abs(above - noteNumber));
    below %= 12;
    below %= 12;
    if (below < offset) {
    	below += 12;
    }
    if (above < offset) {
    	above += 12;
    }
    below -= offset;
    above -= offset;
    
    bar_heights[below] += deltaBelow;
    bar_heights[above] += deltaAbove;
}

function debug(message) {
    document.getElementById('debug').innerHTML += message + "<br>";
    document.getElementById('debug').scrollTop = document.getElementById('debug').scrollHeight;
}

var debug_visible = false;

function toggle_debug() {
    debug_visible = !debug_visible;
    if(debug_visible) {
        document.getElementById('debug').style.display = "block";
		document.getElementById('debug').scrollTop = document.getElementById('debug').scrollHeight;
        document.getElementById('debug_toggle_button').innerHTML = "hide debug output";
    } else {
        document.getElementById('debug').style.display = "none";
        document.getElementById('debug_toggle_button').innerHTML = "show debug output";
    }
    return false;
}

function timber_demo_init() {
    var mics = document.getElementById("timber_demo_flash").getMicrophoneNames();
    var selects = "";
    for(i=0; i<mics.length; i++) {
        selects += "<option value='" + mics[i] + "'>" + mics[i] + "</option>";
    }
    document.getElementById("microphone-select").innerHTML = selects;
    document.getElementById("mics").style.display = "block";
    document.getElementById("timber_demo_flash").setCallback("NOTE_DETECTED", "note_detected");
    document.getElementById("timber_demo_flash").setCallback("DEBUG", "debug");
    document.getElementById("timber_demo_flash").setCallback("MIC_INIT", "select_microphone");
    document.getElementById("timber_demo_flash").setCallback("MIC_OK", "mic_ok");
    document.getElementById("timber_demo_flash").setCallback("MIC_FAILED", "mic_failed");
    setTimeout(redraw, 100);
}

function mic_ok() {
    $('#output').show();
}

function mic_failed() {
    alert("Couldn't access a working microphone!");
}

function select_microphone(name) {
    var s = document.getElementById('microphone-select');
    for(i=0; i<s.options.length; i++) {
        if(s.options[i].text == name) {
            s.selectedIndex = i;
        }
    }
}

function microphone_selected() {
    document.getElementById("timber_demo_flash").useMicrophone(document.getElementById('microphone-select').selectedIndex);
}

function redraw() {
	var max = 0;
	var argmax = 0;
    for(i=0; i<12; i++) {
		if (bar_heights[i] > max) {
			max = bar_heights[i];
			argmax = i;
		}
	    $('.note-' + i).css('background-color', 'blue');
        if(bar_heights[i] > 100) {
            bar_heights[i] = 100;
        }
        $('.note-' + i).css('height', bar_heights[i] + "px");
        bar_heights[i] *= 0.8;
    }
    $('.note-' + argmax).css('background-color', 'red');
    setTimeout(redraw, 100);
}
