chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage()
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        chrome.runtime.openOptionsPage();
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

/**
 * It will update the status of all the key lights stored in settings.
 * @param turnOn {boolean} If true, it will turn on all the key lights. If false, it will turn them off.
 * @returns {Promise<void>} It will return a promise that will be resolved when all the key lights have been updated.
 */
async function updateKeyLightSettings(turnOn) {
    const {keyLightAirList} = await chrome.storage.sync.get(['keyLightAirList']);

    if (!keyLightAirList || keyLightAirList.length === 0) {
        return;
    }

    for (const keyLightAir of keyLightAirList) {
        if (!keyLightAir.ipAddress || !keyLightAir.port) {
            continue;
        }

        try {
            await setKeyLightAirStatus(keyLightAir, turnOn);
        } catch (e) { // In case some of the key lights are not available, we don't want to fail the update of others
            console.error(e);
        }
    }
}

/**
 * It will return the URL of the key light.
 * @param keyLightAir {{ipAddress: string, port: string}} The key light.
 * @returns {string} The URL of the key light.
 */
function getKeyLightAirUrl(keyLightAir) {
    return `http://${keyLightAir.ipAddress}:${keyLightAir.port}/elgato/lights`;
}

/**
 * It will return the status of the key light.
 * @param keyLightAir {{ipAddress: string, port: string}} The key light.
 * @returns {Promise<any>} It will return a promise that will be resolved with the status of the key light.
 */
function getKeyLightAirStatus(keyLightAir) {
    const url = getKeyLightAirUrl(keyLightAir);
    return fetch(url).then(response => response.json());
}

/**
 * It will set the status of the key light.
 * @param keyLightAir {{ipAddress: string, port: string}} The key light.
 * @param turnOn {boolean} If true, it will turn on the key light. If false, it will turn it off.
 * @returns {Promise<any>} It will return a promise that will be resolved with the updated status of the key light.
 */
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
