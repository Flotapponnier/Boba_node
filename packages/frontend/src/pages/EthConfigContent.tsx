import { useState, useEffect } from 'react';
import { EthConfig, DEFAULT_ETH_CONFIG, EthNodeType } from '../types/ethConfig';
import HelpTooltip from '../components/HelpTooltip';
import SectionHeader from '../components/SectionHeader';
import '../styles/common.css';

interface EthConfigContentProps {
  nodeType: string;
}

export default function EthConfigContent({ nodeType }: EthConfigContentProps) {
  const [config, setConfig] = useState<EthConfig>(DEFAULT_ETH_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load default config and preset from backend
  useEffect(() => {
    fetch('/api/defaults/eth')
      .then(res => res.json())
      .then(async (data) => {
        setConfig(data);

        // Load preset based on nodeType prop
        if (nodeType) {
          try {
            const presetResponse = await fetch(`/api/presets/eth/${nodeType}`);
            const preset = await presetResponse.json();

            setConfig(prev => ({
              ...prev,
              nodeType: nodeType as EthNodeType,
              deploymentName: `eth-${nodeType}`,
              nodeName: `eth-${nodeType}-node`,
              namespace: `eth-${nodeType}`,
              config: { ...prev.config, ...preset.config },
              resources: preset.resources,
              persistence: preset.persistence,
            }));
          } catch (err) {
            console.error('Failed to load preset:', err);
          }
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load defaults:', err);
        setLoading(false);
      });
  }, [nodeType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!config.deploymentName) {
      setError('Deployment name is required');
      return;
    }

    try {
      const response = await fetch('/api/generate/eth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chart');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ethereum-node-${config.deploymentName}.tgz`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Helm chart generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate chart');
    }
  };

  if (loading) {
    return <div className="loading">Loading configuration...</div>;
  }

  // Get documentation URL based on node type
  const getDocUrl = () => {
    switch (config.nodeType) {
      case 'light':
        return 'https://ethereum.org/developers/docs/nodes-and-clients/';
      case 'archive':
        return 'https://geth.ethereum.org/docs/fundamentals/archive';
      case 'validator':
        return 'https://ethereum.org/staking/';
      case 'full':
      default:
        return 'https://geth.ethereum.org/docs/getting-started/hardware-requirements';
    }
  };

  // Get node description based on type
  const getNodeDescription = () => {
    switch (config.nodeType) {
      case 'light':
        return 'Downloads block headers only for minimal resource usage. Suitable for lightweight applications and mobile wallets requiring basic blockchain interaction without full validation.';
      case 'full':
        return 'Validates all blocks with snap sync, keeping recent state. Recommended for most applications requiring reliable RPC access, smart contract deployment, and transaction broadcasting.';
      case 'archive':
        return 'Maintains complete historical state from genesis. Essential for block explorers, analytics platforms, and applications requiring historical state queries at any block height.';
      case 'validator':
        return 'Participates in Proof-of-Stake consensus with block proposals and attestations. Requires 32 ETH stake, consensus client, and high uptime. Earns staking rewards and transaction fees.';
      default:
        return 'Configure and deploy your Ethereum node to Kubernetes';
    }
  };

  // Get context-aware CPU tooltip based on node type
  const getCpuTooltip = () => {
    switch (config.nodeType) {
      case 'light':
        return 'CPU cores reserved for light node. Use whole numbers (2) or millicores (2000m). Light nodes: 2-4 cores for header-only sync.';
      case 'full':
        return 'CPU cores reserved for full node. Use whole numbers (8) or millicores (8000m). Full nodes: 8-16 cores recommended for snap sync and validation.';
      case 'archive':
        return 'CPU cores reserved for archive node. Use whole numbers (16) or millicores (16000m). Archive nodes: 16-32 cores required for historical state queries.';
      case 'validator':
        return 'CPU cores reserved for validator node. Use whole numbers (8) or millicores (8000m). Validators: 8+ cores for block proposals and attestations.';
      default:
        return 'CPU cores reserved for the node.';
    }
  };

  // Get context-aware memory tooltip based on node type
  const getMemoryTooltip = () => {
    switch (config.nodeType) {
      case 'light':
        return 'RAM reserved for light node. Use Gi (gibibytes) or Mi (mebibytes). Light nodes: 4-8Gi for minimal resource usage.';
      case 'full':
        return 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 16-32Gi for snap sync and recent state.';
      case 'archive':
        return 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 64Gi+ for complete historical state.';
      case 'validator':
        return 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 32Gi+ for consensus participation.';
      default:
        return 'RAM reserved for the node.';
    }
  };

  // Get context-aware storage tooltip based on node type
  const getStorageTooltip = () => {
    switch (config.nodeType) {
      case 'light':
        return 'Disk space for light node data. 100Gi minimum for headers. Use Ti (tebibytes) or Gi (gibibytes). SSD recommended.';
      case 'full':
        return 'Disk space for full node blockchain data. 2Ti minimum (grows ~14GB/week). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.';
      case 'archive':
        return 'Disk space for archive node blockchain data. 12-20Ti+ required for complete history. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      case 'validator':
        return 'Disk space for validator node data. 2Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory for validators.';
      default:
        return 'Disk space for blockchain data.';
    }
  };

  return (
    <div className="config-page-container">
      <div className="config-page-header">
        <h1>Ethereum {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration</h1>
        <p>{getNodeDescription()}</p>
        <div className="doc-link-container">
          <a
            href={getDocUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-link"
          >
            Official Ethereum {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Documentation
          </a>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Basic Configuration"
            tooltip="Core identifiers for your Ethereum node deployment. These settings define how your node is named and organized within your Kubernetes cluster infrastructure."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                Deployment Name *
                <HelpTooltip content="Unique identifier for this deployment. Used in Helm chart naming and Kubernetes resources. Must be lowercase alphanumeric with hyphens only." />
              </label>
              <input
                type="text"
                value={config.deploymentName}
                onChange={(e) => setConfig({ ...config, deploymentName: e.target.value })}
                placeholder="production-mainnet"
                required
              />
            </div>
            <div className="form-group">
              <label>
                Node Name
                <HelpTooltip content="Human-readable name for your Ethereum node. Used in labels and service discovery." />
              </label>
              <input
                type="text"
                value={config.nodeName}
                onChange={(e) => setConfig({ ...config, nodeName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                Namespace
                <HelpTooltip content="Kubernetes namespace for deployment. Namespaces help organize resources in your cluster." />
              </label>
              <input
                type="text"
                value={config.namespace}
                onChange={(e) => setConfig({ ...config, namespace: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                Network ID
                <HelpTooltip content="Ethereum network identifier. 1: Mainnet, 11155111: Sepolia testnet, 17000: Holesky testnet." />
              </label>
              <input
                type="number"
                value={config.config.networkId}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, networkId: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        </div>

        {/* Image Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Image Configuration"
            tooltip="Docker container image configuration for Geth (Go Ethereum). Uses the official ethereum/client-go image. Geth is the most widely used Ethereum execution client. Always verify the latest stable version before production deployment."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>
                Repository
                <HelpTooltip content="Docker image repository. Default: ethereum/client-go for official Geth images from Docker Hub." />
              </label>
              <input
                type="text"
                value={config.image.repository}
                onChange={(e) => setConfig({
                  ...config,
                  image: { ...config.image, repository: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Tag
                <HelpTooltip content="Geth version tag. Check releases at github.com/ethereum/go-ethereum for latest stable versions." />
              </label>
              <input
                type="text"
                value={config.image.tag}
                onChange={(e) => setConfig({
                  ...config,
                  image: { ...config.image, tag: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Pull Policy
                <HelpTooltip content="When to pull the image. IfNotPresent: Use cached image. Always: Pull on every restart. Never: Only use local image." />
              </label>
              <select
                value={config.image.pullPolicy}
                onChange={(e) => setConfig({
                  ...config,
                  image: { ...config.image, pullPolicy: e.target.value as any }
                })}
              >
                <option value="IfNotPresent">IfNotPresent</option>
                <option value="Always">Always</option>
                <option value="Never">Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Service Configuration"
            tooltip="Kubernetes Service settings controlling network access to your Ethereum node. Service type determines exposure: ClusterIP for cluster-internal only, NodePort for external access via node IPs, LoadBalancer for cloud provider load balancing."
          />
          <div className="form-group">
            <label>
              Service Type
              <HelpTooltip content="ClusterIP: Internal access only. NodePort: External access via node IP and port. LoadBalancer: Cloud load balancer for production." />
            </label>
            <select
              value={config.service.type}
              onChange={(e) => setConfig({
                ...config,
                service: { ...config.service, type: e.target.value as any }
              })}
            >
              <option value="ClusterIP">ClusterIP</option>
              <option value="NodePort">NodePort</option>
              <option value="LoadBalancer">LoadBalancer</option>
            </select>
          </div>
          <div className="form-grid four-columns">
            <div className="form-group">
              <label>
                HTTP Port
                <HelpTooltip content="HTTP JSON-RPC API port. Default: 8545. Used for eth_call, eth_sendTransaction, and other RPC methods." />
              </label>
              <input
                type="number"
                value={config.service.ports.http.port}
                onChange={(e) => setConfig({
                  ...config,
                  service: {
                    ...config.service,
                    ports: {
                      ...config.service.ports,
                      http: { ...config.service.ports.http, port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                WS Port
                <HelpTooltip content="WebSocket RPC port. Default: 8546. Enables real-time subscriptions for new blocks, logs, and pending transactions." />
              </label>
              <input
                type="number"
                value={config.service.ports.ws.port}
                onChange={(e) => setConfig({
                  ...config,
                  service: {
                    ...config.service,
                    ports: {
                      ...config.service.ports,
                      ws: { ...config.service.ports.ws, port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Metrics Port
                <HelpTooltip content="Prometheus metrics endpoint. Default: 6060. Exposes node performance and health metrics for monitoring." />
              </label>
              <input
                type="number"
                value={config.service.ports.metrics.port}
                onChange={(e) => setConfig({
                  ...config,
                  service: {
                    ...config.service,
                    ports: {
                      ...config.service.ports,
                      metrics: { ...config.service.ports.metrics, port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                P2P Port
                <HelpTooltip content="Peer-to-peer network port. Default: 30303. Used for node discovery and blockchain synchronization with other Ethereum nodes." />
              </label>
              <input
                type="number"
                value={config.service.ports.p2p.port}
                onChange={(e) => setConfig({
                  ...config,
                  service: {
                    ...config.service,
                    ports: {
                      ...config.service.ports,
                      p2p: { ...config.service.ports.p2p, port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
          </div>
        </div>

        {/* Node Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Node Configuration"
            tooltip="Core Geth parameters controlling synchronization, state management, caching, and API exposure. Sync mode affects initial sync speed. Path-based state scheme (recommended) offers better performance and smaller disk footprint than hash-based. These settings significantly impact performance and resource usage."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>
                Sync Mode
                <HelpTooltip content="Snap: Fast sync with state snapshots (recommended). Full: Downloads entire blockchain. Light: Minimal storage, downloads headers only." />
              </label>
              <select
                value={config.config.syncMode}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, syncMode: e.target.value as any }
                })}
              >
                <option value="snap">Snap</option>
                <option value="full">Full</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                GC Mode
                <HelpTooltip content="Garbage collection mode. Full: Prunes old state (recommended for most nodes). Archive: Keeps all historical state." />
              </label>
              <select
                value={config.config.gcMode}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, gcMode: e.target.value as any }
                })}
              >
                <option value="full">Full</option>
                <option value="archive">Archive</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                State Scheme
                <HelpTooltip content="State storage format. Path: Modern, efficient scheme with better performance (recommended). Hash: Legacy scheme, larger disk footprint." />
              </label>
              <select
                value={config.config.stateScheme}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, stateScheme: e.target.value as any }
                })}
              >
                <option value="path">Path (Recommended)</option>
                <option value="hash">Hash</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                Cache (MB)
                <HelpTooltip content="Memory allocated for state caching. Higher values improve performance but require more RAM. Recommended: 4096-8192MB depending on node type." />
              </label>
              <input
                type="number"
                value={config.config.cache}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, cache: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Verbosity (0-5)
                <HelpTooltip content="Logging level. 0: Silent, 1: Error, 2: Warn, 3: Info (recommended), 4: Debug, 5: Trace. Higher values produce more logs." />
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={config.config.verbosity}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, verbosity: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                History State
                <HelpTooltip content="Number of recent blocks to keep state for historical queries. Default: 90000 (~12 days). Set to 0 for archive nodes." />
              </label>
              <input
                type="number"
                value={config.config.historyState}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, historyState: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                HTTP API
                <HelpTooltip content="Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3. More APIs = more attack surface, limit in production." />
              </label>
              <input
                type="text"
                value={config.config.httpApi}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, httpApi: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                WebSocket API
                <HelpTooltip content="Comma-separated list of RPC APIs available over WebSocket. WebSocket enables real-time event subscriptions. Common: eth, net, web3." />
              </label>
              <input
                type="text"
                value={config.config.wsApi}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, wsApi: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="config-section">
          <SectionHeader
            title="Resources"
            tooltip="Kubernetes resource allocation for your Ethereum node. Requests guarantee minimum resources. For Ethereum mainnet: Light nodes need 2-4 cores and 4-8GB RAM, Full nodes require 8-16 cores and 16-32GB RAM, Archive nodes need 16-32 cores and 64GB+ RAM."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                CPU Requests
                <HelpTooltip content={getCpuTooltip()} />
              </label>
              <input
                type="text"
                value={config.resources.requests.cpu}
                onChange={(e) => setConfig({
                  ...config,
                  resources: {
                    ...config.resources,
                    requests: { ...config.resources.requests, cpu: e.target.value }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Memory Requests
                <HelpTooltip content={getMemoryTooltip()} />
              </label>
              <input
                type="text"
                value={config.resources.requests.memory}
                onChange={(e) => setConfig({
                  ...config,
                  resources: {
                    ...config.resources,
                    requests: { ...config.resources.requests, memory: e.target.value }
                  }
                })}
              />
            </div>
          </div>
        </div>

        {/* Persistence */}
        <div className="config-section">
          <SectionHeader
            title="Storage"
            tooltip="Persistent volume configuration for blockchain data. Essential for production - ensures data persists across pod restarts. Ethereum mainnet requires fast SSD storage: Full nodes need 2TB minimum, Archive nodes require 12-20TB+. Database grows ~14GB per week."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.persistence.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    persistence: { ...config.persistence, enabled: e.target.checked }
                  })}
                />
                Enable Persistent Volume
              </label>
            </div>
            <div className="form-group">
              <label>
                Storage Class
                <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. Must support the required disk size and IOPS." />
              </label>
              <input
                type="text"
                value={config.persistence.storageClass}
                onChange={(e) => setConfig({
                  ...config,
                  persistence: { ...config.persistence, storageClass: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Size
                <HelpTooltip content={getStorageTooltip()} />
              </label>
              <input
                type="text"
                value={config.persistence.size}
                onChange={(e) => setConfig({
                  ...config,
                  persistence: { ...config.persistence, size: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Snapshot Download */}
        <div className="config-section">
          <SectionHeader
            title="Snapshot Download"
            tooltip="Pre-synced blockchain snapshot for faster initial synchronization. Reduces sync time from weeks to hours/days. Ethereum mainnet snapshots are 600GB+ compressed. Ensure sufficient bandwidth and temporary storage for download and extraction."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.snapshot?.enabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  snapshot: { enabled: e.target.checked, url: config.snapshot?.url, checksum: config.snapshot?.checksum }
                })}
              />
              Enable snapshot download for faster initial sync
            </label>
          </div>
          {config.snapshot?.enabled && (
            <div className="form-group">
              <label>
                Snapshot URL
                <HelpTooltip content="URL to download blockchain snapshot. Use trusted sources only. Snapshots are large (600GB+ compressed) and reduce initial sync time significantly." />
              </label>
              <input
                type="text"
                value={config.snapshot.url || ''}
                onChange={(e) => setConfig({
                  ...config,
                  snapshot: { enabled: true, url: e.target.value, checksum: config.snapshot?.checksum }
                })}
                placeholder="https://example.com/eth-snapshot.tar.gz"
              />
            </div>
          )}
        </div>

        {/* Monitoring */}
        <div className="config-section">
          <SectionHeader
            title="Monitoring Stack"
            tooltip="Prometheus and Grafana integration for comprehensive node monitoring. Tracks sync status, peer count, block processing, gas usage, transaction pool, and system resources. Critical for production operations and troubleshooting."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.monitoring?.enabled || false}
                onChange={(e) => setConfig({
                  ...config,
                  monitoring: {
                    enabled: e.target.checked,
                    prometheusOperator: config.monitoring?.prometheusOperator ?? true,
                    grafanaDashboard: config.monitoring?.grafanaDashboard ?? true,
                    serviceMonitor: config.monitoring?.serviceMonitor
                  }
                })}
              />
              Enable Prometheus metrics and Grafana dashboard
            </label>
          </div>
        </div>

        {/* Validator Configuration */}
        {config.nodeType === 'validator' && (
          <div className="config-section">
            <SectionHeader
              title="Validator Configuration"
              tooltip="Ethereum Proof-of-Stake validator settings. Requires running both execution client (Geth) and consensus client (Prysm, Lighthouse, etc.) together. Validators need 32 ETH stake. Fee recipient address receives transaction tips and MEV rewards."
            />
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.validator?.enabled || false}
                  onChange={(e) => setConfig({
                    ...config,
                    validator: {
                      enabled: e.target.checked,
                      consensusClient: config.validator?.consensusClient ?? 'prysm',
                      feeRecipient: config.validator?.feeRecipient,
                      graffiti: config.validator?.graffiti
                    }
                  })}
                />
                Enable validator mode (requires consensus client)
              </label>
            </div>
            {config.validator?.enabled && (
              <>
                <div className="form-group">
                  <label>
                    Consensus Client
                    <HelpTooltip content="Consensus layer client for validator. Each has different resource requirements and features. Client diversity is important for network health." />
                  </label>
                  <select
                    value={config.validator?.consensusClient || 'prysm'}
                    onChange={(e) => setConfig({
                      ...config,
                      validator: {
                        enabled: true,
                        consensusClient: e.target.value as any,
                        feeRecipient: config.validator?.feeRecipient,
                        graffiti: config.validator?.graffiti
                      }
                    })}
                  >
                    <option value="prysm">Prysm</option>
                    <option value="lighthouse">Lighthouse</option>
                    <option value="teku">Teku</option>
                    <option value="nimbus">Nimbus</option>
                    <option value="lodestar">Lodestar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Fee Recipient Address
                    <HelpTooltip content="Ethereum address to receive transaction priority fees and MEV rewards. Must be a valid Ethereum address starting with 0x." />
                  </label>
                  <input
                    type="text"
                    value={config.validator?.feeRecipient || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      validator: {
                        enabled: true,
                        consensusClient: config.validator?.consensusClient || 'prysm',
                        feeRecipient: e.target.value,
                        graffiti: config.validator?.graffiti
                      }
                    })}
                    placeholder="0x..."
                  />
                </div>
              </>
            )}
          </div>
        )}

        <button type="submit" className="button-primary">Generate Helm Chart</button>
      </form>
    </div>
  );
}
