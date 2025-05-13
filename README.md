# Sistema de Votación con Blockchain

Este proyecto implementa un sistema de votación seguro utilizando blockchain y contratos inteligentes. Permite crear elecciones, registrar votantes y realizar votaciones de manera transparente y segura.

## Requisitos Previos

### Para Windows:
1. Instalar [Node.js](https://nodejs.org/) (versión LTS recomendada)
2. Instalar [Git](https://git-scm.com/download/win)
3. Instalar [Visual Studio Code](https://code.visualstudio.com/) (opcional pero recomendado)

### Para macOS:
1. Instalar [Node.js](https://nodejs.org/) (versión LTS recomendada)
   - O usar Homebrew: `brew install node`
2. Instalar [Git](https://git-scm.com/download/mac)
   - O usar Homebrew: `brew install git`
3. Instalar [Visual Studio Code](https://code.visualstudio.com/) (opcional pero recomendado)

### Para Linux (Ubuntu/Debian):
1. Instalar Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Instalar Git:
   ```bash
   sudo apt-get install git
   ```
3. Instalar Visual Studio Code (opcional pero recomendado):
   ```bash
   sudo snap install code --classic
   ```

## Instalación del Proyecto

1. Abre una terminal (o Command Prompt en Windows)

2. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd blockchain
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

## Configuración del Entorno

1. Instala Truffle globalmente:
   ```bash
   npm install -g truffle
   ```

2. Instala Ganache (para desarrollo local):
   - Windows: Descarga e instala desde [Ganache](https://trufflesuite.com/ganache/)
   - macOS: `brew install --cask ganache`
   - Linux: Descarga e instala desde [Ganache](https://trufflesuite.com/ganache/)

## Ejecución del Proyecto

1. Inicia Ganache:
   - Windows: Busca "Ganache" en el menú inicio y ábrelo
   - macOS: Abre Ganache desde el Launchpad
   - Linux: Ejecuta Ganache desde el menú de aplicaciones

2. Compila los contratos:
   ```bash
   truffle compile
   ```

3. Despliega los contratos en la red local:
   ```bash
   truffle migrate
   ```

4. Inicia la aplicación:
   ```bash
   npm start
   ```

5. Abre tu navegador y ve a:
   ```
   http://localhost:3000
   ```

## Estructura del Proyecto

```
blockchain/
├── contracts/          # Contratos inteligentes
│   └── Voting.sol     # Contrato principal de votación
├── migrations/         # Scripts de migración
├── test/              # Pruebas
├── src/               # Código fuente de la aplicación
└── truffle-config.js  # Configuración de Truffle
```

## Solución de Problemas Comunes

### Error: "truffle no se encuentra"
- Asegúrate de haber instalado Truffle globalmente
- En Windows, reinicia la terminal después de instalar
- En Linux/macOS, usa `sudo npm install -g truffle`

### Error: "No se puede conectar a Ganache"
- Verifica que Ganache esté ejecutándose
- Comprueba que el puerto 7545 esté disponible
- Reinicia Ganache si es necesario

### Error: "npm install falla"
- Asegúrate de tener Node.js instalado correctamente
- Limpia la caché de npm: `npm cache clean --force`
- Intenta con: `npm install --legacy-peer-deps`

## Recursos Adicionales

- [Documentación de Truffle](https://trufflesuite.com/docs/truffle/)
- [Documentación de Ganache](https://trufflesuite.com/docs/ganache/)
- [Documentación de Solidity](https://docs.soliditylang.org/)

## Soporte

Si encuentras algún problema:
1. Revisa la sección de "Solución de Problemas Comunes"
2. Verifica que todos los requisitos estén instalados correctamente
3. Asegúrate de seguir los pasos en el orden indicado

## Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request 