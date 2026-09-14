function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === "/squat" || uri.indexOf("/squat/") === 0) {
    var squatFile = uri.split("/").pop();
    if (uri === "/squat" || uri === "/squat/" || !squatFile.includes(".")) {
      request.uri = "/squat/index.html";
    }
    return request;
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (!uri.split("/").pop().includes(".")) {
    request.uri = uri + "/index.html";
  }

  return request;
}
