onmessage = function(e) {
  var encoded_uri = e.data;
  var decoded = decodeURIComponent(encoded_uri);
  var without_protocol = decoded.replace("irealb://", "");
  var unsplitted = without_protocol.split("==0=0===");
  var openRequest = indexedDB.open("mooche",2);
  openRequest.onupgradeneeded = function(e) {
    var thisDB = e.target.result;
    console.log("upgrading")
    if(!thisDB.objectStoreNames.contains("songs")) {
      thisDB.createObjectStore("songs", {keyPath: "key"});
    }
  }
	openRequest.onsuccess = function(e) {
    db = e.target.result;
		var transaction = db.transaction(["songs"],"readwrite");
		var store = transaction.objectStore("songs");
    for(i in unsplitted) {
      song = unsplitted[i].split("=");
      title = song[0];
      author = song[1];
      store.add({key: title + " (" + author + ")", content: unsplitted[i]})
    }
    postMessage("done");
  }
}
