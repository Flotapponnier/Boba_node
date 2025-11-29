![Boba Node](./packages/frontend/src/assets/boba_node_banner.png)

# Boba Node

A simple web interface to generate production-ready Helm charts for blockchain nodes. Stop writing YAML manually and configure your nodes through a clean UI instead.

## What is this?

If you need to deploy blockchain nodes on Kubernetes, you know the pain of managing Helm charts. Boba Node gives you a web UI where you fill in your configuration, click generate, and get a production-ready Helm chart.

Currently supports **BSC**, **Ethereum**, and **Arbitrum** nodes with multiple node type options for each chain.

## Getting Started

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:3001.

## How it works

1. **Pick your blockchain**: Choose between BSC, Ethereum, or Arbitrum
2. **Select node type**:
   - BSC: Fast, Full, Archive, or Validator
   - Ethereum: Light, Full, Archive, or Validator
   - Arbitrum: Full, Archive, or Validator
3. **Configure everything** in the web UI:
   - Docker image and repository settings
   - Node configuration (network ID, sync mode, ports)
   - Resource allocations (CPU, memory, storage)
   - Persistence (PVC size and storage class)
   - Monitoring stack (Prometheus, Grafana)
   - Snapshot download for faster sync
   - Validator-specific settings (consensus client for ETH, staker config for ARB)
4. **Generate and download** your production-ready Helm chart
5. **Deploy to your Kubernetes cluster**

The generated charts follow DevOps best practices and include everything you need: StatefulSet, Service, ConfigMap, and proper values files with coherent naming (e.g., `bsc-validator`, `eth-archive-node`, etc.).

## Features

### Core Functionality
- **Multiple Blockchain Support**: BSC, Ethereum, and Arbitrum with 4 node types each
- **Metadata-Driven UI**: Single source of truth for all configuration fields
- **Production-Ready Charts**: Generated Helm charts follow Kubernetes best practices
- **Type-Safe Configuration**: Full TypeScript integration across frontend and backend

### Configuration Options
- **Smart Defaults**: Presets for each node type with recommended resources
- **Automatic Naming**: Coherent deployment names, namespaces, and node names
- **Resource Management**: CPU, memory, and storage configuration with validation
- **Persistence**: PVC configuration with storage class selection
- **Snapshot Support**: Quick sync with automated snapshot downloads

### Monitoring & Observability
- **Production Monitoring Stack**: Complete integration with Prometheus + Grafana
  - **Geth Exporter**: Blockchain-specific metrics (block height, peers, tx pool, gas usage)
  - **ServiceMonitor**: Auto-configuration for Prometheus Operator
  - **15+ Alert Rules**: Critical, Warning, and Performance alerts with configurable thresholds
    - 🔴 Critical: Disk Space Critical
    - 🟡 Warning: Disk Space Warning, High Memory, TX Pool Overload/Near Capacity
    - 🔵 Performance: High CPU, High IO Wait, Predict Disk Full
  - **Slack Notifications**: Optional webhook integration for alerts
  - **Grafana Dashboard**: 14 pre-configured panels (blockchain + system metrics)

### Developer Experience
- **Context-Aware Help**: Every field has tooltips that adapt based on chain and node type
- **Modular Architecture**: 64% code reduction through shared components
- **Clean Codebase**: Eliminated 2400+ lines of duplication
- **Easy Maintenance**: Single place to update field definitions for all chains

## Architecture

Boba Node uses a **metadata-driven architecture** to eliminate code duplication and provide a consistent, maintainable codebase:

### Metadata-Driven Configuration
- **Chain Configuration System** (`chainConfig.ts`): Centralized metadata for all blockchain types
  - Field definitions with types, labels, tooltips, and validation
  - Chain-specific ports, defaults, and documentation links
  - Dynamic form rendering based on metadata
