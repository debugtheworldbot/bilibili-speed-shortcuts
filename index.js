// ==UserScript==
// @name         bilibili 倍速控制
// @namespace    http://tampermonkey.net/
// @version      0.8
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

let upKeyCode = "Period";
let downKeyCode = "Comma";
function addActionBtns() {
  const videoArea = document.querySelector(".bpx-player-primary-area");
  const button = document.createElement("button");
  button.innerHTML = "倍速";
  button.style = "cursor: pointer;position: absolute;right: -30px;bottom: 0;";
  button.addEventListener("click", () => {
    const div = document.createElement("div");
    const downInput = document.createElement("input");
    const upInput = document.createElement("input");
    const saveBtn = document.createElement("button");
    downInput.value = downKeyCode;
    upInput.value = upKeyCode;
    downInput.maxLength = upInput.maxLength = 1;
    downInput.style = "width: 1rem";
    upInput.style = "width: 1rem";
    div.style.position = "absolute";
    div.style.right = "0";
    div.style.bottom = "0";
    div.style.background = "white";
    div.style.zIndex = "1000";
    div.append("倍速+");
    div.appendChild(downInput);
    div.append("倍速-");
    div.appendChild(upInput);
    div.appendChild(saveBtn);
    videoArea.appendChild(div);
    saveBtn.innerHTML = "保存";
    saveBtn.addEventListener("click", () => {
      upKeyCode = upInput.value;
      downKeyCode = downInput.value;
      div.innerHTML = "保存成功";
      setTimeout(() => {
        div.remove();
      }, 3000);
    });
  });
  videoArea.appendChild(button);
}

async function init() {
  // addActionBtns();
  console.log("init keybindings");
  try {
    // await delay(1000);
    speedOptions = await initKeyElems();
    bindKeys();
    console.log("bind success!");
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
    if (e.key === "2") {
      setSpeed(2);
      return;
    }
    if (e.key === "5") {
      setSpeed(1.5);
      return;
    }
    if (e.key === "1") {
      setSpeed(1);
      return;
    }
    if (e.key === "3") {
      setSpeed(3);
      return;
    }
    const currentSpeed = getCurrentSpeed();
    currentIndex = speedList.indexOf(parseFloat(currentSpeed));
    if (e.code === upKeyCode && e.shiftKey) {
      // press >
      currentIndex =
        currentIndex >= speedList.length - 1 ? currentIndex : currentIndex + 1;
    } else if (e.code === downKeyCode && e.shiftKey) {
      // press <
      currentIndex = currentIndex <= 0 ? currentIndex : currentIndex - 1;
    }
    const speed = speedList[currentIndex];
    setSpeed(speed);
  });
}

function setSpeed(speed) {
  if (speed > 2) {
    const video = getCurrentVideo();
    video.playbackRate = speed;
    return;
  }
  const option = speedOptions.find(
    (item) => item.dataset.value === speed.toString(),
  );
  if (option) {
    option.click();
  } else {
    console.error("set speed error", speed);
  }
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
          resolve(await getKeys());
        } else {
          reject("get ctrl keys error ");
        }
      } else {
        console.log("get key success");
        return resolve(ctrlKeylist);
      }
    });
  }

  const keys = await getKeys();
  return keys;
}

async function delay(time) {
  return new Promise((res) => setTimeout(() => res(), time));
}

function getCurrentVideo() {
  let vdos = document.querySelectorAll(".bpx-player-video-wrap bwp-video");
  if (vdos.length > 0) return vdos;
  vdos = document.querySelectorAll(".bpx-player-video-wrap video");
  return vdos[0];
}
