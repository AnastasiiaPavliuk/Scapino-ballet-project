const hasWebSerial = "serial" in navigator;
let isConnected = false;

const $notSupported = document.getElementById("not-supported");
const $supported = document.getElementById("supported");
const $notConnected = document.getElementById("not-connected");
const $connected = document.getElementById("connected");

const $connectButton = document.getElementById("connectButton");
const $startButton = document.querySelector(".start-button");
const $responseElement = document.querySelector(".response");


let playerIs = false;
// let playerId = 0;

const arduinoInfo = {
    usbProductId: 32823,
    usbVendorId: 9025,
};

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

    const ports = await navigator.serial.getPorts();
    connectedArduinoPorts = ports.filter(isArduinoPort);

    console.log("Ports");
    ports.forEach((port) => {
        const info = port.getInfo();
        console.log(info);
    });
    console.log("Connected Arduino ports");
    connectedArduinoPorts.forEach((port) => {
        const info = port.getInfo();
        console.log(info);
    });

    if (connectedArduinoPorts.length > 0) {
        connect(connectedArduinoPorts[0]);
    }

    $connectButton.addEventListener("click", handleClickConnect);
    // write function to check every second if the playerIs true
    setInterval(() => {
        playerBoolean();
    }, 2000);
};

const handleStartGame = () => {
    console.log("Start game");

};

const isArduinoPort = (port) => {
    const info = port.getInfo();
    return (
        info.usbProductId === arduinoInfo.usbProductId &&
        info.usbVendorId === arduinoInfo.usbVendorId
    );
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

        $startButton.addEventListener("click", async () => {
            playerIs = true;
            console.log("Start game", playerIs);
            await writer.write(
                JSON.stringify({
                    playerIs: playerIs
                })
            );
            await writer.write("\n");
        });
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // |reader| has been canceled.
                    break;
                }
                //Do something with |value|…
                setInterval(() => {
                    console.log("received or read: ", value);
                }, 2000);

                try {
                    const parsed = JSON.parse(value);
                    console.log("parsed", parsed);
                    // playerIs = parsed.playerIs;
                    // console.log("playerIs", playerIs);
                    // playerBoolean();
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            reader.releaseLock();
            writer.releaseLock();
            clearInterval(intervalId);
        }
    }

    port.addEventListener("disconnect", () => {
        isConnected = false;
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

const playerBoolean = () => {
    if (playerIs) {
        $responseElement.classList.remove('player-inactive');
        $responseElement.classList.add('player-active');
    } else {
        $responseElement.classList.remove('player-active');
        $responseElement.classList.add('player-inactive');
    }
}


init();

