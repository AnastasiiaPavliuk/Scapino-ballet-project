const hasWebSerial = "serial" in navigator;
import Player from './modules/player.js';
import { displaySupportedState, displayConnectionState, toggleDevVisibility} from './modules/ui.js';
let isConnected = false;


///-------
///-----

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
const $toggleButton = document.querySelector(".toggle-button");
const $navbarLinks = document.querySelector(".navbar-links");

const $buttonHTP = document.querySelector(".button-htp");


const minimumDistanceFinish = 30;

let playerIs = false;
let finishDistance;
let presenceDistance;
let armDistance;
let shock;
let playerId = localStorage.getItem('playerId') ? parseInt(localStorage.getItem('playerId')) : 1;
let startTime;
let playerMin;
let playerMax;

let connectedArduinoPorts = [];


const init = async () => {
   //displaySupportedState();
  displaySupportedState(hasWebSerial, $notSupported, $supported);
  if (!hasWebSerial) return;

   displayConnectionState(isConnected, $notConnected, $connected);
   //displayConnectionState();

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
  $buttonHTP.addEventListener("click", showHTPSection);

  //handleClickConnect();
  $finishButton.addEventListener("click", handleFinishGame);

  $toggleButton.addEventListener("click", () => {
    $navbarLinks.classList.toggle("active")
  });

  document.addEventListener('keydown', toggleDevVisibility);
};

const showHTPSection = () => {
  const instructions = document.querySelector(".instructions");
  const index = document.querySelector(".index");

  instructions.classList.toggle("hidden");
  index.classList.toggle("hidden");

  if (!instructions.classList.contains("hidden")) {
  $buttonHTP.innerHTML = "Back";
  } else {
    $buttonHTP.innerHTML = "How to Play";
  }
}


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
  displayConnectionState(isConnected, $notConnected, $connected);
  // displayConnectionState();
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


    const handleStartEvent = () => {
    //console.log("hanldeStartEvent");
    handleStartGame();
    //make button disabled
    // if (playerIs) {
     $startButton.disabled = true;
    // };
    sendStartToArduino(writer);
    };

    $startButton.addEventListener("click", handleStartEvent);

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
          handleArduinoData(parsed, writer);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      reader.releaseLock();
      writer.releaseLock();
    }
  }

  port.addEventListener("disconnect", () => {
    isConnected = false;
    console.log("Disconnected");
    // displayConnectionState();
    displayConnectionState(isConnected, $notConnected, $connected);
  });
};

//------local storage and creating player

let currentPlayer = null;
//$mainAudio.play();

const handleStartGame = () => {
  //currentPlayer = addPlayerObject(playerId, $responseElement);
    addPlayerObject();
    console.log("Start game");
    startTime = new Date();


  playerMin = 10;
  playerMax = 11;
}

const addPlayerObject = () => {
  currentPlayer = new Player(playerId++);
  localStorage.setItem('playerId', playerId);
  $responseElement.innerHTML = `
        Player ID: ${currentPlayer.id}<br>
    `;
};

const sendStartToArduino = async (writer) => {
  console.log(writer);
  playerIs = true;
  console.log("Start game", playerIs);

  await writer.write(
    JSON.stringify({
      playerIs: playerIs,
    })
  );
  await writer.write("\n");
};


const handleArduinoData =  async (parsed, writer) => {

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

    if (armDistance > playerMax && armDistance < 25 ) {
        console.log( "new arm distance", armDistance);
        playerMax = armDistance;
    }

    if (shock && playerIs) {
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
    $startButton.disabled = false;
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
