chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.runtime.openOptionsPage()
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.url && changeInfo.url.startsWith("https://meet.google.com/")) {
        await updateKeyLightSettings(true);
    }
});

chrome.tabs.onRemoved.addListener(async () => {
    const tabs = await chrome.tabs.query({url: "https://meet.google.com/*"});

    if (tabs.length === 0) {
        await updateKeyLightSettings(false);
    }
});

async function updateKeyLightSettings(turnOn) {
    const {keyLightAir} = await chrome.storage.sync.get(['keyLightAir']);

    if (!keyLightAir || !keyLightAir.ipAddress || !keyLightAir.port) {
        return;
    }

    await setKeyLightAirStatus(keyLightAir, turnOn);
}

function getKeyLightAirUrl(keyLightAir) {
    return `http://${keyLightAir.ipAddress}:${keyLightAir.port}/elgato/lights`;
}

function getKeyLightAirStatus(keyLightAir) {
    const url = getKeyLightAirUrl(keyLightAir);
    return fetch(url).then(response => response.json());
}

async function setKeyLightAirStatus(keyLightAir, turnOn) {
    const url = getKeyLightAirUrl(keyLightAir);

    const status = await getKeyLightAirStatus(keyLightAir);

    if (Array.isArray(status.lights) && status.lights.length > 0) {
        status.lights.forEach(light => {
            light.on = turnOn ? 1 : 0;
        });
    }

    return await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(status)
    }).then(response => response.json());
}
