import { useState, useEffect } from 'react';
import { EthConfig, DEFAULT_ETH_CONFIG, EthNodeType } from '../types/ethConfig';
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

  // Load preset when node type changes
  const loadNodeTypePreset = async (nodeType: EthNodeType) => {
    try {
      const response = await fetch(`/api/presets/eth/${nodeType}`);
      const preset = await response.json();

      setConfig(prev => ({
        ...prev,
        nodeType,
        config: { ...prev.config, ...preset.config },
        resources: preset.resources,
        persistence: preset.persistence,
      }));
    } catch (err) {
      console.error('Failed to load preset:', err);
    }
  };

  const handleNodeTypeSelect = (nodeType: EthNodeType) => {
    loadNodeTypePreset(nodeType);
  };

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

  return (
    <div className="config-page-container">
      <div className="config-page-header">
        <h1>Ethereum Node Configuration</h1>
        <p>Configure and deploy your Ethereum Geth node to Kubernetes</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Node Type Selection */}
        <div className="config-section">
          <h2>Node Type</h2>
          <div className="node-type-selector">
            <div
              className={`node-type-card ${config.nodeType === 'light' ? 'selected' : ''}`}
              onClick={() => handleNodeTypeSelect('light')}
            >
              <h3>Light</h3>
              <p>Minimal storage, fast sync</p>
            </div>
            <div
              className={`node-type-card ${config.nodeType === 'fast' ? 'selected' : ''}`}
              onClick={() => handleNodeTypeSelect('fast')}
            >
              <h3>Fast</h3>
              <p>Optimized for RPC queries</p>
            </div>
            <div
              className={`node-type-card ${config.nodeType === 'full' ? 'selected' : ''}`}
              onClick={() => handleNodeTypeSelect('full')}
            >
              <h3>Full</h3>
              <p>Complete validation</p>
            </div>
            <div
              className={`node-type-card ${config.nodeType === 'archive' ? 'selected' : ''}`}
              onClick={() => handleNodeTypeSelect('archive')}
            >
              <h3>Archive</h3>
              <p>Full historical state</p>
            </div>
            <div
              className={`node-type-card ${config.nodeType === 'validator' ? 'selected' : ''}`}
              onClick={() => handleNodeTypeSelect('validator')}
            >
              <h3>Validator</h3>
              <p>Staking node</p>
            </div>
          </div>
        </div>

        {/* Basic Configuration */}
        <div className="config-section">
          <h2>Basic Configuration</h2>
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
              <span className="help-text">Used for chart naming (lowercase, alphanumeric, hyphens)</span>
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
              <span className="help-text">1 for mainnet</span>
            </div>
          </div>
        </div>

        {/* Image Configuration */}
        <div className="config-section">
          <h2>Image Configuration</h2>
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
          <h2>Service Configuration</h2>
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
          <h2>Node Configuration</h2>
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
              <span className="help-text">0 for full archive</span>
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
          <h2>Resources</h2>
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
          <h2>Storage</h2>
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
          <h2>Snapshot Download</h2>
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
          <h2>Monitoring Stack</h2>
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
            <h2>Validator Configuration</h2>
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
