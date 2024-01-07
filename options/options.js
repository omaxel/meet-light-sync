(() => {
    const inputs = [];
    for (let i = 1; i <= 4; i++) {
        inputs.push({
            ipAddress: document.getElementById(`ipAddress${i}`),
            port: document.getElementById(`port${i}`)
        });
    }

    const saveOptions = () => {
        for (const input of inputs) {
            if (input.ipAddress.value && !input.port.value) {
                alert('Please enter a port number for IP ' + input.ipAddress.value);
                return;
            }

            if (!input.ipAddress.value && input.port.value) {
                alert('Please enter an IP address for port ' + input.port.value);
                return;
            }
        }


        chrome.storage.sync.set({
            keyLightAirList: inputs.map(({ipAddress, port}) => ({
                ipAddress: ipAddress.value,
                port: port.value
            })).filter(({ipAddress, port}) => ipAddress && port)
        }, () => {
            alert('Options saved!');
        });
    };

    const restoreOptions = () => {
        chrome.storage.sync.get(['keyLightAirList'], ({keyLightAirList}) => {
            keyLightAirList?.forEach(({ipAddress, port}, index) => {
                inputs[index].ipAddress.value = ipAddress ?? '';
                inputs[index].port.value = port ?? 9123;
            });
        });
    };

    restoreOptions();
    document.getElementById('save').addEventListener('click', saveOptions);
})();
