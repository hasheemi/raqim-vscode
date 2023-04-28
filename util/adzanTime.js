// @ts-nocheck
// const vscode = require("vscode");
const axios = require("axios");

function getbq(op, inp, min) {
  let dateAwal = new Date(`2023-03-24T${inp}:00`);
  let dateAkhir;
  if (op == "-")
    dateAkhir = new Date(dateAwal.getTime() - parseInt(min) * 60000);
  else dateAkhir = new Date(dateAwal.getTime() + parseInt(min) * 60000);
  return dateAkhir.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

async function getWaktu(kota, negara) {
  let url = `http://api.aladhan.com/v1/timingsByCity/24-03-2023?city=${kota}&country=${negara}&method=11`;
  let res = await axios.get(url);
  let timings = await res.data.data.timings;
  return {
    subuh: timings.Fajr,
    dhuhur: timings.Dhuhr,
    ashar: timings.Asr,
    maghrib: timings.Maghrib,
    isya: timings.Isha,
    dhuha: getbq("+", timings.Sunrise, "25"),
  };
}

module.exports = {
  getWaktu,
  getbq,
};
