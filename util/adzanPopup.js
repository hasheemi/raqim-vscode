const vscode = require("vscode");
const player = require("play-sound")();
const { getbq } = require("./adzanTime");
let adzan;
let adzanPid;

function adzanPopup(path, waktuSholat) {
  delete waktuSholat.dhuha;
  let dnow = new Date();
  let djam = String(dnow.getHours()).padStart(2, "0");
  let dmenit = String(dnow.getMinutes()).padStart(2, "0");
  let dwaktu = `${djam}:${dmenit}`;
  let dwaktuq = getbq("+", dwaktu, 10);
  let sholatVal = Object.values(waktuSholat);
  let sholatKey = Object.keys(waktuSholat);
  let namaSholat = (w) => {
    return sholatKey.find((e) => waktuSholat[e] == w);
  };

  if (sholatVal.includes(dwaktu)) {
    vscode.window.showWarningMessage(
      `it's time to pray ${namaSholat(dwaktu)}, close your laptop immediately!`
    );
    adzan = "";
    adzan = player.play(path, function (e) {
      if (e && !e.killed) vscode.window.showErrorMessage("ra iso");
      else {
        isAdzan = false;
      }
    });
    adzanPid = adzan.pid;
  } else if (sholatVal.includes(dwaktuq)) {
    vscode.window.showInformationMessage(
      `10 more minutes time for ${namaSholat(dwaktuq)} prayer`
    );
  }
}

function stopAdzan() {
  adzan.kill();
}
module.exports = { adzanPopup, stopAdzan, adzanPid };
