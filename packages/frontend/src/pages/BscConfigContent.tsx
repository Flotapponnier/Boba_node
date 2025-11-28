import { useState, useEffect } from 'react';
import HelpTooltip from '../components/HelpTooltip';
import SectionHeader from '../components/SectionHeader';
import '../styles/common.css';

interface BscConfig {
  deploymentName: string;
  nodeName: string;
  nodeType: 'fast' | 'full' | 'archive' | 'validator';
  namespace: string;
  image: {
    repository: string;
    tag: string;
    pullPolicy: 'Always' | 'IfNotPresent' | 'Never';
  };
  service: {
    type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
    ports: {
      http: { port: number; hostPort?: number };
      ws: { port: number; hostPort?: number };
      metrics: { port: number; hostPort?: number };
      p2p: { port: number; hostPort?: number };
    };
  };
  config: {
    cache: number;
    triesVerifyMode: 'local' | 'full' | 'insecure' | 'none';
    gcMode: 'full' | 'archive';
    historyTransactions: number;
    rpcAllowUnprotectedTxs: boolean;
    syncMode: 'snap' | 'full' | 'light';
    ipcDisable: boolean;
    verbosity: number;
    httpApi: string;
    wsApi: string;
    httpVirtualHosts: string;
    httpCorsOrigins: string;
    txpool: {
      globalslots: number;
      globalqueue: number;
      accountslots: number;
      accountqueue: number;
      lifetime: string;
    };
  };
  networking?: {
    maxPeers: number;
    bootnodes?: string;
    nat: string;
    nodeDiscovery: boolean;
  };
  snapshot?: {
    enabled: boolean;
    url?: string;
    checksum?: string;
  };
  monitoring?: {
    enabled: boolean;
    prometheusOperator: boolean;
    grafanaDashboard: boolean;
  };
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };
  persistence: {
    enabled: boolean;
    storageClass: string;
    size: string;
    hostPath?: string;
  };
  livenessProbe: {
    enabled: boolean;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
  readinessProbe: {
    enabled: boolean;
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
}

type BscNodeType = 'fast' | 'full' | 'archive' | 'validator';

interface BscConfigContentProps {
  nodeType: string;
}

export default function BscConfigContent({ nodeType }: BscConfigContentProps) {
  const [config, setConfig] = useState<BscConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);

  // Load default config and preset from backend
  useEffect(() => {
    fetch('/api/defaults/bsc')
      .then(res => res.json())
      .then(async (data) => {
        setConfig(data);

        // If nodeType is provided, load that preset
        if (nodeType) {
          try {
            const presetResponse = await fetch(`/api/presets/bsc/${nodeType}`);
            const preset = await presetResponse.json();

            setConfig(prev => prev ? ({
              ...prev,
              nodeType: nodeType as BscNodeType,
              deploymentName: `bsc-${nodeType}`,
              nodeName: `bsc-${nodeType}-node`,
              namespace: `bsc-${nodeType}`,
              config: { ...prev.config, ...preset.config },
              resources: preset.resources,
              persistence: { ...prev.persistence, size: preset.persistence.size },
            }) : prev);
          } catch (err) {
            console.error('Failed to load preset:', err);
          }
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load defaults:', err);
        setError('Failed to load configuration');
        setLoading(false);
      });
  }, [nodeType]);

  const handleChange = (path: string, value: any) => {
    if (!config) return;

    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const handleGenerate = async () => {
    if (!config) return;

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/generate/bsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chart');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bsc-node-${config.deploymentName}.tgz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Helm chart generated successfully!');
    } catch (error) {
      console.error('Failed to generate chart:', error);
      setError('Failed to generate chart. Please check your configuration.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="config-page-container">
        <div className="loading">Loading configuration...</div>
      </div>
    );
  }

  // Get documentation URL based on node type
  const getDocUrl = () => {
    if (config.nodeType === 'validator') {
      return 'https://docs.bnbchain.org/bnb-smart-chain/developers/node_operators/validator/run-val/';
    }
    return 'https://docs.bnbchain.org/bnb-smart-chain/developers/node_operators/full_node/';
  };

  // Get node description based on type
  const getNodeDescription = () => {
    switch (config.nodeType) {
      case 'fast':
        return 'Optimized for high-performance RPC with minimal state verification. Ideal for applications requiring fast query responses with reduced resource overhead.';
      case 'full':
        return 'Complete blockchain validation with full state verification. Recommended for most production use cases requiring reliable RPC services and data integrity.';
      case 'archive':
        return 'Stores complete historical state from genesis block. Required for applications needing historical data queries, analytics platforms, and block explorers.';
      case 'validator':
        return 'Block production and consensus participation. Requires BNB stake and high availability infrastructure. Earns block rewards for securing the network.';
      default:
        return 'Configure your Binance Smart Chain node parameters';
    }
  };

  return (
    <div className="config-page-container">
      <div className="config-page-header">
        <h1>BSC {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration</h1>
        <p>{getNodeDescription()}</p>
        <div className="doc-link-container">
          <a
            href={getDocUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-link"
          >
            Official BSC {config.nodeType === 'validator' ? 'Validator' : 'Node'} Documentation
          </a>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
        {/* Basic Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Basic Configuration"
            tooltip="Essential identifiers for your BSC node deployment. These values determine how your node is named and organized in your Kubernetes cluster."
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
                onChange={(e) => handleChange('deploymentName', e.target.value)}
                placeholder="e.g., production, staging, dev"
                required
              />
            </div>
            <div className="form-group">
              <label>
                Node Name
                <HelpTooltip content="Human-readable name for your BSC node. This will be used in labels and service discovery." />
              </label>
              <input
                type="text"
                value={config.nodeName}
                onChange={(e) => handleChange('nodeName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Kubernetes Namespace
                <HelpTooltip content="The Kubernetes namespace where the node will be deployed. Namespaces help organize resources in your cluster." />
              </label>
              <input
                type="text"
                value={config.namespace}
                onChange={(e) => handleChange('namespace', e.target.value)}
                placeholder="default"
              />
            </div>
          </div>
        </div>

        {/* Image Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Container Image"
            tooltip="Docker container image settings for the BSC node. Uses the official BNB Chain image from GitHub Container Registry. Always verify the latest stable version before deploying to production."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>Repository</label>
              <input
                type="text"
                value={config.image.repository}
                onChange={(e) => handleChange('image.repository', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tag</label>
              <input
                type="text"
                value={config.image.tag}
                onChange={(e) => handleChange('image.tag', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pull Policy</label>
              <select
                value={config.image.pullPolicy}
                onChange={(e) => handleChange('image.pullPolicy', e.target.value)}
              >
                <option value="Always">Always</option>
                <option value="IfNotPresent">IfNotPresent</option>
                <option value="Never">Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Service Configuration"
            tooltip="Kubernetes Service configuration for network access. Service type determines how your node is exposed: ClusterIP for internal-only access, NodePort for external access via specific node ports, or LoadBalancer for cloud-managed load balancing."
          />
          <div className="form-group">
            <label>
              Service Type
              <HelpTooltip content="ClusterIP: Internal access only. NodePort: External access via node IP and port. LoadBalancer: Cloud load balancer for production." />
            </label>
            <select
              value={config.service.type}
              onChange={(e) => handleChange('service.type', e.target.value)}
            >
              <option value="ClusterIP">ClusterIP</option>
              <option value="NodePort">NodePort</option>
              <option value="LoadBalancer">LoadBalancer</option>
            </select>
          </div>

          <h3>Ports</h3>
          <div className="form-grid four-columns">
            <div className="form-group">
              <label>HTTP Port</label>
              <input
                type="number"
                value={config.service.ports.http.port}
                onChange={(e) => handleChange('service.ports.http.port', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>WebSocket Port</label>
              <input
                type="number"
                value={config.service.ports.ws.port}
                onChange={(e) => handleChange('service.ports.ws.port', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Metrics Port</label>
              <input
                type="number"
                value={config.service.ports.metrics.port}
                onChange={(e) => handleChange('service.ports.metrics.port', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>P2P Port</label>
              <input
                type="number"
                value={config.service.ports.p2p.port}
                onChange={(e) => handleChange('service.ports.p2p.port', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Node Configuration */}
        <div className="config-section">
          <SectionHeader
            title="Node Configuration"
            tooltip="Core BSC node parameters controlling sync behavior, caching, logging, and API exposure. These settings directly impact node performance, resource usage, and security. Snap sync mode is recommended for faster initial synchronization."
          />
          <div className="form-grid three-columns">
            <div className="form-group">
              <label>
                Cache Size (MB)
                <HelpTooltip content="Memory allocated for state caching. Higher values improve performance but require more RAM. Recommended: 10000-16384MB depending on available memory." />
              </label>
              <input
                type="number"
                value={config.config.cache}
                onChange={(e) => handleChange('config.cache', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Sync Mode
                <HelpTooltip content="Snap: Fast sync with state snapshots (recommended). Full: Downloads entire blockchain. Light: Minimal storage, downloads headers only." />
              </label>
              <select
                value={config.config.syncMode}
                onChange={(e) => handleChange('config.syncMode', e.target.value)}
              >
                <option value="snap">Snap</option>
                <option value="full">Full</option>
                <option value="light">Light</option>
              </select>
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
                onChange={(e) => handleChange('config.verbosity', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                HTTP API
                <HelpTooltip content="Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3, txpool, parlia. More APIs = more attack surface." />
              </label>
              <input
                type="text"
                value={config.config.httpApi}
                onChange={(e) => handleChange('config.httpApi', e.target.value)}
                placeholder="eth,net,web3,txpool,parlia"
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
                onChange={(e) => handleChange('config.wsApi', e.target.value)}
                placeholder="eth,net,web3"
              />
            </div>
          </div>

          <h3>Transaction Pool</h3>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                Global Slots
                <HelpTooltip content="Maximum number of executable transaction slots for all accounts. Higher values allow more pending transactions but use more memory." />
              </label>
              <input
                type="number"
                value={config.config.txpool.globalslots}
                onChange={(e) => handleChange('config.txpool.globalslots', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>
                Global Queue
                <HelpTooltip content="Maximum number of non-executable transaction slots for all accounts. Queued transactions wait for nonce gaps to be filled." />
              </label>
              <input
                type="number"
                value={config.config.txpool.globalqueue}
                onChange={(e) => handleChange('config.txpool.globalqueue', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="config-section">
          <SectionHeader
            title="Resource Requirements"
            tooltip="Kubernetes resource requests defining the minimum CPU and memory allocated to your node. These values ensure your node has guaranteed resources. For production: Fast nodes need 8-16 cores and 32-64GB RAM, Archive nodes require 32+ cores and 128GB+ RAM."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                CPU Requests
                <HelpTooltip content="CPU cores reserved for the node. Use whole numbers (8) or millicores (4000m). Fast node: 8-16 cores, Archive: 32+ cores." />
              </label>
              <input
                type="text"
                value={config.resources.requests.cpu}
                onChange={(e) => handleChange('resources.requests.cpu', e.target.value)}
                placeholder="e.g., 8, 4000m"
              />
            </div>
            <div className="form-group">
              <label>
                Memory Requests
                <HelpTooltip content="RAM reserved for the node. Use Gi (gibibytes) or Mi (mebibytes). Fast node: 32-64Gi, Full: 64Gi, Archive: 128Gi+." />
              </label>
              <input
                type="text"
                value={config.resources.requests.memory}
                onChange={(e) => handleChange('resources.requests.memory', e.target.value)}
                placeholder="e.g., 64Gi, 32768Mi"
              />
            </div>
          </div>
        </div>

        {/* Persistence */}
        <div className="config-section">
          <SectionHeader
            title="Storage Persistence"
            tooltip="Persistent storage configuration using PersistentVolumeClaims (PVC). Critical for production deployments - enables data survival across pod restarts. NVMe SSDs are strongly recommended for blockchain data due to high I/O requirements. BSC mainnet requires 3TB+ for full nodes, 10TB+ for archive nodes."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.persistence.enabled}
                onChange={(e) => handleChange('persistence.enabled', e.target.checked)}
              />
              <span>
                Enable Persistence (PVC)
                <HelpTooltip content="Creates a PersistentVolumeClaim to store blockchain data. Essential for production - without this, data is lost on pod restart." />
              </span>
            </label>
          </div>
          {config.persistence.enabled && (
            <div className="form-grid two-columns">
              <div className="form-group">
                <label>
                  Storage Class
                  <HelpTooltip content="Kubernetes StorageClass name for provisioning. Examples: local-path, gp3, premium-ssd. Must support the required disk size." />
                </label>
                <input
                  type="text"
                  value={config.persistence.storageClass}
                  onChange={(e) => handleChange('persistence.storageClass', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>
                  Size
                  <HelpTooltip content="Disk space for blockchain data. Fast/Full: 3Ti minimum, Archive: 10Ti+. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended." />
                </label>
                <input
                  type="text"
                  value={config.persistence.size}
                  onChange={(e) => handleChange('persistence.size', e.target.value)}
                  placeholder="e.g., 3Ti, 1000Gi"
                />
              </div>
            </div>
          )}
        </div>

        {/* Snapshot Download */}
        <div className="config-section">
          <SectionHeader
            title="Snapshot Download"
            tooltip="Enables downloading a pre-synced blockchain snapshot for faster initial synchronization. Highly recommended for new nodes to reduce sync time from days/weeks to hours. Snapshots are large files (1TB+) so ensure adequate bandwidth and storage."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.snapshot?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleChange('snapshot', {
                      enabled: true,
                      url: 'https://tf-dex-prod-public-snapshot.s3-accelerate.amazonaws.com/geth-latest.tar.gz',
                    });
                  } else {
                    handleChange('snapshot', { enabled: false });
                  }
                }}
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
                onChange={(e) => handleChange('snapshot.url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}
        </div>

        {/* Monitoring */}
        <div className="config-section">
          <SectionHeader
            title="Monitoring Stack"
            tooltip="Integrates Prometheus metrics and Grafana dashboards for comprehensive node monitoring. Tracks sync progress, peer connections, block processing, resource usage, and chain health. Essential for production operations to detect issues proactively."
          />
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.monitoring?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleChange('monitoring', {
                      enabled: true,
                      prometheusOperator: true,
                      grafanaDashboard: true,
                    });
                  } else {
                    handleChange('monitoring', { enabled: false });
                  }
                }}
              />
              Enable Prometheus metrics and Grafana dashboard
            </label>
          </div>
          {config.monitoring?.enabled && (
            <div className="form-grid two-columns">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.monitoring.prometheusOperator}
                    onChange={(e) => handleChange('monitoring.prometheusOperator', e.target.checked)}
                  />
                  Include Prometheus ServiceMonitor
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.monitoring.grafanaDashboard}
                    onChange={(e) => handleChange('monitoring.grafanaDashboard', e.target.checked)}
                  />
                  Include Grafana Dashboard
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Health Probes */}
        <div className="config-section">
          <SectionHeader
            title="Health Probes"
            tooltip="Kubernetes health check configurations. Liveness probes restart unhealthy pods automatically. Readiness probes prevent traffic routing to pods that aren't ready. Essential for high availability and automatic recovery from failures."
          />
          <div className="form-grid two-columns">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.livenessProbe.enabled}
                  onChange={(e) => handleChange('livenessProbe.enabled', e.target.checked)}
                />
                Enable Liveness Probe
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.readinessProbe.enabled}
                  onChange={(e) => handleChange('readinessProbe.enabled', e.target.checked)}
                />
                Enable Readiness Probe
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="button-primary" disabled={generating}>
          {generating ? 'Generating...' : 'Generate Helm Chart'}
        </button>
      </form>
    </div>
  );
}
