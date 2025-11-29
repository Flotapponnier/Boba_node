import { ChainConfig } from '../../config/chainConfig';
import HelpTooltip from '../HelpTooltip';
import SectionHeader from '../SectionHeader';

interface ServiceConfigSectionProps {
  config: any;
  onChange: (path: string, value: any) => void;
  chainConfig: ChainConfig;
}

export default function ServiceConfigSection({ config, onChange, chainConfig }: ServiceConfigSectionProps) {
  const getPortTooltip = (portType: keyof typeof chainConfig.defaultPorts): string => {
    const tooltips: Record<string, Record<string, string>> = {
      http: {
        default: 'HTTP JSON-RPC API port. Used for RPC calls, contract interactions, and transaction broadcasting.',
        bsc: `HTTP JSON-RPC API port. Default: ${chainConfig.defaultPorts.http}. Used for eth_call, eth_sendTransaction, etc.`,
        eth: `HTTP JSON-RPC API port. Default: ${chainConfig.defaultPorts.http}. Used for eth_call, eth_sendTransaction, and other RPC methods.`,
        arb: `HTTP JSON-RPC API port. Default: ${chainConfig.defaultPorts.http}. Used for L2 RPC calls, contract interactions, and transaction broadcasting.`,
      },
      ws: {
        default: 'WebSocket RPC port. Enables real-time subscriptions for new blocks, logs, and transactions.',
        bsc: `WebSocket RPC port. Default: ${chainConfig.defaultPorts.ws}. Enables real-time subscriptions for new blocks, logs, etc.`,
        eth: `WebSocket RPC port. Default: ${chainConfig.defaultPorts.ws}. Enables real-time subscriptions for new blocks, logs, and pending transactions.`,
        arb: `WebSocket RPC port. Default: ${chainConfig.defaultPorts.ws}. Enables real-time L2 event subscriptions for blocks, logs, and transactions.`,
      },
      metrics: {
        default: 'pprof debugging endpoint. Exposes Go profiling data (CPU, memory, goroutines) at /debug/pprof/ for performance analysis.',
        bsc: `pprof debugging endpoint. Default: ${chainConfig.defaultPorts.metrics}. Exposes Go profiling data at /debug/pprof/.`,
        eth: `pprof debugging endpoint. Default: ${chainConfig.defaultPorts.metrics}. Exposes Go profiling data at /debug/pprof/.`,
        arb: `pprof debugging endpoint. Default: ${chainConfig.defaultPorts.metrics}. Exposes Go profiling data at /debug/pprof/.`,
      },
      p2p: {
        default: 'Peer-to-peer network port for node discovery and blockchain synchronization.',
        bsc: `Peer-to-peer network port. Default: ${chainConfig.defaultPorts.p2p}. Used for node discovery and blockchain synchronization.`,
        eth: `Peer-to-peer network port. Default: ${chainConfig.defaultPorts.p2p}. Used for node discovery and blockchain synchronization with other Ethereum nodes.`,
        arb: `Sequencer feed WebSocket port. Default: ${chainConfig.defaultPorts.p2p}. Receives real-time L2 transaction data from Arbitrum sequencer for faster sync.`,
      },
    };

    const chainKey = chainConfig.name.toLowerCase();
    return tooltips[portType]?.[chainKey] || tooltips[portType]?.default || '';
  };

  return (
    <div className="config-section">
      <SectionHeader
        title="Service Configuration"
        tooltip={chainConfig.tooltips.serviceConfig}
      />
      <div className="form-group">
        <label>
          Service Type
          <HelpTooltip content="ClusterIP: Internal access only. NodePort: External access via node IP and port. LoadBalancer: Cloud load balancer for production." />
        </label>
        <select
          value={config?.service?.type || 'ClusterIP'}
          onChange={(e) => onChange('service.type', e.target.value)}
        >
          <option value="ClusterIP">ClusterIP</option>
          <option value="NodePort">NodePort</option>
          <option value="LoadBalancer">LoadBalancer</option>
        </select>
      </div>

      <div className="form-grid four-columns">
        <div className="form-group">
          <label>
            {chainConfig.portLabels.http}
            <HelpTooltip content={getPortTooltip('http')} />
          </label>
          <input
            type="number"
            value={config?.service?.ports?.http?.port || chainConfig.defaultPorts.http}
            onChange={(e) => onChange('service.ports.http.port', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>
            {chainConfig.portLabels.ws}
            <HelpTooltip content={getPortTooltip('ws')} />
          </label>
          <input
            type="number"
            value={config?.service?.ports?.ws?.port || chainConfig.defaultPorts.ws}
            onChange={(e) => onChange('service.ports.ws.port', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>
            {chainConfig.portLabels.metrics}
            <HelpTooltip content={getPortTooltip('metrics')} />
          </label>
          <input
            type="number"
            value={config?.service?.ports?.metrics?.port || chainConfig.defaultPorts.metrics}
            onChange={(e) => onChange('service.ports.metrics.port', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>
            {chainConfig.portLabels.p2p}
            <HelpTooltip content={getPortTooltip('p2p')} />
          </label>
          <input
            type="number"
            value={config?.service?.ports?.p2p?.port || chainConfig.defaultPorts.p2p}
            onChange={(e) => onChange('service.ports.p2p.port', Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
