# WDNFE - WebDAV Node File Explorer (CLI)

Semplice file explorer creato in NodeJS per web storage abilitati al protocollo WebDAV. Permette di esplorare un file system remoto tramite CLI.

## Utilizzo

Parametri disponibili (con defaults all'interno di `config.js` e `config.dev.js`):
- `host`: Host da esplorare abilitato a WebDAV
- `user`: Username da utilizzare come credenziali
- `password`: Password da utilizzare come credenziali

Ulteriori informzioni tramite:

```bash
node . --help
```

Per eseguire:

```bash
npm start -- [ARGS]
```
