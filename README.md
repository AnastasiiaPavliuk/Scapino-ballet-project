# Choreo-Graphica

Welcome to Choreo-Graphica project! This project is designed to run with Arduino and Electron.js to create interactive experiences.

## Installation Guide for client

Follow these steps to set up and run the Choreo-Graphica app:

#### 1. Connect an External Monitor and arduino
Use 24inch monitor for better experience. You can connect arduino just by plugging it in using the provided type-C to type-C cable

#### 2. Install and Unpack the App
- Download the [Choreo-Graphica App] (web/out/make/zip/darwin/arm64/choreo-graphica-darwin-arm64-1.0.0.zip)
- Unpack the zip file
- Run the installer
- Open the unpacked folder.
- Run `setup.exe` (Windows) or the `.dmg` file (Mac) and follow the instructions.

#### 3. Launch the App 
Locate and open the Choreo-Graphica app in your applications list or start menu.



## Arduino circut 

![circut](https://github.com/AnastasiiaPavliuk/Rotrijk/assets/133123399/439029f5-72bb-4e01-b614-1be43ad94db5)



## Code exploration

- **Run on Electron.js:** The project is built to run on Electron.js platform.
- **IPC communication:** Utilizes `ipcRenderer` to communicate between start and finish screens.
- **Arduino Sensors:**
  - Shock sensor
  - Christmas lights
  - Ultrasonic sensors
- **Connected with Serial Reader:** Communicates with Arduino via serial connection.
- **Dynamic Blob Changes:** Changes the blob based on player's data. [Link to the code file](#)



## Experiment iterations 

We explored Tone.js for music experimentation. This library offers functions for distorting audio, custom number of channels, and provides various other interesting features. However, since audio isn't our primary focus, we shifted our attention to other aspects of the project.

### HTML (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scrolltrigger</title>
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
 <h1>lol</h1>
  <audio class="my-audio">
    <source src="./assets/music.mp3" type="audio/mp3">
    Your browser does not support the audio element.
  </audio>

<button class="play">play</button>
<button class="bad-sound">bad sound</button>
<script src="http://unpkg.com/tone"></script>
<script type="module" src="js/script.js"></script>
</body>
</html>
```

### Javascript (script.js)

```js
// import * as Tone from "tone";

const $myAudioElement = document.querySelector(".my-audio");
const $play = document.querySelector(".play");
const $badSound = document.querySelector(".bad-sound");

const synth = new Tone.Synth().toDestination();

const player = new Tone.Player({

});

$play.addEventListener("click", () => {
  $myAudioElement.play();
});

$badSound.addEventListener("click", () => {
  const cheby = new Tone.Chebyshev(50).toDestination();
  synth.triggerAttackRelease("C2", 0.4);
});

```
