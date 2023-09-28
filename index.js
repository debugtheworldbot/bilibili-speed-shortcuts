// ==UserScript==
// @name         bilibili 倍速控制
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  使用快捷键控制bilibili的倍速选择
// @author       pipizhu
// @match        http*://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// @license 		 MIT
// ==/UserScript==

(function() {
  "use strict";
  document.body.onload = init;
})();

let speedOptions = [];
const speedList = [0.5, 0.75, 1, 1.25, 1.5, 2];
function addActionBtns() {
  const videoArea = document.querySelector(".bpx-player-primary-area");
  const button = document.createElement("button");
  button.innerHTML = "倍速";
  button.style = "cursor: pointer;position: absolute;left: 0;bottom: 0;";
  videoArea.appendChild(button);
}

async function init() {
  addActionBtns();
  try {
    await delay(1000);
    speedOptions = await initKeyElems();
    bindKeys();
  } catch (e) {
    console.log("error", e);
  }
}

function getCurrentSpeed() {
  return speedOptions.find((item) =>
    item.className.includes("bpx-state-active"),
  ).dataset.value;
}

function bindKeys() {
  const currentSpeed = getCurrentSpeed();
  let currentIndex = speedList.indexOf(parseFloat(currentSpeed));
  document.addEventListener("keydown", (e) => {
    const currentSpeed = getCurrentSpeed();
    currentIndex = speedList.indexOf(parseFloat(currentSpeed));
    if (e.key === "=") {
      currentIndex =
        currentIndex >= speedList.length - 1 ? currentIndex : currentIndex + 1;
    } else if (e.key === "-") {
      currentIndex = currentIndex <= 0 ? currentIndex : currentIndex - 1;
    }
    const speed = speedList[currentIndex];
    setSpeed(speed);
  });
}

function setSpeed(speed) {
  speedOptions.find((item) => item.dataset.value === speed.toString()).click();
}

async function initKeyElems() {
  let count = 0;

  async function getKeys() {
    return new Promise(async (resolve, reject) => {
      // await delay(1000)
      const ctrlKeylist = Array.from(
        document.querySelectorAll(".bpx-player-ctrl-playbackrate-menu li"),
      );
      if (ctrlKeylist.length === 0) {
        if (count <= 20) {
          count += 1;
          await delay(1000);
          return getKeys();
        } else {
          reject("get ctrl keys error ");
        }
      } else {
        resolve(ctrlKeylist);
      }
    });
  }

  const keys = await getKeys();
  return keys;
}

async function delay(time) {
  return new Promise((res) => setTimeout(() => res(), time));
}
