const http = require("https");
const fs = require("fs");
const path = require("path");
const data = require("./player.json");
const { window } = require("vscode");

function soundPreapare(type, name) {
  let spath = path.join(__dirname, `../media/sound/${name}.mp3`);

  if (!fs.existsSync(spath)) {
    let url = data[type].find((e) => e.judul == name).url;
    const request = http.get(url, (res) => {
      if (!res.statusCode == 200) {
        console.error("gagal masbro");
        return;
      }
      // console.log("test");
      window.showInformationMessage(
        `downloading ${name} audio file, please wait`
      );
      const stream = fs.createWriteStream(spath);
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
        window.showInformationMessage(
          "file downloaded successfully, click again to play"
        );
        return;
      });
    });
    request.on("error", (e) => {
      console.error("ra iso" + e);
    });
    return;
  } else {
    return;
  }
}

module.exports = soundPreapare;
