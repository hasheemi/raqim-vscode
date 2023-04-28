const { window, StatusBarAlignment } = require("vscode");

function createBtn(text, tooltip, command, pr) {
  let btn = window.createStatusBarItem(StatusBarAlignment.Left, pr);
  btn.text = text;
  btn.tooltip = tooltip;
  btn.command = command;

  return btn;
}
let prevBtn = createBtn("$(chevron-left)", "prev", "raqim.prev", 999);
let playBtn = createBtn("$(debug-pause)", "pause", "raqim.pause", 999);
let nextBtn = createBtn("$(chevron-right)", "next", "raqim.next", 999);

module.exports = { prevBtn, playBtn, nextBtn };
