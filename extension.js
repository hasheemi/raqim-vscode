// @ts-nocheck
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const player = require("play-sound")();
const findExec = require("find-exec");
const os = require("os");

const { adzanPopup, stopAdzan } = require("./util/adzanPopup");
const { prevBtn, playBtn, nextBtn } = require("./util/raqimControl");
const { svgDown } = require("./util/svgIcon");
const { getWaktu } = require("./util/adzanTime");
const playlist = require("./util/player.json");
const soundPrepare = require("./util/soundPrepare");
let checkPath = (path) => {
  let myos = os.platform();
  if (myos == "win32") return path.substring(1);
  else return path;
};
let listCli = [
  "mplayer",
  "afplay",
  "mpg123",
  "mpg321",
  "play",
  "omxplayer",
  "aplay",
  "cmdmp3",
];
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  //import
  console.log("ahlan wa sahlan fi vscode :v");
  let config = vscode.workspace.getConfiguration("raqim");
  let sound;
  let adzan;
  let isPlay = false;
  let isAdzan = false;
  let soundId = 0;
  let waktuSholat = await getWaktu(config.get("city"), config.get("country"));
  let view = undefined;
  let type;
  let adzanPathr = vscode.Uri.joinPath(
    context.extensionUri,
    "media",
    "adzan.mp3"
  ).path;
  let adzanPath = checkPath(adzanPathr);
  class raqimSidebar {
    constructor(extensionUri) {
      this._extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, token) {
      view = webviewView;
      webviewView.webview.options = {
        enableScripts: true,
      };
      webviewView.webview.html = this.getHtml(webviewView.webview);
      webviewView.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "play":
              let filename = message.judul + ".mp3";
              soundId = message.id;
              type = message.type;
              isPlay == true ? sound.kill() : "";
              soundPrepare(message.type, message.judul);
              playBtn.text = "$(debug-pause)";
              playBtn.command = "raqim.pause";
              prevBtn.show();
              playBtn.show();
              nextBtn.show();
              isPlay = true;
              let soundPath = vscode.Uri.joinPath(
                this._extensionUri,
                "media",
                "sound",
                filename
              ).path;
              sound = player.play(checkPath(soundPath), function (e) {
                if (e) {
                  vscode.window.showErrorMessage(e);
                }
              });
              return;
          }
        },
        undefined,
        context.subscriptions
      );
    }
    getHtml(webview) {
      let itemsHtml = "";
      let playerHtml = "";
      let locationHtml = /*html*/ `
      <h3>${config.get("city")}/${config.get("country")}</h3>
      `;

      const stylesheetUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
      );

      for (const type in playlist) {
        let listHtml = "";
        for (const kk in playlist[type]) {
          let data = playlist[type][kk];
          listHtml += `<div data-judul="${
            data.judul
          }" data-type="${type}" data-id="${
            data.id
          }" class="item">${data.judul.replaceAll("-", " ")}</div>`;
        }
        playerHtml += `
        <div id="${type}" class="player">
        <div class="header">${svgDown}<span>${type}</span></div>
        <div class="list none">${listHtml}</div>
        </div>`;
      }
      for (const key in waktuSholat) {
        itemsHtml += `<div id="waktu"><span id="nama">${key}</span id="jam">${waktuSholat[key]}<span></span></div>`;
      }

      return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <link rel="stylesheet" href="${stylesheetUri}"></link>
      </head>
      <body>
      ${locationHtml}
      <section id="jadwal">
          ${itemsHtml}
        </section>
      <section id="playlist">${playerHtml}</section>
        <script>
        const vscode = acquireVsCodeApi();
        const header = document.querySelectorAll('.header');
        const li = document.querySelectorAll('.item');
        header.forEach((e) => {
          e.onclick = () => {
            e.nextElementSibling.classList.toggle("none")
          }
        })
        function post(judul,type,id){
          li.forEach((e) => {
            e.classList.remove("active")
          })
          let selected = document.querySelectorAll('[data-id="'+id+'"]')[0]
          selected.classList.add("active")
          vscode.postMessage({
              command: "play",
              judul:judul,
              type: type,
              id:id
          })
        }
        li.forEach((e) => {
          e.onclick = () => {
            let judul = e.dataset.judul
            let type = e.dataset.type
            let id = e.dataset.id
            post(judul,type,id)
          }
        })
        window.addEventListener('message', event => {
            const message = event.data; // The JSON data our extension sent
            switch (message.command) {
              case 'nextprev':
                let nid = message.id;
                let nexted = document.querySelectorAll('[data-id="'+nid+'"]')[0];
                if(nexted==undefined) return;
                else{
                  let judul = nexted.dataset.judul
                  let type = nexted.dataset.type
                  let id = nexted.dataset.id
                  post(judul,type,id)
                }
             break;
            }
        });
        </script>
      </body>
      </html>
        `;
    }
  }

  const sidebarProvider = new raqimSidebar(context.extensionUri, vscode);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("raqim.main", sidebarProvider)
  );

  let stopDis = vscode.commands.registerCommand("raqim.stopAdzan", function () {
    stopAdzan();
  });
  let resumeDis = vscode.commands.registerCommand("raqim.resume", function () {
    if (isPlay == "pause") {
      sound.kill("SIGCONT");
      isPlay = true;
      playBtn.text = "$(debug-pause)";
      playBtn.command = "raqim.pause";
    }
  });
  let pauseDis = vscode.commands.registerCommand("raqim.pause", function () {
    if (isPlay == true) {
      sound.kill("SIGSTOP");
      isPlay = "pause";
      playBtn.text = "$(play)";
      playBtn.command = "raqim.resume";
    }
  });
  let nextDis = vscode.commands.registerCommand("raqim.next", function () {
    view.webview.postMessage({
      command: "nextprev",
      id: parseInt(soundId) + 1,
    });
  });
  let prevDis = vscode.commands.registerCommand("raqim.prev", function () {
    view.webview.postMessage({
      command: "nextprev",
      id: parseInt(soundId) - 1,
    });
  });
  let testDis = vscode.commands.registerCommand("raqim.test", function () {
    vscode.window.showInformationMessage(
      `raqim is running on ${os.platform()}`
    );
    vscode.window.showInformationMessage(
      `you have ${findExec(listCli)} player`
    );
  });

  vscode.window.onDidCloseTerminal((e) => {
    sound.kill();
    adzan.kill();
  });

  //push
  setInterval(() => {
    adzanPopup(adzanPath, waktuSholat);
  }, 1000 * 60);
  context.subscriptions.push(stopDis);
  context.subscriptions.push(resumeDis);
  context.subscriptions.push(pauseDis);
  context.subscriptions.push(nextDis);
  context.subscriptions.push(prevDis);
  context.subscriptions.push(testDis);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
