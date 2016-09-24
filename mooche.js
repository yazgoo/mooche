var t0 = performance.now();
function mooche_status(text) {
  console.log(text)
  var current = document.getElementById("mooche_status").innerHTML;
  current = current.split("<br>");
  current = [text].concat(current);
  var text = "";
  for(var i = 0; i < 5 && i < current.length; i++) {
    text += current[i] + "<br>"
  }
  document.getElementById("mooche_status").innerHTML = text;
}
setInterval(function(){ mooche_status(""); }, 5000);
var songLoader = new Worker("song_loader.js");
// preload mma by running it once with an empty file
songLoader.onmessage = function(e) {
  mooche_status("songs loaded")
}
function load_songs(textarea) {
  mooche_status("loading songs...")
  songLoader.postMessage(textarea.value);
}
function swap(splitted, i, j) {
    tmp = splitted[i];
    splitted[i] = splitted[j];
    splitted[j] = tmp;
}
function mirror_swap(str, start, size) {
    var splitted = str.split('');
    var count = Math.floor(size / 2);
    for(var i = 0; i < count; i++) {
        swap(splitted, start + i, size + start - i);
    }
    return splitted.join("");
}
function unwarble(warbled) {
    var unwarbled = warbled.replace('1r34LbKcu7', '');
    for(var i = 0; i + 51 < unwarbled.length; i += 50) {
        unwarbled = mirror_swap(mirror_swap(mirror_swap(unwarbled, i + 10, 29), i + 5, 39), i, 49) } return unwarbled.replace(/XyQ/g, "   ").replace(/Kcl/g, "| x").replace(/LZ/g, "|"); } function get_sheet(unwarbled) {
  console.log(unwarbled)
    unwarbled = unwarbled.replace(/\*([ABC])/g, "<span class='part'>$1</span>");
    unwarbled = unwarbled.replace(/\[/g, "<span class='part_start'>&nbsp;</span>");
    unwarbled = unwarbled.replace(/\{/g, "<span class='part_start_repeat'>&nbsp;</span>");
    unwarbled = unwarbled.replace(/T(.)(.)/g, "<span class='sub_0'>$1</span><span class='sub_1'>$1</span>");
    unwarbled = unwarbled.replace(/\^/g, "&#916;");
    var splitted = unwarbled.split('');
    var open_div = "<div class='bar_line'>";
    var close_div = "</div>";
    var open_span = "<span class='bar'>";
    var close_span = "</span>";
    var second_bar = "<span class='second_bar'>&nbsp;</span>"
    var double_close_span = close_span + second_bar;
    var out = open_div + open_span;
    var bars = 0;
    for(i = 0; i < splitted.length; i++) {
        var c = splitted[i];
        var add = "";
        if(c == "|") {
            c = close_span;
          bars += 1;
          if(bars < 4)
          {
            c += open_span
          }
        } else { if(c == "x") { c = "%"; } }
        if(bars == 4 || c == '}' || c == ']') {
            bars = 0;
            if(c == "]") {
                c = double_close_span;
            }
            else {
              c = ""
            }
            addup = ""
            add = close_div + open_div + open_span;
        }
        out += c + add;
    }
    return out + close_span + close_div;
}
function line_to_mma_chords(line) {
    var chords = line.split(" ");
    if(chords.length == 2) {
        chords = [chords[0], "/", chords[1]];
    }
    return chords.join(" ");
}
var play_song_class_name = "play_song_not_ready";
var worker = new Worker("/yazgoo/mma.js/29e5bba60c48da982e587a6a798719568af68a6b/worker.js");
// preload mma by running it once with an empty file
worker.postMessage(["Groove Swing\n0 A7"]);
mooche_status("loading MMA...")
worker.onmessage = function(e) {
  var data = e.data;
  mooche_status("loading MMA done")
  var play_song = document.getElementById("play_song");
  play_song_class_name = "play_song";
  document.getElementById("stop").value = "■"
  var t1 = performance.now();
  console.log("playing a song took " + (t1 - t0) + " milliseconds.")
  if(play_song != null && play_song.className == "play_song_not_ready")
  {
    play_song.className = play_song_class_name;
  }
  if(data == undefined) {
    mooche_status("MMA conversion failed");
  }
  else {
    mooche_status("playing song...");
    play(data);
  }
}
function play_mma(mma) {
  worker.postMessage([mma]);
}
function to_mma(unwarbled) {
    unwarbled = "?Groove Swing\n" + unwarbled.replace(/T../, '')/* todo actually use this tempo stuff */
        .replace(/\{/g, "\n?Repeat\n").replace(/} +/, "\n?RepeatEnding\n")
        .replace(/}/g, "\n?RepeatEnd\n")
        .replace(/\*./g, "").replace(/N1/g, "\n?RepeatEnding\n").replace(/\]\[/g, "?RepeatEnd\n")
        .replace(/<.*>/, "")
        .replace("[", "\n")
        .replace(/N2/g, "\n?RepeatEnding\n").replace("Z", "").replace(/s/g, " ").replace(/,/g, " ")
        .replace(/-/g, "m").replace(/\^/g, "M").replace(/h/g, "").replace(/o7/g, "m7b5").replace(/alt/g, "#5b7b9b13")/*temporary alt replacement*/
        .replace(/\|/g, "\n").replace(/\]\[/g, "\n").replace(/\[/, "\n")
        .replace(/l/g, "\n").replace(/x/g, "").replace(/\([^\)]*\)/g, "")/* lets ignore stuff under () for now*/
    splitted = unwarbled.split("\n");
    var previous = "";
    k = 0;
    for(var i = 0; i < splitted.length; i++) {
        var line = splitted[i];
        if(line.length == 0 || line[0] == '?') previous += line.replace(/\?/g, "")
        else {
            previous += "" + k + " " + line_to_mma_chords(line);
            k += 1;
        }
        previous += "\n";
    }
    return previous
}
function to_mma_opal(unwarbled) {
  return Opal.MMAParser.$new(unwarbled).$run();
}
function play_song(unwarbled) {
  var previous = to_mma_opal(unwarbled)
  play_mma(previous);
}
function get_song(songname, f, error_handler) {
  var openRequest = indexedDB.open("mooche",2);
  openRequest.onupgradeneeded = function(e) {
    var thisDB = e.target.result;
    if(!thisDB.objectStoreNames.contains("songs")) {
      thisDB.createObjectStore("songs", {keyPath: "key"});
    }
  }
  openRequest.onsuccess = function(e) {
    db = e.target.result;
    var transaction = db.transaction(["songs"], "readonly");
    var objectStore = transaction.objectStore("songs");
    var request = objectStore.get(songname);
    request.onsuccess = function(e) {
      f(e.target.result.content);
    }
    request.onerror = function(e) {
      error_handler(e);
    }
  }
  openRequest.onerror = function(e) {
    error_handler(e);
  }
}
function save_song(songname, song) {
  var openRequest = indexedDB.open("mooche",2);
  openRequest.onupgradeneeded = function(e) {
    var thisDB = e.target.result;
    if(!thisDB.objectStoreNames.contains("songs")) {
      thisDB.createObjectStore("songs", {keyPath: "key"});
    }
  }
	openRequest.onsuccess = function(e) {
    db = e.target.result;
		var transaction = db.transaction(["songs"],"readwrite");
		var store = transaction.objectStore("songs");
    store.add({key: songname, content: song})
  }
}
function show_song(songname, error_handler) {
  get_song(songname, function(song) {
    save_song("last_song", song)
    var splitted = song.split("=");
    var title = splitted[0];
    var author = splitted[1].split(" ").reverse().join(" ");
    var unwarbled = unwarble(splitted[6]);
    set_content(
        "<input type=button id=play_song class="+play_song_class_name
        + " value='&#9654;' onclick=\"play_song('"+unwarbled+"')\"/>"
				+ "<span class=song_title>"+title+"</span>"
        + "<span class=song_author>"+author+"</span><br/><br/>"
        + get_sheet(unwarbled));
  }, error_handler);
}
var songs_list_written;
var songs_list_div;
function show_songs_list(div) {
  songs_list_div = div;
  mooche_status("showing songs...");
  var openRequest = indexedDB.open("mooche",2);
  openRequest.onupgradeneeded = function(e) {
    var thisDB = e.target.result;
    if(!thisDB.objectStoreNames.contains("songs")) {
      thisDB.createObjectStore("songs", {keyPath: "key"});
    }
  }
  openRequest.onsuccess = function(e) {
    db = e.target.result;
    var transaction = db.transaction(["songs"],"readonly");
    var store = transaction.objectStore("songs");
    var cursor = store.openCursor();
    var s = ""
    var i = 0;
    songs_list_div.innerHTML = ""
    cursor.onsuccess = function(e) {
      var res = e.target.result;
      if(res) {
        s += "<div class='song' onclick=\"show_song('"+res.key+"')\">" + res.key  + "</div>";
        i += 1;
        if(i > 100) {
          songs_list_div.innerHTML += s;
          s = "";
          i = 0;
        }
        res.continue();
      } else {
          songs_list_div.innerHTML += s;
      }
    }
  }
}
function set_content(str) {
    var content = document.getElementById("content");
    content.innerHTML = str;
}
function show_imports() {
    set_content("<div class=imports_explanation>Right click and copy link location on song links below,"
        + "then paste it in this text field below<div/>"
        + "<textarea type=text class=import onchange='load_songs(this)'></textarea>"
        + "<iframe class=mooche_forums src='http://www.irealb.com/forums/'></iframe>");
}
function show_about() {
    set_content('Mooche is <b>free</b> software (as in freedom).<br/>'
            +'This means it guarantees 4 fundamentals rights:<br/>'
            +'<ul>'
            +'<li>Freedom 0: The freedom to <b>run</b> the program for any purpose.</li>'
            +'<li>Freedom 1: The freedom to <b>study</b> how the program works, and change it to make it do what you wish.</li>'
            +'<li>Freedom 2: The freedom to <b>redistribute</b> and make copies so you can help your neighbor.</li>'
            +'<li>Freedom 3: The freedom to <b>improve</b> the program, and release your improvements (and modified versions in general) to the public, so that the whole community benefits.</li>'
            +'</ul>')
}
function show_songs() {
    show_songs_list(document.getElementById('content'));
}
function show_songs_or_last_song() {
  show_song("last_song", show_songs);
}

