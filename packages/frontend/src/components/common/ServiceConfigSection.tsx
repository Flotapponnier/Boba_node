import HelpTooltip from '../HelpTooltip';
import SectionHeader from '../SectionHeader';

interface PortConfig {
  port: number;
  hostPort?: number;
}

interface ServicePorts {
  http: PortConfig;
  ws: PortConfig;
  metrics: PortConfig;
  p2p: PortConfig;
}

interface ServiceConfig {
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  ports: ServicePorts;
}

interface ServiceConfigSectionProps {
  service: ServiceConfig;
  onTypeChange: (value: string) => void;
  onPortChange: (portType: keyof ServicePorts, value: number) => void;
  p2pLabel?: string;
  p2pTooltip?: string;
}

export default function ServiceConfigSection({
  service,
  onTypeChange,
  onPortChange,
  p2pLabel = "P2P Port",
  p2pTooltip = "Peer-to-peer network port. Used for node discovery and blockchain synchronization.",
}: ServiceConfigSectionProps) {
  return (
    <div className="config-section">
      <SectionHeader
        title="Service Configuration"
        tooltip="Kubernetes Service settings controlling network access to your node. Service type determines exposure: ClusterIP for cluster-internal only, NodePort for external access via node IPs, LoadBalancer for cloud provider load balancing."
      />
      <div className="form-group">
        <label>
          Service Type
          <HelpTooltip content="ClusterIP: Internal access only. NodePort: External access via node IP and port. LoadBalancer: Cloud load balancer for production." />
        </label>
        <select
          value={service.type}
          onChange={(e) => onTypeChange(e.target.value)}
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
            value={service.ports.http.port}
            onChange={(e) => onPortChange('http', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>
            WS Port
            <HelpTooltip content="WebSocket RPC port. Default: 8546. Enables real-time subscriptions for new blocks, logs, and pending transactions." />
          </label>
          <input
            type="number"
            value={service.ports.ws.port}
            onChange={(e) => onPortChange('ws', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>
            Metrics Port
            <HelpTooltip content="Prometheus metrics endpoint. Default: 6060. Exposes node performance and health metrics for monitoring." />
          </label>
          <input
            type="number"
            value={service.ports.metrics.port}
            onChange={(e) => onPortChange('metrics', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>
            {p2pLabel}
            <HelpTooltip content={p2pTooltip} />
          </label>
          <input
            type="number"
            value={service.ports.p2p.port}
            onChange={(e) => onPortChange('p2p', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
