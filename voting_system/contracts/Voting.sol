 // SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Voting
 * @dev Un contrato inteligente para un sistema de votacion con registro de votantes.
 */
contract Voting {
    address public owner;

    // Estructura para representar una opcion de voto (candidato)
    struct Option {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Mapping para almacenar las opciones de voto por su ID
    mapping(uint256 => Option) public options;
    // Contador para generar IDs unicos para las opciones
    uint256 public optionsCount;

    // Mapping para rastrear si una direccion ya ha votado
    mapping(address => bool) public votersWhoVoted; // Renombrado de 'voters' para claridad
    mapping(address => bool) public registeredVoters;

    // Evento que se emite cuando se emite un voto
    event VotedEvent(uint256 indexed optionId, address indexed voter);
    // Evento que se emite cuando se agrega una nueva opcion
    event OptionAdded(uint256 indexed optionId, string name);
    event VoterRegistered(address indexed voterAddress);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "No eres el propietario.");
        _;
    }

    /**
     * @dev Constructor que puede inicializar con algunas opciones.
     * Por ahora, las opciones se agregaran a traves de una funcion.
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);
        // Podriamos anadir opciones por defecto aqui si quisieramos
        // addOption("Opcion A");
        // addOption("Opcion B");
    }

    /**
     * @dev Transfiere la propiedad del contrato a una nueva cuenta.
     * Solo puede ser llamado por el propietario actual.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "El nuevo propietario no puede ser la direccion cero.");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Registra una direccion para que pueda votar.
     * Solo puede ser llamado por el propietario.
     * @param _voterAddress La direccion a registrar.
     */
    function registerVoter(address _voterAddress) public onlyOwner {
        require(_voterAddress != address(0), "La direccion del votante no puede ser la direccion cero.");
        require(!registeredVoters[_voterAddress], "Este votante ya esta registrado.");
        registeredVoters[_voterAddress] = true;
        emit VoterRegistered(_voterAddress);
    }

    /**
     * @dev Permite al propietario agregar una nueva opcion de voto.
     * @param _name El nombre de la opcion.
     */
    function addOption(string memory _name) public onlyOwner { // Restringido a onlyOwner
        require(bytes(_name).length > 0, "El nombre de la opcion no puede estar vacio.");
        optionsCount++;
        options[optionsCount] = Option(optionsCount, _name, 0);
        emit OptionAdded(optionsCount, _name);
    }

    /**
     * @dev Permite a un votante registrado emitir un voto.
     * @param _optionId El ID de la opcion por la que se vota.
     */
    function vote(uint256 _optionId) public {
        require(registeredVoters[msg.sender], "No estas registrado para votar.");
        require(!votersWhoVoted[msg.sender], "Ya has emitido tu voto.");
        require(_optionId > 0 && _optionId <= optionsCount, "Opcion de voto no valida.");

        options[_optionId].voteCount++;
        votersWhoVoted[msg.sender] = true;
        emit VotedEvent(_optionId, msg.sender);
    }

    /**
     * @dev Obtiene los detalles de una opcion de voto.
     * @param _optionId El ID de la opcion.
     * @return id El ID de la opcion.
     * @return name El nombre de la opcion.
     * @return voteCount El conteo de votos de la opcion.
     */
    function getOption(uint256 _optionId) public view returns (uint256 id, string memory name, uint256 voteCount) {
        require(_optionId > 0 && _optionId <= optionsCount, "Opcion de voto no valida para getOption.");
        Option storage optionData = options[_optionId];
        return (optionData.id, optionData.name, optionData.voteCount);
    }

    /**
     * @dev Verifica si una direccion especifica esta registrada para votar.
     */
    function isVoterRegistered(address _voterAddress) public view returns (bool) {
        return registeredVoters[_voterAddress];
    }

    /**
     * @dev Verifica si una direccion especifica ya ha votado.
     */
    function hasVoterVoted(address _voterAddress) public view returns (bool) {
        return votersWhoVoted[_voterAddress];
    }
}