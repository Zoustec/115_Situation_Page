window.addEventListener("load", function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("ServiceWorker.js");
  }
});

var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var ldBarElement = document.querySelector('.ldBar');
var warningBanner = document.querySelector("#unity-warning");

function unityShowBanner(msg, type) {
  function updateBannerVisibility() {
    warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
  }

  var div = document.createElement('div');
  div.innerHTML = msg;
  warningBanner.appendChild(div);
  if (type == 'error') div.style = 'background: red; color: white; padding: 10px;';
  else if (type == 'warning') {
    div.style = 'background: yellow; color: black; padding: 10px;';
    setTimeout(function () {
      warningBanner.removeChild(div);
      updateBannerVisibility();
    }, 5000);
  } else if (type == 'dialog') {
    div.style = `
                background: white;
                color: black;
                border: 1px solid black;
                padding: 15px;
                width: 300px;
                margin: auto;
                text-align: center;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                `;

    var closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.style = `
                        margin-top: 10px;
                        padding: 5px 10px;
                        background: #007bff;
                        color: white;
                        border: none;
                        cursor: pointer;
                        `;

    closeButton.onclick = function () {
      warningBanner.removeChild(div);
      updateBannerVisibility();
    };

    div.appendChild(closeButton);
  }

  updateBannerVisibility();
}


var buildUrl = "Build";
var loaderUrl = buildUrl + "/v1.0.8_AOI.loader.js";
var config = {
  arguments: [],
  dataUrl: buildUrl + "/v1.0.8_AOI.data.unityweb",
  frameworkUrl: buildUrl + "/v1.0.8_AOI.framework.js.unityweb",


  codeUrl: buildUrl + "/v1.0.8_AOI.wasm.unityweb",



  streamingAssetsUrl: "StreamingAssets",
  companyName: "Zoustec Ltd.",
  productName: "drsignal-AOI",
  productVersion: "v1.0.8",
  showBanner: unityShowBanner,
};

loadingBar.style.display = "block";

var script = document.createElement("script");
var gameInstance = null;
var ws = null;
var client = null;
var destination = null;
var reconnectTimeout = null;
var reconnectCount = 0;

ldBarElement.setAttribute('data-min', 0);
const ldBarInstance = new ldBar(ldBarElement);
script.src = loaderUrl;
script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    ldBarInstance.set(100 * progress + 9);
  }).then((unityInstance) => {
    gameInstance = unityInstance;
    loadingBar.style.display = "none";

    if (ExChange !== "" && ExChange !== null) {
      unityInstance.SendMessage('RabbitMQ_Manager', 'SetInitlizeExChange', ExChange);
      unityInstance.SendMessage('WebSocketClient', 'SetInitlizeExChange', ExChange);
    }

    if (window.parent && window.parent !== window) {
      const messagePayload = {
        type: "UnityReady",
        id: "none"
      };
      window.parent.postMessage(messagePayload, "*");
    }

  }).catch((message) => {
    unityShowBanner("載入出問題了，請關閉瀏覽器重試一遍", "dialog");
  });
};

document.body.appendChild(script);
