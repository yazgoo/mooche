function load_songs(textarea) {
    var encoded_uri = textarea.value;
    var decoded = decodeURIComponent(encoded_uri);
    var without_protocol = decoded.replace("irealb://", "");
    var unsplitted = without_protocol.split("==0=0===");
    for(i in unsplitted) {
        song = unsplitted[i].split("=");
        title = song[0];
        author = song[1];
        localStorage[title + " (" + author + ")"] = unsplitted[i]
    }
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
        unwarbled = mirror_swap(mirror_swap(mirror_swap(unwarbled, i + 10, 29), i + 5, 39), i, 49)
    }
    return unwarbled.replace(/XyQ/g, "   ").replace(/Kcl/g, "| x").replace(/LZ/g, "|");
}
function get_sheet(unwarbled) {
    unwarbled = unwarbled.replace(/\*([ABC])/g, "<span class='part'>$1</span>");
    unwarbled = unwarbled.replace(/\[/g, "<span class='part_start'>&nbsp;</span>");
    unwarbled = unwarbled.replace(/T(.)(.)/g, "<span class='sub_0'>$1</span><span class='sub_1'>$1</span>");
    unwarbled = unwarbled.replace(/\^/g, "&#916;");
    var splitted = unwarbled.split('');
    var open_div = "<div class='bar_line'>";
    var close_div = "</div>";
    var open_span = "<span class='bar'>";
    var close_span = "</span>";
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
        }
        else { if(c == "x") { c = "%"; } }
        if(bars == 4 || c == '}' || c == ']') {
            bars = 0;
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
function play_mma(mma) {
  var worker = new Worker("//yazgoo.github.io/pypyjs-mma/worker.js")
  worker.postMessage([mma]);
  console.log('Message posted to worker');
  worker.onmessage = function(e) {
    console.log('Message received from worker');
    console.log(btoa(e.data));
    data = e.data
      console.log("playing " + data);
    play(data);
  }
}
function play_song(unwarbled) {
    var previous = "";
    unwarbled = unwarbled.replace(/T../, '?Groove Mambo\n')
        .replace(/\{/g, "\n?Repeat\n").replace(/}/g, "\n?RepeatEnd\n")
        .replace(/\*./g, "").replace(/N1/g, "\n?RepeatEnding\\2\n").replace("][", "")
        .replace("[", "\n")
        .replace(/N2/g, "").replace("Z", "").replace(/s/g, " ").replace(/,/g, " ")
        .replace(/-/g, "m").replace(/\^/g, "M").replace(/h/g, "dim")
        .replace(/\|/g, "\n").replace(/\]\[/g, "\n").replace(/\[/, "\n")
        .replace(/l/g, "\n")
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
    console.log(previous);
    play_mma(previous);
}
function show_song(title) {
    var song = localStorage[title];
    localStorage["last_song"] = song;
    var splitted = song.split("=");
    var title = splitted[0];
    var author = splitted[1];
    var unwarbled = unwarble(splitted[6]);
    set_content("<b>"+title+" ("+author+")</b>"
            + "<input type=button value='>' onclick=\"play_song('"+unwarbled+"')\"/><br/><br/>"
            + get_sheet(unwarbled));
}
function show_songs_list(div) {
    div.innerHTML = "";
    for(var i = 0; i < 100;/*localStorage.length*/ i++) {
        var title = localStorage.key(i);
        div.innerHTML += "<a onclick=\"show_song('"+title+"')\">" + title  + "</a><br/>";
    }
}
function set_content(str) {
    var content = document.getElementById("content");
    content.innerHTML = str;
}
function show_imports() {
    set_content("<input type=text onchange='load_songs(this)'/>");
}
function show_about() {
    set_content('Mooche is <b>free</b> software (as in freedom).<br/>'
            +'This means it guarantees 4 fundamentals rights:<br/>'
            +'<ul>'
            +'<li>Freedom 0: The freedom to <b>run</b> the program for any purpose.</li>'
            +'<li>Freedom 1: The freedom to <b>study</b> how the program works, and change it to make it do what you wish.</li>'
            +'<li>Freedom 2: The freedom to <b>redistribute</b> and make copies so you can help your neighbor.</li>'
            +'<li>Freedom 3: The freedom to <b>improve</b> the program, and release your improvements (and modified versions in general) to the public, so that the whole community benefits.</li>'
            +'</ul>'
            +'<iframe width="560" height="315" src="'
            +'https://www.youtube.com/embed/CDVZdZMCc0w"'
            +' frameborder="0" allowfullscreen></iframe>')
}
function show_songs() {
    show_songs_list(document.getElementById('content'));
}
function show_songs_or_last_song() {
    if(localStorage["last_song"] != null) {
        show_song("last_song");
    }
    else {
        show_songs();
    }
}

