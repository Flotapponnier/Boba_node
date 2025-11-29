import { useState, useEffect } from 'react';
import { EthConfig, DEFAULT_ETH_CONFIG, EthNodeType } from '../types/ethConfig';
import HelpTooltip from '../components/HelpTooltip';
import SectionHeader from '../components/SectionHeader';
import ResourcesSection from '../components/sections/eth/ResourcesSection';
import PersistenceSection from '../components/sections/eth/PersistenceSection';
import SnapshotSection from '../components/sections/eth/SnapshotSection';
import MonitoringSection from '../components/sections/eth/MonitoringSection';
import ValidatorSection from '../components/sections/eth/ValidatorSection';
import SuccessModal from '../components/SuccessModal';
import {
  getDocUrl,
  getNodeDescription,
} from '../utils/nodeTypeHelpers';
import '../styles/common.css';

interface EthConfigContentProps {
  nodeType: string;
}

export default function EthConfigContent({ nodeType }: EthConfigContentProps) {
  const [config, setConfig] = useState<EthConfig>(DEFAULT_ETH_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Helper function to handle nested path updates
  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

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

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate chart');
    }
  };

  if (loading) {
    return <div className="loading">Loading configuration...</div>;
  }


  return (
    <div className="config-page-container">
      <div className="config-page-header">
        <h1>Ethereum {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration</h1>
        <p>{getNodeDescription('eth', config.nodeType)}</p>
        <div className="doc-link-container">
          <a
            href={getDocUrl('eth', config.nodeType)}
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
                <HelpTooltip content="pprof debugging endpoint. Default: 6060. Exposes Go profiling data (CPU, memory, goroutines) at /debug/pprof/ for performance analysis and troubleshooting." />
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
        <ResourcesSection
          resources={config.resources}
          nodeType={config.nodeType}
          onChange={handleConfigChange}
        />

        {/* Persistence */}
        <PersistenceSection
          persistence={config.persistence}
          nodeType={config.nodeType}
          onChange={handleConfigChange}
        />

        {/* Snapshot Download */}
        <SnapshotSection
          snapshot={config.snapshot}
          onChange={handleConfigChange}
        />

        {/* Monitoring */}
        <MonitoringSection
          monitoring={config.monitoring}
          onChange={handleConfigChange}
        />

        {/* Validator Configuration */}
        {config.nodeType === 'validator' && (
          <ValidatorSection
            validator={config.validator}
            onChange={handleConfigChange}
          />
        )}

        <button type="submit" className="button-primary">Generate Helm Chart</button>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        deploymentName={config.deploymentName}
        chain="ethereum"
      />
    </div>
  );
}
