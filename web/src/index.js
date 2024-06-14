const hasWebSerial = "serial" in navigator;
//import * as path from 'path';
// import { ipcRenderer as ipc } from '../node_modules/@electron';
let isConnected = false;

const $notSupported = document.getElementById("not-supported");
const $supported = document.getElementById("supported");
const $notConnected = document.getElementById("not-connected");
const $connected = document.getElementById("connected");

const $connectButton = document.getElementById("connectButton");
const $startButton = document.querySelector(".start-button");
const $responseElement = document.querySelector(".response");
const $distanceOutput = document.querySelector(".distance-output");
const $finishButton = document.querySelector(".finish-button");
const $mainAudio = document.querySelector(".main-audio");
const $shockAudio = document.querySelector(".shock-audio");

const minimumDistanceFinish = 13;

let playerIs = false;
let finishDistance;
let presenceDistance;
let armDistance;
let shock;
let playerId = localStorage.getItem('playerId') ? parseInt(localStorage.getItem('playerId')) : 1;
let startTime;

//const players = [];

let connectedArduinoPorts = [];

const init = async () => {
  displaySupportedState();
  if (!hasWebSerial) return;

  displayConnectionState();

  navigator.serial.addEventListener("connect", (e) => {
    const port = e.target;
    const info = port.getInfo();
    console.log("connect", port, info);
    if (isArduinoPort(port)) {
      connectedArduinoPorts.push(port);
      if (!isConnected) {
        connect(port);
      }
    }
  });

  navigator.serial.addEventListener("disconnect", (e) => {
    const port = e.target;
    const info = port.getInfo();
    console.log("disconnect", port, info);
    connectedArduinoPorts = connectedArduinoPorts.filter((p) => p !== port);
  });
  $connectButton.addEventListener("click", handleClickConnect);
  $finishButton.addEventListener("click", handleFinishGame);
};

const isArduinoPort = (port) => {
  const info = port.getInfo();
  return info.usbProductId === 32823 && info.usbVendorId === 9025;
};

const handleClickConnect = async () => {
  const port = await navigator.serial.requestPort();
  console.log(port);
  const info = port.getInfo();
  console.log(info);
  await connect(port);
};

const connect = async (port) => {
  isConnected = true;
  displayConnectionState();
  await port.open({ baudRate: 9600 });
  while (port.readable) {
    const decoder = new TextDecoderStream();
    const lineBreakTransformer = new TransformStream({
      transform(chunk, controller) {
        const text = chunk;
        const lines = text.split("\n");
        lines[0] = (this.remainder || "") + lines[0];
        this.remainder = lines.pop();
        lines.forEach((line) => controller.enqueue(line));
      },
      flush(controller) {
        if (this.remainder) {
          controller.enqueue(this.remainder);
        }
      },
    });

    //GET READER
    const readableStreamClosed = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable.pipeThrough(lineBreakTransformer);
    const reader = inputStream.getReader();

    //GET WRITER
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();

    //sends at hte beginning player is false FINALLY
    await writer.write(
      JSON.stringify({
        playerIs: playerIs,
      })
    );

    const sendStartToArduino = async () => {
      playerIs = true;
      console.log("Start game", playerIs);

      await writer.write(
        JSON.stringify({
          playerIs: playerIs,
        })
      );
      await writer.write("\n");
    };
    
    $startButton.addEventListener("click",handleStartGame);
    $startButton.addEventListener("click",sendStartToArduino);
    

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // |reader| has been canceled.
          break;
        }
        try {
          const parsed = JSON.parse(value);
          //console.log(parsed); //slow
          handleArduinoData(parsed);

            if (parsed.finishDistance < minimumDistanceFinish) {
            playerIs = false;
            await writer.write(
              JSON.stringify({
                playerIs: playerIs,
              })
            );

            handleFinishGame();
            console.log("Finish game");
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      reader.releaseLock();
      writer.releaseLock();
      //clearInterval(intervalId);
    }
  }

  port.addEventListener("disconnect", () => {
    isConnected = false;
    console.log("Disconnected");
    displayConnectionState();
  });
};

const displaySupportedState = () => {
  if (hasWebSerial) {
    $notSupported.style.display = "none";
    $supported.style.display = "block";
  } else {
    $notSupported.style.display = "block";
    $supported.style.display = "none";
  }
};

const displayConnectionState = () => {
  if (isConnected) {
    $notConnected.style.display = "none";
    $connected.style.display = "block";
  } else {
    $notConnected.style.display = "block";
    $connected.style.display = "none";
  }
};

let minimumArmDistance = 15;

//const accuracy = [];
// const playerMinMax = [];

//------local storage and creating player

let currentPlayer = null;
//$mainAudio.play();

const handleStartGame = () => {
    addPlayerObject();
    console.log("Start game");
    startTime = new Date();
}

class Player {
    constructor(id) {
        this.id = id;
        this.minDistance = 0;
        this.maxDistance = 0;
        this.time = 0;
    } 

    setMinDistance(distance) {
        this.minDistance = distance;
    }

    setMaxDistance(distance) {
        this.maxDistance = distance;
    }

    setTime(time) {
        this.time = time;
    }
};

const addPlayerObject = () => {
    currentPlayer = new Player(playerId++);
    localStorage.setItem('playerId', playerId);
    $responseElement.innerHTML = `
        Player ID: ${currentPlayer.id}<br>
    `;
};

let playerMin = 6;
let playerMax = 10;

const handleArduinoData = (parsed) => {
    //console.log(parsed);
    finishDistance = parsed.finishDistance;
    presenceDistance = parsed.presenceDistance;
    armDistance = parsed.armDistance;
    shock = parsed.shockOutput;
    
    //console.log("Arm Distance: ", armDistance);

    if (armDistance < playerMin) {
        console.log( "new arm distance", armDistance);
        playerMin = armDistance;
    }

    if (armDistance > playerMax) {
        console.log( "new arm distance", armDistance);
        playerMax = armDistance;
    }

    if (shock && playerIs) {

        // // maybe reverse audio 

        // play it for 1 sec
        // $mainAudio.play();

        $mainAudio.volume = 0.7;

        $shockAudio.play();

        $shockAudio.onended = function() {
            $mainAudio.volume = 1;
        }
    }

    $distanceOutput.innerHTML = `
        Finish Distance: ${finishDistance} cm<br>
        Presence Distance: ${presenceDistance} cm<br>
        Arm Distance: ${armDistance} cm<br>
        Player is: ${playerIs}<br>
        Shock: ${shock} 
    `;
};


const handleFinishGame = () => {
    if (!startTime) {
        console.error("The game has not been started.");
    } else {
        playerIs = false;
    }
    const endTime = new Date(); // Record the end time
    const elapsedTime = (endTime - startTime) / 1000;

    if (currentPlayer) {
        currentPlayer.setTime(elapsedTime);
        currentPlayer.setMinDistance(playerMin);
        currentPlayer.setMaxDistance(playerMax);
    } else {
        console.log("No player to finish");
    }

    console.log(currentPlayer);

    const message = {
        playerId: playerId,
        playerMin: playerMin,
        playerMax: playerMax,
        playerTime: elapsedTime,
    };
    console.log("Game Over, DATA: ", message);

    window.electronAPI.send("finish", message);
    //electronAPI.send('finish-from-win1', data);
};



init();
