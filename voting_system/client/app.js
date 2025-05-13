const App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    contractInstance: null,
    contractOwner: null,
    isCurrentUserOwner: false,
    isCurrentUserRegistered: false,

    init: async function () {
        console.log("App inicializada (Sprint 2)...");
        return await App.initWeb3();
    },

    initWeb3: async function () {
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = window.ethereum;
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                App.account = accounts[0];
                console.log("MetaMask conectado, cuenta:", App.account);
                document.getElementById('accountAddress').innerText = App.account;
            } catch (error) {
                console.error("Usuario denegó acceso a la cuenta", error);
                alert("Necesitas conectar MetaMask para usar esta DApp.");
                document.getElementById('accountAddress').innerText = "Acceso denegado";
                return;
            }
        } else if (typeof window.web3 !== 'undefined') {
            App.web3Provider = window.web3.currentProvider;
            web3 = new Web3(App.web3Provider);
            const accounts = await web3.eth.getAccounts();
            App.account = accounts[0];
            document.getElementById('accountAddress').innerText = App.account;
            console.log("Proveedor Web3 antiguo detectado, cuenta:", App.account);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
            const accounts = await web3.eth.getAccounts();
            App.account = accounts[0];
            document.getElementById('accountAddress').innerText = App.account + " (Ganache Fallback)";
            console.log("Conectado a Ganache local (fallback), cuenta:", App.account);
        }
        if (!web3) web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: async function () {
        try {
            const response = await fetch('Voting.json');
            const votingArtifact = await response.json();
            App.contracts.Voting = TruffleContract(votingArtifact);
            App.contracts.Voting.setProvider(App.web3Provider);

            App.contractInstance = await App.contracts.Voting.deployed();
            console.log("Contrato Voting desplegado en:", App.contractInstance.address);

            await App.fetchContractOwner();
            await App.checkUserRoleAndRegistration();
            App.updateAdminPanelVisibility();

            App.listenForEvents();
            return App.render();
        } catch (error) {
            console.error("No se pudo cargar o inicializar el contrato:", error);
            alert("Error al cargar el contrato. Asegúrate de que esté desplegado, Voting.json accesible y MetaMask conectado a la red correcta.");
        }
    },

    fetchContractOwner: async function () {
        if (!App.contractInstance) return;
        try {
            App.contractOwner = await App.contractInstance.owner();
            console.log("Propietario del contrato:", App.contractOwner);
        } catch (error) {
            console.error("Error al obtener el propietario del contrato:", error);
        }
    },

    checkUserRoleAndRegistration: async function () {
        if (!App.contractInstance || !App.account) return;
        App.isCurrentUserOwner = App.account.toLowerCase() === App.contractOwner.toLowerCase();
        document.getElementById('accountRole').innerText = App.isCurrentUserOwner ? "Administrador" : "Votante";

        try {
            App.isCurrentUserRegistered = await App.contractInstance.isVoterRegistered(App.account, { from: App.account });
            document.getElementById('registrationStatus').innerText = App.isCurrentUserRegistered ? "Registrado" : "No Registrado";
        } catch (error) {
            console.error("Error verificando si el usuario está registrado:", error);
            document.getElementById('registrationStatus').innerText = "Error al verificar";
        }
    },

    updateAdminPanelVisibility: function () {
        const adminPanel = document.getElementById('adminPanel');
        if (App.isCurrentUserOwner) {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }
    },

    render: async function () {
        if (!App.contractInstance) {
            console.log("Instancia de contrato no disponible para renderizar.");
            return;
        }
        await App.loadOptions();
        await App.checkUserRoleAndRegistration(); // Re-check in case of account change might affect this
        App.updateAdminPanelVisibility();
    },

    loadOptions: async function () {
        const optionsDiv = document.getElementById('optionsDiv');
        const resultsDiv = document.getElementById('resultsDiv');
        optionsDiv.innerHTML = '<p>Cargando opciones...</p>';
        resultsDiv.innerHTML = '<p>Cargando resultados...</p>';

        try {
            const optionsCount = await App.contractInstance.optionsCount();
            let optionsHtml = "";
            let resultsHtml = "";

            if (optionsCount.toNumber() === 0) {
                optionsHtml = "<p>No hay opciones de votación definidas aún.</p>";
                resultsHtml = "<p>No hay opciones para mostrar resultados.</p>";
            } else {
                for (let i = 1; i <= optionsCount.toNumber(); i++) {
                    const option = await App.contractInstance.getOption(i);
                    const id = option[0].toNumber();
                    const name = option[1];
                    const voteCount = option[2].toNumber();

                    let voteButtonHtml = `<button onclick="App.castVote(${id})" ${!App.isCurrentUserRegistered ? 'disabled title="Debes estar registrado para votar"' : ''}>Votar</button>`;

                    optionsHtml += `<div class="optionItem">${id}: ${name} ${voteButtonHtml}</div>`;
                    resultsHtml += `<div class="resultItem">${id}: ${name} - Votos: ${voteCount}</div>`;
                }
            }
            optionsDiv.innerHTML = optionsHtml;
            resultsDiv.innerHTML = resultsHtml;

        } catch (error) {
            console.error("Error al cargar opciones:", error);
            optionsDiv.innerHTML = "<p class='error-message'>Error al cargar opciones.</p>";
            resultsDiv.innerHTML = "<p class='error-message'>Error al cargar resultados.</p>";
        }
    },

    addOption: async function () {
        if (!App.isCurrentUserOwner) {
            alert("Solo el administrador puede agregar opciones.");
            return;
        }
        const optionNameInput = document.getElementById('optionNameInput');
        const optionName = optionNameInput.value;
        if (!optionName.trim()) {
            alert("El nombre de la opción no puede estar vacío.");
            return;
        }
        try {
            console.log(`Agregando opción: ${optionName} desde la cuenta ${App.account}`);
            await App.contractInstance.addOption(optionName, { from: App.account });
            optionNameInput.value = '';
        } catch (error) {
            console.error("Error al agregar opción:", error);
            alert("Error al agregar la opción. Revisa la consola.");
        }
    },

    registerVoter: async function () {
        if (!App.isCurrentUserOwner) {
            alert("Solo el administrador puede registrar votantes.");
            return;
        }
        const voterAddressInput = document.getElementById('voterAddressInput');
        const voterAddress = voterAddressInput.value;
        if (!web3.utils.isAddress(voterAddress)) {
            alert("Por favor, introduce una dirección Ethereum válida.");
            return;
        }
        try {
            console.log(`Registrando votante: ${voterAddress} desde la cuenta ${App.account}`);
            await App.contractInstance.registerVoter(voterAddress, { from: App.account });
            voterAddressInput.value = '';
        } catch (error) {
            console.error("Error al registrar votante:", error);
            alert("Error al registrar el votante. ¿Quizás ya está registrado o la dirección no es válida? Revisa la consola.");
        }
    },

    castVote: async function (optionId) {
        if (!App.isCurrentUserRegistered) {
            alert("No estás registrado para votar. Contacta al administrador.");
            return;
        }
        try {
            const hasVoted = await App.contractInstance.hasVoterVoted(App.account, { from: App.account });
            if (hasVoted) {
                alert("Ya has emitido tu voto.");
                return;
            }
            console.log(`Votando por la opción ${optionId} desde la cuenta ${App.account}`);
            await App.contractInstance.vote(optionId, { from: App.account });
        } catch (error) {
            console.error("Error al emitir el voto:", error);
            alert("Error al emitir tu voto. Revisa la consola para más detalles.");
        }
    },

    listenForEvents: function () {
        if (!App.contractInstance) return;

        App.contractInstance.VotedEvent({}, { fromBlock: 'latest' })
            .on('data', event => {
                console.log("Evento VotedEvent detectado:", event);
                alert("¡Voto registrado exitosamente!");
                App.loadOptions();
            }).on('error', console.error);

        App.contractInstance.OptionAdded({}, { fromBlock: 'latest' })
            .on('data', event => {
                console.log("Evento OptionAdded detectado:", event);
                alert(`¡Opción '${event.returnValues.name}' agregada exitosamente!`);
                App.loadOptions();
            }).on('error', console.error);

        App.contractInstance.VoterRegistered({}, { fromBlock: 'latest' })
            .on('data', async event => {
                console.log("Evento VoterRegistered detectado:", event);
                alert(`¡Votante '${event.returnValues.voterAddress}' registrado exitosamente!`);
                // Si el votante registrado es el usuario actual, actualizar su estado
                if (event.returnValues.voterAddress.toLowerCase() === App.account.toLowerCase()) {
                    await App.checkUserRoleAndRegistration();
                    App.loadOptions(); // Habilitar/deshabilitar botón de voto
                }
            }).on('error', console.error);
    }
};

window.addEventListener('load', async () => {
    await App.init();
    if (App.account && App.contractInstance) { // Asegurar que la app esté lista
        document.getElementById('addOptionBtn').addEventListener('click', App.addOption);
        document.getElementById('registerVoterBtn').addEventListener('click', App.registerVoter);
    } else {
        console.warn("App.js: Los listeners de botones no se pudieron agregar porque la app no se inicializó completamente.");
    }
});

if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        console.log("Cuenta cambiada en MetaMask:", accounts[0]);
        App.account = accounts[0] || '0x0';
        document.getElementById('accountAddress').innerText = App.account === '0x0' ? 'No conectado' : App.account;
        // Recargar estado y UI
        if (App.contractInstance) {
            await App.fetchContractOwner();
            await App.render();
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        console.log("Red cambiada, recargando página...");
        window.location.reload();
    });
} 