![Boba Node](./boba_node_banner.png)

# Boba Node

A simple web interface to generate Helm charts for blockchain nodes. Stop writing YAML manually and configure your nodes through a clean UI instead.

## What is this?

If you need to deploy blockchain nodes on Kubernetes, you know the pain of managing Helm charts. Boba Node gives you a web UI where you fill in your configuration, click generate, and get a production-ready Helm chart.

Currently supports BSC nodes. More chains coming soon.

## Getting Started

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:3001.

## How it works

1. Pick your node type (BSC for now)
2. Configure everything in the web UI - resources, ports, persistence, etc.
3. Click generate and download your Helm chart
4. Deploy to your cluster

The generated chart follows DevOps naming conventions and includes everything you need: StatefulSet, Service, ConfigMap, and proper values files.

## Project Structure

```
packages/
├── backend/   # Express API that generates the charts
└── frontend/  # React interface
```

## Roadmap

- [x] BSC nodes
- [ ] Ethereum nodes
- [ ] Arbitrum nodes
- [ ] Direct kubectl/helm deployment
- [ ] Chart templates customization

## License

MIT - do whatever you want with it.
