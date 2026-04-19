# Integration Map

How components connect and what data flows between them.

### Frontend-scaffold --> Wallet-auth

- **Source**: Frontend-scaffold (`d8e89ce6`)
  - Output ports: App Context (config)
- **Target**: Wallet-auth (`a92d4098`)
  

### Erc1155-stylus --> Frontend-scaffold

- **Source**: Erc1155-stylus (`477fa7ff`)
  - Output ports: Multi-Token Contract (contract)
- **Target**: Frontend-scaffold (`d8e89ce6`)
  - Input ports: Contract ABI (contract), Network Config (config)
