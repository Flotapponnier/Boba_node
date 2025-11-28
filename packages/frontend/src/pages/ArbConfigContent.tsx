import { useState, useEffect } from 'react';
import { ArbConfig, DEFAULT_ARB_CONFIG, ArbNodeType } from '../types/arbConfig';
import HelpTooltip from '../components/HelpTooltip';
import SectionHeader from '../components/SectionHeader';
import '../styles/common.css';

interface ArbConfigContentProps {
  nodeType: string;
}

export default function ArbConfigContent({ nodeType }: ArbConfigContentProps) {
  const [config, setConfig] = useState<ArbConfig>(DEFAULT_ARB_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load default config and preset from backend
  useEffect(() => {
    fetch('/api/defaults/arb')
      .then(res => res.json())
      .then(async (data) => {
        setConfig(data);

        // Load preset based on nodeType prop
        if (nodeType) {
          try {
            const presetResponse = await fetch(`/api/presets/arb/${nodeType}`);
            const preset = await presetResponse.json();

            setConfig(prev => ({
              ...prev,
              nodeType: nodeType as ArbNodeType,
              deploymentName: `arb-${nodeType}`,
              nodeName: `arb-${nodeType}-node`,
              namespace: `arb-${nodeType}`,
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
      const response = await fetch('/api/generate/arb', {
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
      a.download = `arbitrum-node-${config.deploymentName}.tgz`;
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
      case 'archive':
        return 'https://docs.arbitrum.io/run-arbitrum-node/more-types/run-archive-node';
      case 'validator':
        return 'https://docs.arbitrum.io/run-arbitrum-node/more-types/run-validator-node';
      case 'full':
      default:
        return 'https://docs.arbitrum.io/node-running/how-tos/running-a-full-node';
    }
  };

  // Get node description based on type
  const getNodeDescription = () => {
    switch (config.nodeType) {
      case 'full':
        return 'Layer 2 node with pruned state running in watchtower mode. Validates rollup state against L1 and provides RPC access for dApps. Suitable for most production workloads requiring L2 interaction.';
      case 'archive':
        return 'Complete historical L2 state from genesis with full transaction history. Required for analytics, block explorers, and applications needing historical state queries across all Arbitrum blocks.';
      case 'validator':
        return 'Verifies L2 state correctness and can post assertions to L1. Watchtower mode monitors for fraud. Active validation requires allow-listing on mainnet. Essential for network security and dispute resolution.';
      default:
        return 'Configure and deploy your Arbitrum Nitro node to Kubernetes';
    }
  };

  // Get context-aware CPU tooltip based on node type
  const getCpuTooltip = () => {
    switch (config.nodeType) {
      case 'full':
        return 'CPU cores reserved for full node. Use whole numbers (4) or millicores (4000m). Full nodes: 4-core minimum, single-core performance matters for Nitro.';
      case 'archive':
        return 'CPU cores reserved for archive node. Use whole numbers (4) or millicores (4000m). Archive nodes: 4-core minimum, high single-core performance for historical queries.';
      case 'validator':
        return 'CPU cores reserved for validator node. Use whole numbers (4) or millicores (4000m). Validators: 4-core minimum for state verification and L1 monitoring.';
      default:
        return 'CPU cores reserved for the node.';
    }
  };

  // Get context-aware memory tooltip based on node type
  const getMemoryTooltip = () => {
    switch (config.nodeType) {
      case 'full':
        return 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 16Gi minimum for pruned L2 state and watchtower mode.';
      case 'archive':
        return 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 16Gi+ for complete historical L2 state.';
      case 'validator':
        return 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 16Gi+ for state verification and assertion posting.';
      default:
        return 'RAM reserved for the node.';
    }
  };

  // Get context-aware storage tooltip based on node type
  const getStorageTooltip = () => {
    switch (config.nodeType) {
      case 'full':
        return 'Disk space for full node L2 data. 2Ti minimum (Arb One: ~560GB + 200GB/month growth). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.';
      case 'archive':
        return 'Disk space for archive node L2 data. 12Ti+ required (Arb One: ~9.7TB + 850GB/month growth). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      case 'validator':
        return 'Disk space for validator node data. 2Ti minimum recommended for L2 state and L1 monitoring. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.';
      default:
        return 'Disk space for blockchain data.';
    }
  };

  return (
    <div className="config-page-container">
      <div className="config-page-header">
        <h1>Arbitrum {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration</h1>
        <p>{getNodeDescription()}</p>
        <div className="doc-link-container">
          <a
            href={getDocUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-link"
          >
            Official Arbitrum {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Documentation
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
            tooltip="Essential deployment identifiers for your Arbitrum Nitro node. These settings determine how your Layer 2 node is identified and organized in your Kubernetes environment."
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
                <HelpTooltip content="Human-readable name for your Arbitrum node. Used in labels and service discovery within the cluster." />
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
                <HelpTooltip content="Kubernetes namespace for deployment. Namespaces help organize L2 node resources in your cluster." />
              </label>
              <input
                type="text"
                value={config.namespace}
                onChange={(e) => setConfig({ ...config, namespace: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                Chain
                <HelpTooltip content="Arbitrum chain to connect to. Arb One: Main L2 network. Nova: Low-cost chain for gaming/social. Sepolia: Testnet for development." />
              </label>
              <select
                value={config.config.chainName}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, chainName: e.target.value as any }
                })}
              >
                <option value="arb1">Arbitrum One (Mainnet)</option>
                <option value="nova">Arbitrum Nova</option>
                <option value="sepolia">Arbitrum Sepolia (Testnet)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Image Configuration"
            tooltip="Docker image settings for Arbitrum Nitro node. Official images from offchainlabs/nitro-node. Nitro is Arbitrum's optimistic rollup technology. Note: v3.8.0+ changes database schema and cannot be downgraded."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>
                Repository
                <HelpTooltip content="Docker image repository. Default: offchainlabs/nitro-node for official Arbitrum Nitro images." />
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
                <HelpTooltip content="Nitro node version tag. Check github.com/OffchainLabs/nitro for latest releases. Note: v3.8.0+ cannot downgrade." />
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
            tooltip="Kubernetes Service configuration for network access to your Arbitrum node. Controls how the node is exposed to clients and peers. Includes standard RPC/WS ports plus sequencer feed port for L2 transaction streaming."
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
                <HelpTooltip content="HTTP JSON-RPC API port. Default: 8547. Used for L2 RPC calls, contract interactions, and transaction broadcasting." />
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
                      http: { port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                WS Port
                <HelpTooltip content="WebSocket RPC port. Default: 8548. Enables real-time L2 event subscriptions for blocks, logs, and transactions." />
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
                      ws: { port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Metrics Port
                <HelpTooltip content="Prometheus metrics endpoint. Default: 6070. Exposes L2 node performance, sync status, and health metrics." />
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
                      metrics: { port: parseInt(e.target.value) }
                    }
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Sequencer Feed Port
                <HelpTooltip content="Sequencer feed WebSocket port. Default: 9642. Receives real-time L2 transaction data from Arbitrum sequencer for faster sync." />
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
                      p2p: { port: parseInt(e.target.value) }
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
            tooltip="Arbitrum Nitro-specific parameters. Parent Chain URL connects to Ethereum L1 for state verification. Prune mode determines state retention: 'full' for recent states, 'archive' for complete history. Single-core performance is critical for Nitro nodes."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                Parent Chain URL (L1 Ethereum RPC)
                <HelpTooltip content="Ethereum L1 RPC endpoint URL. Required for state verification and batch reading. Use archive node for validators, full node sufficient for watchtower." />
              </label>
              <input
                type="text"
                value={config.config.parentChainUrl}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, parentChainUrl: e.target.value }
                })}
                placeholder="https://ethereum-rpc.publicnode.com"
              />
            </div>
            <div className="form-group">
              <label>
                Prune Mode
                <HelpTooltip content="State retention policy. Full: Recent state only (recommended). Validator: Optimized for validation. Archive: Complete historical state." />
              </label>
              <select
                value={config.config.pruneMode}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, pruneMode: e.target.value as any }
                })}
              >
                <option value="full">Full</option>
                <option value="validator">Validator</option>
                <option value="archive">Archive</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                HTTP API
                <HelpTooltip content="Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3, arb. Limit exposed APIs in production for security." />
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
                <HelpTooltip content="Comma-separated list of RPC APIs available over WebSocket. Enables real-time L2 event subscriptions. Common: eth, net, web3, arb." />
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
            <div className="form-group">
              <label>
                Max Peers
                <HelpTooltip content="Maximum number of P2P network peers. Higher values improve network connectivity but increase bandwidth usage. Default: 50." />
              </label>
              <input
                type="number"
                value={config.config.p2pMaxPeers}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, p2pMaxPeers: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label>
                Log Level
                <HelpTooltip content="Logging verbosity. Info: Standard production logging. Debug/Trace: Detailed troubleshooting. Warn/Error: Minimal logging for production." />
              </label>
              <select
                value={config.config.logLevel}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, logLevel: e.target.value as any }
                })}
              >
                <option value="trace">Trace</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="config-section">
          <SectionHeader
            title="Resources"
            tooltip="Kubernetes resource allocation for Arbitrum Nitro node. Minimum requirements: 4-core CPU (single-core performance matters), 16GB RAM. Full nodes need 2TB storage, Archive nodes require 12TB+ for Arbitrum One. Storage grows ~850GB/month for Arb One."
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
            tooltip="Persistent storage for Arbitrum blockchain data. NVMe SSDs strongly recommended due to high I/O requirements. Arbitrum One: 560GB pruned (grows 200GB/month), Nova: 400GB pruned (grows 1.6TB/month). Archive nodes need significantly more."
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
                <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. NVMe SSD required for Arbitrum due to high I/O demands." />
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
            tooltip="Pre-synced Arbitrum blockchain snapshot for faster node initialization. Note: As of May 2024, official snapshot service discontinued due to rapid state growth. Community snapshots may be available. Verify checksum if provided."
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
                <HelpTooltip content="URL to L2 snapshot download. Note: Official snapshot service discontinued May 2024. Community snapshots may be available, verify checksums." />
              </label>
              <input
                type="text"
                value={config.snapshot.url || ''}
                onChange={(e) => setConfig({
                  ...config,
                  snapshot: { enabled: true, url: e.target.value, checksum: config.snapshot?.checksum }
                })}
                placeholder="https://snapshot.arbitrum.foundation/arb1/nitro-pruned.tar"
              />
            </div>
          )}
        </div>

        {/* Monitoring */}
        <div className="config-section">
          <SectionHeader
            title="Monitoring Stack"
            tooltip="Prometheus metrics and Grafana dashboards for Arbitrum node monitoring. Tracks L2 sync progress, sequencer feed connection, batch posting, parent chain connectivity, and resource utilization. Essential for production L2 operations."
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
              tooltip="Arbitrum validator/staker configuration. Validators verify L2 state against L1. Watchtower mode (enabled by default) monitors for invalid states. Staker strategies determine asserting behavior. Note: Mainnet validators require allow-listing."
            />
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.config.stakerEnable}
                  onChange={(e) => setConfig({
                    ...config,
                    config: { ...config.config, stakerEnable: e.target.checked }
                  })}
                />
                Enable staker/validator mode
              </label>
            </div>
            {config.config.stakerEnable && (
              <div className="form-group">
                <label>
                  Staker Strategy
                  <HelpTooltip content="Validator assertion strategy. Defensive: Only dispute invalid states (recommended). StakeLatest: Always stake on latest assertion. Requires L1 gas for staking." />
                </label>
                <select
                  value={config.config.stakerStrategy || 'Defensive'}
                  onChange={(e) => setConfig({
                    ...config,
                    config: { ...config.config, stakerStrategy: e.target.value as any }
                  })}
                >
                  <option value="Defensive">Defensive</option>
                  <option value="MakeNodes">MakeNodes</option>
                  <option value="ResolveNodes">ResolveNodes</option>
                  <option value="StakeLatest">StakeLatest</option>
                </select>
              </div>
            )}
          </div>
        )}

        <button type="submit" className="button-primary">Generate Helm Chart</button>
      </form>
    </div>
  );
}