- **Shared Components**: Reusable sections powered by metadata (Basic, Image, Service, Node Config)
- **Chain-Specific Sections**: Custom sections for unique features (Resources, Persistence, Snapshot, Monitoring, Validator)

### Single Unified Page Architecture
- **One Configuration Component** (`UnifiedConfigContent.tsx`) handles all chains
- **Conditional Rendering**: Chain-specific sections loaded based on selection
- **Type-Safe**: Full TypeScript integration with strong typing
- **64% Code Reduction**: From 2400+ lines of duplicated code to 870 lines across modular files

### Project Structure

```
Boba_node/
├── packages/
│   ├── backend/                      # Express API for Helm chart generation
│   │   ├── src/
│   │   │   ├── routes/              # API endpoints per chain
│   │   │   ├── generators/          # Helm chart generation logic
│   │   │   ├── presets/             # Node type presets (fast, full, archive, validator)
│   │   │   └── defaults/            # Default configurations per chain
│   │   └── helm-charts/             # Base Helm chart templates
│   │
│   └── frontend/                     # React + TypeScript UI
│       └── src/
│           ├── config/
│           │   └── chainConfig.ts            # Metadata-driven configuration system
│           │
│           ├── components/
│           │   ├── shared/                   # Metadata-powered shared components
│           │   │   ├── DynamicField.tsx     # Universal form field renderer
│           │   │   ├── BasicConfigSection.tsx
│           │   │   ├── ImageConfigSection.tsx
│           │   │   ├── ServiceConfigSection.tsx
│           │   │   └── NodeConfigSection.tsx
│           │   │
│           │   ├── sections/                 # Chain-specific sections
│           │   │   ├── bsc/                 # BSC: Resources, Persistence, Snapshot, Monitoring
│           │   │   ├── eth/                 # ETH: Resources, Persistence, Snapshot, Monitoring, Validator
│           │   │   └── arb/                 # ARB: Resources, Persistence, Snapshot, Monitoring, Validator
│           │   │
│           │   ├── HelpTooltip.tsx          # Context-aware tooltips
│           │   ├── NodeTypeModal.tsx        # Node type selection modal
│           │   ├── SectionHeader.tsx        # Section headers with help
│           │   └── SuccessModal.tsx         # Chart generation success modal
│           │
│           ├── pages/
│           │   ├── NewHomePage.tsx          # Main entry point with node selection
│           │   └── UnifiedConfigContent.tsx # Single unified configuration page
│           │
│           ├── hooks/
│           │   └── useChainConfig.ts        # Custom hook for config state management
│           │
│           ├── types/                       # TypeScript type definitions
│           ├── utils/                       # Helper functions (nodeTypeHelpers, etc.)
│           └── assets/                      # Images and static files
```

## Roadmap

### Completed
- [x] BSC nodes (Fast, Full, Archive, Validator)
- [x] Ethereum nodes (Light, Full, Archive, Validator)
- [x] Arbitrum nodes (Full, Archive, Validator)
- [x] Context-aware help tooltips
- [x] Metadata-driven architecture
- [x] Modular component system
- [x] Automatic coherent naming
- [x] Production monitoring stack (Prometheus + Grafana)
- [x] Advanced alert rules with Slack integration
- [x] Snapshot download support
- [x] Validator-specific configurations

### In Progress
- [ ] Direct kubectl/helm deployment from UI
- [ ] Configuration import/export
- [ ] Chart templates customization

### Future
- [ ] More blockchain support (Polygon, Optimism, Base, etc.)
- [ ] Advanced networking options (Ingress, custom DNS)
- [ ] Multi-node cluster configurations
- [ ] Cost estimation for cloud deployments
- [ ] Health check dashboard integration

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express, TypeScript
- **Styling**: CSS with modern animations
- **Build**: Monorepo with npm workspaces

## Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## License

MIT - do whatever you want with it.

---

**[View on GitHub](https://github.com/Flotapponnier/Boba_node)** | Open source project to easily get started with blockchain nodes
