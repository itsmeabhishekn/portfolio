function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === "/squat" || uri.indexOf("/squat/") === 0) {
    var last = uri.split("/").pop();
    if (uri === "/squat" || uri === "/squat/" || last.indexOf(".") === -1) {
      request.uri = "/squat/index.html";
    }
    return request;
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else {
    var file = uri.split("/").pop();
    if (file.indexOf(".") === -1) {
      request.uri = uri + "/index.html";
    }
  }

  return request;
}
