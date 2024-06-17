# Choreo-Graphica

Welcome to Choreo-Graphica project! This project is designed to run with Arduino and Electron.js to create interactive experiences.

## Installation Guide for client

Follow these steps to set up and run the Choreo-Graphica app:

### 1. Connect an External Monitor
1. **Use a 24-inch monitor** (recommended).
2. **Connect via HDMI cable** to your computer.

### 2. Connect the Arduino
1. **Plug in the Arduino** using the provided type-C cable.

### 3. Install and Unpack the App
1. **Download the app** from the provided link.
2. **Unpack the zip file**:
   - Right-click and select "Extract All" (Windows) or double-click to unzip (Mac).
3. **Run the installer**:
   - Open the unpacked folder.
   - Run `setup.exe` (Windows) or the `.dmg` file (Mac) and follow the instructions.

### 4. Launch the App
1. **Locate and open the Choreo-Graphica app** in your applications list or start menu.

By following these steps, you'll be ready to enjoy the Choreo-Graphica interactive experience!


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
