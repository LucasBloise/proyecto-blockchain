const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
    let votingInstance;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const nonRegisteredVoter = accounts[3];
    const candidateName1 = "Candidato Alpha Sprint 2";
    const candidateName2 = "Candidato Beta Sprint 2";

    beforeEach(async () => {
        // Desplegar una nueva instancia del contrato para cada prueba para evitar interferencias
        votingInstance = await Voting.new({ from: owner });
    });

    describe("Despliegue y Propiedad", () => {
        it("debería asignar el propietario correctamente al desplegar", async () => {
            const contractOwner = await votingInstance.owner();
            assert.equal(contractOwner, owner, "El propietario no se asignó correctamente.");
        });

        it("debería permitir al propietario transferir la propiedad", async () => {
            await votingInstance.transferOwnership(voter1, { from: owner });
            const newOwner = await votingInstance.owner();
            assert.equal(newOwner, voter1, "La propiedad no se transfirió correctamente.");
        });

        it("no debería permitir a no propietarios transferir la propiedad", async () => {
            try {
                await votingInstance.transferOwnership(voter2, { from: voter1 }); // voter1 no es el propietario aún
                assert.fail("Se permitió a un no propietario transferir la propiedad.");
            } catch (error) {
                assert.include(error.message, "No eres el propietario.", "Mensaje de error incorrecto.");
            }
        });
    });

    describe("Gestión de Opciones de Voto", () => {
        it("debería permitir al propietario agregar una opción", async () => {
            await votingInstance.addOption(candidateName1, { from: owner });
            const option = await votingInstance.getOption(1);
            assert.equal(option.name, candidateName1, "La opción no se agregó correctamente.");
        });

        it("no debería permitir a no propietarios agregar una opción", async () => {
            try {
                await votingInstance.addOption("Opción Ilegal", { from: voter1 });
                assert.fail("Se permitió a un no propietario agregar una opción.");
            } catch (error) {
                assert.include(error.message, "No eres el propietario.", "Mensaje de error incorrecto.");
            }
        });
    });

    describe("Registro de Votantes", () => {
        it("debería permitir al propietario registrar un votante", async () => {
            await votingInstance.registerVoter(voter1, { from: owner });
            const isRegistered = await votingInstance.isVoterRegistered(voter1);
            assert.isTrue(isRegistered, "El votante no fue registrado.");
        });

        it("no debería permitir a no propietarios registrar un votante", async () => {
            try {
                await votingInstance.registerVoter(voter2, { from: voter1 });
                assert.fail("Se permitió a un no propietario registrar un votante.");
            } catch (error) {
                assert.include(error.message, "No eres el propietario.", "Mensaje de error incorrecto.");
            }
        });

        it("no debería permitir registrar un votante dos veces", async () => {
            await votingInstance.registerVoter(voter1, { from: owner });
            try {
                await votingInstance.registerVoter(voter1, { from: owner });
                assert.fail("Se permitió registrar un votante dos veces.");
            } catch (error) {
                assert.include(error.message, "Este votante ya está registrado.", "Mensaje de error incorrecto.");
            }
        });
    });

    describe("Proceso de Votación", () => {
        beforeEach(async () => {
            // Configuración común para pruebas de votación
            await votingInstance.addOption(candidateName1, { from: owner }); // Opción ID 1
            await votingInstance.addOption(candidateName2, { from: owner }); // Opción ID 2
            await votingInstance.registerVoter(voter1, { from: owner });
            await votingInstance.registerVoter(voter2, { from: owner });
        });

        it("debería permitir a un votante registrado emitir un voto", async () => {
            await votingInstance.vote(1, { from: voter1 });
            const option1 = await votingInstance.getOption(1);
            assert.equal(option1.voteCount.toNumber(), 1, "El conteo de votos no se incrementó.");
            const hasVoted = await votingInstance.hasVoterVoted(voter1);
            assert.isTrue(hasVoted, "El votante no fue marcado como que ya votó.");
        });

        it("no debería permitir a un votante no registrado emitir un voto", async () => {
            try {
                await votingInstance.vote(1, { from: nonRegisteredVoter });
                assert.fail("Se permitió votar a un votante no registrado.");
            } catch (error) {
                assert.include(error.message, "No estás registrado para votar.", "Mensaje de error incorrecto.");
            }
        });

        it("no debería permitir a un votante registrado votar dos veces", async () => {
            await votingInstance.vote(1, { from: voter1 });
            try {
                await votingInstance.vote(2, { from: voter1 }); // Intentando votar por otra opción
                assert.fail("Se permitió a un votante votar dos veces.");
            } catch (error) {
                assert.include(error.message, "Ya has emitido tu voto.", "Mensaje de error incorrecto.");
            }
        });

        it("no debería permitir votar por una opción no válida", async () => {
            try {
                await votingInstance.vote(99, { from: voter1 });
                assert.fail("Se permitió votar por una opción no válida.");
            } catch (error) {
                assert.include(error.message, "Opción de voto no válida.", "Mensaje de error incorrecto.");
            }
        });

        it("debería emitir un evento VotedEvent al votar", async () => {
            const tx = await votingInstance.vote(1, { from: voter1 });
            let eventEmitted = false;
            for (const log of tx.logs) {
                if (log.event === "VotedEvent") {
                    assert.equal(log.args.optionId.toNumber(), 1, "ID de opción incorrecto en el evento.");
                    assert.equal(log.args.voter, voter1, "Dirección de votante incorrecta en el evento.");
                    eventEmitted = true;
                    break;
                }
            }
            assert.isTrue(eventEmitted, "El evento VotedEvent no fue emitido.");
        });
    });
}); 