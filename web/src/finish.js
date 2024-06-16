// Select the root element and the canvas element with the class 'drawing-surface'
const $root = document.querySelector(':root');
const $canvas = document.querySelector('.drawing-surface');

// Declare variables for player metrics and state management
let playerMin;
let playerMax;
let playerTime;
let blob = false;
let animationRunning = false;
let particle; // Single particle instance

// Listen for the 'finish' event from electronAPI and handle it
window.electronAPI.on('finish', (...args) => {
    handleFinish(args[0][0].playerMin, args[0][0].playerMax, args[0][0].playerTime);
});

// Function to handle the 'finish' event
const handleFinish = (min, max, time) => {
    // Update player metrics
    playerMin = min;
    playerMax = max;
    playerTime = time;

    // Log player metrics to the console
    console.log(playerMin, playerMax, playerTime);

    // Check if blob is not created, create it, otherwise update the existing blob
    if (!blob) {
        createBlob();
        blob = true;
        console.log('createBlob() called.');
    } else {
        updateBlob();
        console.log('updateBlob() called.');
    }
}

// Function to create a new blob
const createBlob = () => {
    createCanvas();
    createParticle();
    console.log('createParticle() called.');
}

// Function to update the existing blob
const updateBlob = () => {
    if (!animationRunning) {
        animationRunning = true;
        draw();
    }
}

// Define default values for blur and speed multiplier
let ANAblur = 0.9; // Change this value as needed
let ANAspeedMultiplier = 1; // Change this value as needed

// Declare global variables for canvas context and speed multiplier
let ctx, speedMultiplier = ANAspeedMultiplier;

// Function to calculate the average of playerMin and playerMax
const average = () => (playerMin + playerMax) / 2;

// Function to generate a random number between min and max (inclusive)
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Function to generate a random percentage string between min and max
const generateRandomPercentage = (min, max) => {
    return `${Math.floor(Math.random() * (max - min + 1)) + min}%`;
};

// Function to generate random border-radius values
const generateBorderRadiusValues1 = () => {
    let values = [];
    for (let i = 0; i < 4; i++) {
        values.push(generateRandomPercentage(20, 75));
    }
    return values.join(' ');
};

// Another function to generate random border-radius values
const generateBorderRadiusValues2 = () => {
    let values = [];
    for (let i = 0; i < 4; i++) {
        values.push(generateRandomPercentage(20, 75));
    }
    return values.join(' ');
};

// Function to set border-radius values in CSS custom properties
const setBorderRadiusValues = () => {
    const root = document.documentElement;
    root.style.setProperty('--border-radius1', generateBorderRadiusValues1());
    root.style.setProperty('--border-radius2', generateBorderRadiusValues2());
};

// Example usage: set the border-radius values
setBorderRadiusValues();

// Function to map playerMin to a lightness value using linear interpolation
const mapPlayerMin = (playerMin) => {
    const minPlayerMin = 2;
    const maxPlayerMin = 15;
    const minLightness = 80;
    const maxLightness = 60;

    // Calculate the mapped value
    const mappedValue = minLightness + ((playerMin - minPlayerMin) * (maxLightness - minLightness)) / (maxPlayerMin - minPlayerMin);

    return mappedValue;
}

// Function to calculate HSL color based on player metrics
const calculateHSL = () => {
    if (average() >= 0 && average() <= 10) {
        const lightness = mapPlayerMin(playerMin);
        return `hsl(215, 50%, ${lightness}%)`;
    } else {
        const lightness = mapPlayerMin(playerMin);
        return `hsl(60, 50%, ${lightness}%)`;
    }
};

// Function to calculate color based on playerTime
const colorPlayerTime = () => {
    console.log(playerTime, "from colorPlayerTime");
    if (playerTime >= 20 && playerTime <= 60) {
        const huePlayerTime = 275; // Purple hue
        const saturationPlayerTime = 70;
        const lightnessPlayerTime = 40;
        return `hsl(${huePlayerTime}, ${saturationPlayerTime}%, ${lightnessPlayerTime}%)`;
    } else {
        const huePlayerTime = 335; // Pink hue
        const saturationPlayerTime = 90;
        const lightnessPlayerTime = 60;
        return `hsl(${huePlayerTime}, ${saturationPlayerTime}%, ${lightnessPlayerTime}%)`;
    }
};

// Function to update blur size in CSS custom property
const updateBlur = () => {
    $root.style.setProperty('--blur-size', `${ANAblur}rem`);
};

// Function to create a canvas context and set the canvas size to 300x300 pixels
const createCanvas = () => {
    ctx = $canvas.getContext('2d');
    $canvas.width = 300;
    $canvas.height = 300;
};

// Function to create a single particle
const createParticle = () => {
    const x = Math.random() * $canvas.width;
    const y = Math.random() * $canvas.height;
    const radius = 130;
    particle = {
        x,
        y,
        radius,
        velocityX: randomNumber(1, 1.4),
        velocityY: randomNumber(1, 1.4),
        sinValue: randomNumber(0, 0.8)
    };
    draw();
};

// Function to draw the particle on the canvas
const drawParticle = () => {
    // Create a radial gradient for the particle
    const gradient = ctx.createRadialGradient(particle.x, particle.y, particle.radius * 0.01, particle.x, particle.y, particle.radius);
    gradient.addColorStop(0, colorPlayerTime());
    gradient.addColorStop(1, 'rgba(128, 0, 128, 0)');
    ctx.fillStyle = gradient;

    // Draw the particle as an octagon
    ctx.beginPath();
    ctx.moveTo(particle.x + particle.radius * Math.cos(0), particle.y + particle.radius * Math.sin(0));
    for (let i = 1; i <= 8; i++) {
        ctx.bezierCurveTo(
            particle.x + particle.radius * Math.cos((i - 0.5) * (Math.PI / 4)),
            particle.y + particle.radius * Math.sin((i - 0.5) * (Math.PI / 4)),
            particle.x + particle.radius * Math.cos((i - 0.5) * (Math.PI / 4)),
            particle.y + particle.radius * Math.sin((i - 0.5) * (Math.PI / 4)),
            particle.x + particle.radius * Math.cos(i * (Math.PI / 4)),
            particle.y + particle.radius * Math.sin(i * (Math.PI / 4))
        );
    }
    ctx.closePath();
    ctx.fill();
};

// Function to update the particle's position and radius
const updateParticle = () => {
    // Update the particle's position and radius
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;

    particle.sinValue += 0.01;
    particle.radius += Math.sin(particle.sinValue);

    //boundary check
    if (particle.x > $canvas.width) particle.velocityX = -Math.abs(particle.velocityX);
    else if (particle.x < 0) particle.velocityX = Math.abs(particle.velocityX);
    if (particle.y > $canvas.height) particle.velocityY = -Math.abs(particle.velocityY);
    else if (particle.y < 0) particle.velocityY = Math.abs(particle.velocityY);

    drawParticle();
};

// Function to draw the particle and update the canvas
const draw = () => {
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);

    // Fill the background with the calculated HSL color
    ctx.fillStyle = calculateHSL();
    ctx.fillRect(0, 0, $canvas.width, $canvas.height);

    // Update the single particle
    updateParticle();

    // Update the blur size
    updateBlur();

    // Request the next animation frame
    requestAnimationFrame(draw);
};
