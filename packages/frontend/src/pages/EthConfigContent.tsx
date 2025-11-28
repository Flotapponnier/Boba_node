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
              <label>Deployment Name *</label>
              <input
                type="text"
                value={config.deploymentName}
                onChange={(e) => setConfig({ ...config, deploymentName: e.target.value })}
                placeholder="production-mainnet"
                required
              />
            </div>
            <div className="form-group">
              <label>Node Name</label>
              <input
                type="text"
                value={config.nodeName}
                onChange={(e) => setConfig({ ...config, nodeName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Namespace</label>
              <input
                type="text"
                value={config.namespace}
                onChange={(e) => setConfig({ ...config, namespace: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Network ID</label>
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
              <label>Repository</label>
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
              <label>Tag</label>
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
              <label>Pull Policy</label>
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
            <label>Service Type</label>
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
              <label>HTTP Port</label>
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
              <label>WS Port</label>
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
              <label>Metrics Port</label>
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
              <label>P2P Port</label>
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
              <label>Sync Mode</label>
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
              <label>GC Mode</label>
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
              <label>State Scheme</label>
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
              <label>Cache (MB)</label>
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
              <label>Verbosity (0-5)</label>
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
              <label>History State</label>
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
              <label>HTTP API</label>
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
              <label>WebSocket API</label>
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
              <label>CPU Requests</label>
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
              <label>Memory Requests</label>
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
              <label>Storage Class</label>
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
              <label>Size</label>
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
              <label>Snapshot URL</label>
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
                  <label>Consensus Client</label>
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
                  <label>Fee Recipient Address</label>
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
