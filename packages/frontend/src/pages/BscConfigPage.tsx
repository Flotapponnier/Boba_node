import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BscConfigPage.css';

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

function BscConfigPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BscConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDefaults();
  }, []);

  const loadDefaults = async () => {
    try {
      const response = await axios.get('/api/defaults/bsc');
      setConfig(response.data);
    } catch (error) {
      console.error('Failed to load defaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNodeTypePreset = async (nodeType: string) => {
    try {
      const response = await axios.get(`/api/presets/${nodeType}`);
      const preset = response.data;

      if (config) {
        setConfig({
          ...config,
          nodeType: preset.nodeType,
          config: {
            ...config.config,
            ...preset.config,
          },
          resources: preset.resources,
          persistence: {
            ...config.persistence,
            size: preset.persistence.size,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load preset:', error);
    }
  };

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
    try {
      const response = await axios.post('/api/generate/bsc', config, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bsc-node-${config.deploymentName}.tgz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate chart:', error);
      alert('Failed to generate chart. Please check your configuration.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="config-page">
        <div className="loading">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="config-page">
      <header className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>BSC Node Configuration</h1>
        <p>Configure your Binance Smart Chain node parameters</p>
      </header>

      <div className="config-container">
        <div className="config-form">
          {/* Deployment Info */}
          <section className="form-section">
            <h2>Deployment Information</h2>
            <div className="form-group">
              <label>Deployment Name</label>
              <input
                type="text"
                value={config.deploymentName}
                onChange={(e) => handleChange('deploymentName', e.target.value)}
                placeholder="e.g., production, staging, dev"
              />
              <small>Must be lowercase alphanumeric with hyphens</small>
            </div>
            <div className="form-group">
              <label>Node Name</label>
              <input
                type="text"
                value={config.nodeName}
                onChange={(e) => handleChange('nodeName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Kubernetes Namespace</label>
              <input
                type="text"
                value={config.namespace}
                onChange={(e) => handleChange('namespace', e.target.value)}
                placeholder="default"
              />
              <small>Kubernetes namespace where the node will be deployed</small>
            </div>
          </section>

          {/* Node Type */}
          <section className="form-section node-type-section">
            <h2>Node Type</h2>
            <div className="node-type-selector">
              {(['fast', 'full', 'archive', 'validator'] as const).map((type) => (
                <div
                  key={type}
                  className={`node-type-card ${config.nodeType === type ? 'selected' : ''}`}
                  onClick={() => {
                    handleChange('nodeType', type);
                    loadNodeTypePreset(type);
                  }}
                >
                  <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Node</h3>
                  <p className="node-type-desc">
                    {type === 'fast' && 'High performance RPC node. Best for serving requests.'}
                    {type === 'full' && 'Complete node with recent state. Balanced performance.'}
                    {type === 'archive' && 'Full historical data. For historical queries.'}
                    {type === 'validator' && 'Block validation. Requires BNB stake.'}
                  </p>
                  <div className="node-type-specs">
                    <small>
                      {type === 'fast' && '16 cores | 32GB RAM | 2TB SSD'}
                      {type === 'full' && '16 cores | 64GB RAM | 3TB SSD'}
                      {type === 'archive' && '16 cores | 128GB RAM | 10TB SSD'}
                      {type === 'validator' && '16 cores | 64GB RAM | 3TB SSD'}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Image */}
          <section className="form-section">
            <h2>Container Image</h2>
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
          </section>

          {/* Service */}
          <section className="form-section">
            <h2>Service Configuration</h2>
            <div className="form-group">
              <label>Service Type</label>
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
            <div className="ports-grid">
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
          </section>

          {/* Node Config */}
          <section className="form-section">
            <h2>Node Configuration</h2>
            <div className="form-group">
              <label>Cache Size (MB)</label>
              <input
                type="number"
                value={config.config.cache}
                onChange={(e) => handleChange('config.cache', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Sync Mode</label>
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
              <label>Verbosity (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={config.config.verbosity}
                onChange={(e) => handleChange('config.verbosity', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>HTTP API</label>
              <input
                type="text"
                value={config.config.httpApi}
                onChange={(e) => handleChange('config.httpApi', e.target.value)}
                placeholder="eth,net,web3,txpool,parlia"
              />
            </div>
            <div className="form-group">
              <label>WebSocket API</label>
              <input
                type="text"
                value={config.config.wsApi}
                onChange={(e) => handleChange('config.wsApi', e.target.value)}
                placeholder="eth,net,web3"
              />
            </div>

            <h3>Transaction Pool</h3>
            <div className="form-group">
              <label>Global Slots</label>
              <input
                type="number"
                value={config.config.txpool.globalslots}
                onChange={(e) => handleChange('config.txpool.globalslots', Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Global Queue</label>
              <input
                type="number"
                value={config.config.txpool.globalqueue}
                onChange={(e) => handleChange('config.txpool.globalqueue', Number(e.target.value))}
              />
            </div>
          </section>

          {/* Resources */}
          <section className="form-section">
            <h2>Resource Requirements</h2>
            <h3>Requests</h3>
            <div className="form-group">
              <label>CPU</label>
              <input
                type="text"
                value={config.resources.requests.cpu}
                onChange={(e) => handleChange('resources.requests.cpu', e.target.value)}
                placeholder="e.g., 8, 4000m"
              />
            </div>
            <div className="form-group">
              <label>Memory</label>
              <input
                type="text"
                value={config.resources.requests.memory}
                onChange={(e) => handleChange('resources.requests.memory', e.target.value)}
                placeholder="e.g., 64Gi, 32768Mi"
              />
            </div>
          </section>

          {/* Persistence */}
          <section className="form-section">
            <h2>Storage Persistence</h2>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.persistence.enabled}
                  onChange={(e) => handleChange('persistence.enabled', e.target.checked)}
                />
                Enable Persistence (PVC)
              </label>
            </div>
            {config.persistence.enabled && (
              <>
                <div className="form-group">
                  <label>Storage Class</label>
                  <input
                    type="text"
                    value={config.persistence.storageClass}
                    onChange={(e) => handleChange('persistence.storageClass', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    value={config.persistence.size}
                    onChange={(e) => handleChange('persistence.size', e.target.value)}
                    placeholder="e.g., 3Ti, 1000Gi"
                  />
                </div>
              </>
            )}
          </section>

          {/* Snapshot Download */}
          <section className="form-section">
            <h2>Snapshot Download (Optional)</h2>
            <div className="form-group checkbox-group">
              <label>
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
                Enable Snapshot Download
              </label>
              <small>Downloads blockchain snapshot before first start (faster initial sync)</small>
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
          </section>

          {/* Monitoring */}
          <section className="form-section">
            <h2>Monitoring (Optional)</h2>
            <div className="form-group checkbox-group">
              <label>
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
                Enable Monitoring Stack
              </label>
              <small>Adds Prometheus ServiceMonitor and Grafana Dashboard</small>
            </div>
            {config.monitoring?.enabled && (
              <>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.monitoring.prometheusOperator}
                      onChange={(e) => handleChange('monitoring.prometheusOperator', e.target.checked)}
                    />
                    Include Prometheus ServiceMonitor
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.monitoring.grafanaDashboard}
                      onChange={(e) => handleChange('monitoring.grafanaDashboard', e.target.checked)}
                    />
                    Include Grafana Dashboard
                  </label>
                </div>
              </>
            )}
          </section>

          {/* Health Probes */}
          <section className="form-section">
            <h2>Health Probes</h2>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.livenessProbe.enabled}
                  onChange={(e) => handleChange('livenessProbe.enabled', e.target.checked)}
                />
                Enable Liveness Probe
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.readinessProbe.enabled}
                  onChange={(e) => handleChange('readinessProbe.enabled', e.target.checked)}
                />
                Enable Readiness Probe
              </label>
            </div>
          </section>
        </div>

        <div className="action-panel">
          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Helm Chart'}
          </button>
          <div className="info-panel">
            <h3>Chart Information</h3>
            <p>This will generate a complete Helm chart with:</p>
            <ul>
              <li>Chart.yaml</li>
              <li>values-{config.deploymentName}.yaml</li>
              <li>StatefulSet template</li>
              <li>Service template</li>
              <li>ConfigMap template</li>
            </ul>
            <p className="deployment-name">
              Deployment: <strong>{config.deploymentName}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BscConfigPage;
