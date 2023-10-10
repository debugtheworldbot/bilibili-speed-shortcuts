// ==UserScript==
// @name         bilibili 倍速控制
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  使用快捷键控制bilibili的倍速选择
// @author       pipizhu
// @match        http*://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
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

async function init() {
  // addActionBtns();
  console.log("init keybindings");
  GM_registerMenuCommand("更多设置", openSettings);
  try {
    const cachedSpeed = GM_getValue("currentSpeed");
    // await delay(1000);
    speedOptions = await initKeyElems();
    if (cachedSpeed) {
      console.log("cached speed", cachedSpeed);
      GM_registerMenuCommand("✅当前记忆倍速 X" + cachedSpeed, () => { });
      setSpeed(cachedSpeed);
    }
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

function addStyle(styleString) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(styleString));
  document.head.append(style);
}

function preserveSpeed() {
  const currentSpeed = getCurrentSpeed();
  GM_setValue("currentSpeed", currentSpeed);
}

function clearSpeed() {
  GM_setValue("currentSpeed", "");
}

function openSettings() {
  const speed = getCurrentSpeed();
  const html = `
    <div class='bli-speed-pannel-setting' id='bli-speed-pannel-setting' style='position: fixed; bottom: 0; right: 0;top: 0;left:0; z-index: 9999;display:flex;justify-content: center;align-items: center'>
      <div style='position:absolute; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);z-index: -1'></div>
      <div style='background: white;padding:20px;border-radius: 5px;'>
        <h2 style='text-align: center;'>当前速度：${speed}</h2>
        <div>
          <button id='save-speed'> 记忆当前速度 </button>
          <button id='clear-speed'> 取消记忆当前速度 </button>
        </div>
        <button style='display: block; margin: 0 auto;margin-top: 20px; ' id='close-pannel-setting'>关闭面板</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  addStyle(`
  .bli-speed-pannel-setting button{
      background: transparent;
      border: 1px solid;
      padding: 5px 8px;
      border-radius: 25px;
    }
  `);

  const closePannel = () => {
    document.body.removeChild(
      document.getElementById("bli-speed-pannel-setting"),
    );
  };

  document.getElementById("save-speed").addEventListener("click", () => {
    preserveSpeed();
    closePannel();
  });
  document.getElementById("clear-speed").addEventListener("click", () => {
    clearSpeed();
    closePannel();
  });
  document
    .getElementById("close-pannel-setting")
    .addEventListener("click", () => {
      closePannel();
    });
}
