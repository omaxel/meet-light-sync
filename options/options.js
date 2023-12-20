(() => {
    const ipAddress = document.getElementById('ipAddress');
    const port = document.getElementById('port');

    // Saves options to chrome.storage
    const saveOptions = () => {
        if (!ipAddress && !port) {
            alert('Please enter an IP address and port');
            return;
        }

        chrome.storage.sync.set({
            keyLightAir: {
                ipAddress: ipAddress.value,
                port: port.value
            }
        }, () => {
            alert('Options saved!');
        });
    };

    const restoreOptions = () => {
        chrome.storage.sync.get(['keyLightAir'], ({keyLightAir}) => {
            ipAddress.value = keyLightAir?.ipAddress ?? '';
            port.value = keyLightAir?.port ?? 9123;
        });
    };

    restoreOptions();
    document.getElementById('save').addEventListener('click', saveOptions);
})();
