onmessage = function(e) {
  var encoded_uri = e.data;
  var decoded = decodeURIComponent(encoded_uri);
  var without_protocol = decoded.replace("irealb://", "");
  var unsplitted = without_protocol.split("==0=0===");
  for(i in unsplitted) {
    postMessage(unsplitted[i]);
  }
}
