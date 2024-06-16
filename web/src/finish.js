//const ipc = require('electron').ipcRenderer;

const $distanceOutput = document.querySelector(".distance-output");

console.log($distanceOutput);

let playerMin ;
let playerMax ;
let playerTime ;

window.electronAPI.on('finish', (...args) => {
    console.log(args);
    playerMin = args[0][0].playerMin;
    playerMax = args[0][0].playerMax;
    playerTime = args[0][0].playerTime;
    $distanceOutput.innerHTML = 'Player Min: ' + playerMin + '<br>Player Max: ' + playerMax + '<br>Player Time: ' + playerTime;

    hanleResult(playerMin, playerMax, playerTime);
});


const hanleResult = (playerMin, playerMax, playerTime) => {
    // create canvas, if there are 5 particles, update them
}

/* ---------- dom selectors ---------- */
const $root = document.querySelector(':root');
const $canvas = document.querySelector('.drawing-surface');

/* ---------- Define the values directly in the variables --------- */
let ANAblur = 0.5; // Change this value as needed
let ANAspeedMultiplier = 1.8; // Change this value as needed

/* ---------- global variables ---------- */
let ctx, speedMultiplier = ANAspeedMultiplier;
let particles = [];
let maxRadius = 0;

/* ---------- anastasiia's requirements ---------- */

// If the result average is between 10-20, fill blue; else yellow

const average = (playerMin + playerMax) / 2;

console.log(`playerMin: ${playerMin}, playerMax: ${playerMax}, average: ${average}`);


/* ---------- border radius functions ---------- */
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const generateRandomPercentage = (min, max) => {
    return `${Math.floor(Math.random() * (max - min + 1)) + min}%`;
};

const generateBorderRadiusValues1 = () => {
    let values = [];
    for (let i = 0; i < 4; i++) {
        values.push(generateRandomPercentage(20, 75));
    }
    return values.join(' ');
};

const generateBorderRadiusValues2 = () => {
    let values = [];
    for (let i = 0; i < 4; i++) {
        values.push(generateRandomPercentage(20, 75));
    }
    return values.join(' ');
};

const setBorderRadiusValues = () => {
    const root = document.documentElement;
    root.style.setProperty('--border-radius1', generateBorderRadiusValues1());
    root.style.setProperty('--border-radius2', generateBorderRadiusValues2());
};

// Example usage:
setBorderRadiusValues();

/* ---------- calculation functions ---------- */

function mapPlayerMin(playerMin) {
    const minPlayerMin = 2;
    const maxPlayerMin = 15;
    const minLightness = 80;
    const maxLightness = 60;

    // Calculate the mapped value using linear interpolation
    const mappedValue = minLightness + ((playerMin - minPlayerMin) * (maxLightness - minLightness)) / (maxPlayerMin - minPlayerMin);

    return mappedValue;
}

const calculateHSL = () => {
    if (average >= 10 && average <= 20) {
        //console.log("accurate, blue");
        const lightness = mapPlayerMin(playerMin);
        return `hsl(215, 50%, ${lightness}%)`;
    } else {
        //console.log("not-accurate, yellow");
        //const lightness = 25 + (average * 2);
        const lightness = mapPlayerMin(playerMin);
        return `hsl(60, 50%, ${lightness}%)`;
    }
};

const colorPlayerTime = () => {
    if (playerTime >= 35 && playerTime <= 60) {
        // Purple color for playerTime between 35 and 60
        const huePlayerTime = 275; // Purple hue
        const saturationPlayerTime = 70;
        const lightnessPlayerTime = 40;
        return `hsl(${huePlayerTime}, ${saturationPlayerTime}%, ${lightnessPlayerTime}%)`;
    } else {
        // Default to pink for other playerTime values
        const huePlayerTime = 335; // pink hue
        const saturationPlayerTime = 90; // Medium saturation
        const lightnessPlayerTime = 60; // Medium lightness
        return `hsl(${huePlayerTime}, ${saturationPlayerTime}%, ${lightnessPlayerTime}%)`;
    }
};

/* ---------- update functions ---------- */

// Function to update blur
const updateBlur = () => {
    $root.style.setProperty('--blur-size', `${ANAblur}rem`);
};

const resizeCanvas = () => {
    const maxSize = maxRadius * 2;
    $canvas.style.width = `${maxSize}px`;
    $canvas.style.height = `${maxSize}px`;

    const scale = window.devicePixelRatio;
    $canvas.width = Math.floor(maxSize * scale);
    $canvas.height = Math.floor(maxSize * scale);
    ctx.scale(scale, scale);
};

/* ---------- create canvas and particles ---------- */
const createCanvas = () => {
    ctx = $canvas.getContext('2d');
    resizeCanvas();
};

const createParticles = (totalParticles) => {
    for (let i = 0; i < totalParticles; i++) {
        particles.push(new Particle(
            Math.random() * $canvas.width,
            Math.random() * $canvas.height,
            randomNumber(100, 300),
        ));
    }
    draw();
};

class Particle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityX = randomNumber(1, 2);
        this.velocityY = randomNumber(1, 2);
        this.sinValue = randomNumber(0, 0.8);
        if (radius > maxRadius) {
            maxRadius = radius;
            resizeCanvas();
        }
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.01, this.x, this.y, this.radius);
        gradient.addColorStop(0, colorPlayerTime());
        gradient.addColorStop(1, 'rgba(128, 0, 128, 0)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(this.x + this.radius * Math.cos(0), this.y + this.radius * Math.sin(0));
        for (let i = 1; i <= 8; i++) {
            ctx.bezierCurveTo(
                this.x + this.radius * Math.cos((i - 0.5) * (Math.PI / 4)),
                this.y + this.radius * Math.sin((i - 0.5) * (Math.PI / 4)),
                this.x + this.radius * Math.cos((i - 0.5) * (Math.PI / 4)),
                this.y + this.radius * Math.sin((i - 0.5) * (Math.PI / 4)),
                this.x + this.radius * Math.cos(i * (Math.PI / 4)),
                this.y + this.radius * Math.sin(i * (Math.PI / 4))
            );
        }
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.x += this.velocityX * speedMultiplier;
        this.y += this.velocityY * speedMultiplier;

        this.sinValue += 0.01;
        this.radius += Math.sin(this.sinValue);

        if (this.x > $canvas.width) this.velocityX = -Math.abs(this.velocityX);
        else if (this.x < 0) this.velocityX = Math.abs(this.velocityX);
        if (this.y > $canvas.height) this.velocityY = -Math.abs(this.velocityY);
        else if (this.y < 0) this.velocityY = Math.abs(this.velocityY);

        this.draw();
    }
}

const draw = () => {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);

    // Fill background with calculated HSL color
    ctx.fillStyle = calculateHSL();
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);

    particles.forEach(particle => particle.update());

    updateBlur();
    requestAnimationFrame(draw);
};

// const init = () => {
//     if (playerTime) {
//         createCanvas();
//         createParticles(5);
//     }
//     console.log(average);
// };

// init();
