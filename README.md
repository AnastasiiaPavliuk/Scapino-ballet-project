# Choreo-Graphica

Welcome to Choreo-Graphica project! This project is designed to run with Arduino and Electron.js to create interactive experiences.

## Installation

To get started, clone the repository and follow these steps:

```bash
git clone https://github.com/AnastasiiaPavliuk/Rotrijk.git/choreo-graphica
cd choreo-graphica
npm install
npm start
```

**Note:** This project requires Arduino to run.


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
