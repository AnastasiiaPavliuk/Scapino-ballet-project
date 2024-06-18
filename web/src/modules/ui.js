export const displaySupportedState = (hasWebSerial, $notSupported, $supported) => {
    if (hasWebSerial) {
        $notSupported.style.display = "none";
        $supported.style.display = "block";
    } else {
        $notSupported.style.display = "block";
        $supported.style.display = "none";
    }
};

export const displayConnectionState = (isConnected, $notConnected, $connected) => {
    if (isConnected) {
        $notConnected.style.display = "none";
        $connected.style.display = "block";
    } else {
        $notConnected.style.display = "block";
        $connected.style.display = "none";
    }
};

export const toggleDevVisibility = (e) => {
    if (e.key === 'h' || e.key === 'H') {
        document.querySelector(".develop").classList.toggle("hidden");
    }

};

