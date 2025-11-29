export type ChainType = 'bsc' | 'eth' | 'arb';

export interface FieldDefinition {
  key: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  label: string;
  tooltip: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  default?: any;
  min?: number;
  max?: number;
  section?: 'basic' | 'node' | 'txpool';
  gridColumns?: 1 | 2 | 3 | 4;
}

export interface ChainConfig {
  name: string;
  fullName: string;
  apiEndpoint: string;

  // Default values
  defaultImage: {
    repository: string;
    tag: string;
  };

  defaultPorts: {
    http: number;
    ws: number;
    metrics: number;
    p2p: number;
  };

  portLabels: {
    http: string;
    ws: string;
    metrics: string;
    p2p: string;
  };

  nodeTypes: string[];

  // Basic config extra fields (beyond deploymentName, nodeName, namespace)
  basicConfigFields?: FieldDefinition[];

  // Node configuration fields
  nodeConfigFields: FieldDefinition[];

  // Tooltips
  tooltips: {
    basicConfig: string;
    imageConfig: string;
    serviceConfig: string;
    nodeConfig: string;
  };
}

export const CHAIN_CONFIGS: Record<ChainType, ChainConfig> = {
  bsc: {
    name: 'BSC',
    fullName: 'BNB Smart Chain',
    apiEndpoint: 'bsc',

    defaultImage: {
      repository: 'ghcr.io/bnb-chain/bsc',
      tag: 'v1.4.17',
    },

    defaultPorts: {
      http: 8545,
      ws: 8546,
      metrics: 6060,
      p2p: 30311,
    },

    portLabels: {
      http: 'HTTP Port',
      ws: 'WebSocket Port',
      metrics: 'Metrics Port',
      p2p: 'P2P Port',
    },

    nodeTypes: ['fast', 'full', 'archive', 'validator'],

    nodeConfigFields: [
      {
        key: 'config.cache',
        type: 'number',
        label: 'Cache Size (MB)',
        tooltip: 'Memory allocated for state caching. Higher values improve performance but require more RAM. Recommended: 10000-16384MB depending on available memory.',
        default: 40960,
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.syncMode',
        type: 'select',
        label: 'Sync Mode',
        tooltip: 'Snap: Fast sync with state snapshots (recommended). Full: Downloads entire blockchain. Light: Minimal storage, downloads headers only.',
        options: [
          { value: 'snap', label: 'Snap' },
          { value: 'full', label: 'Full' },
          { value: 'light', label: 'Light' },
        ],
        default: 'snap',
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.verbosity',
        type: 'number',
        label: 'Verbosity (0-5)',
        tooltip: 'Logging level. 0: Silent, 1: Error, 2: Warn, 3: Info (recommended), 4: Debug, 5: Trace. Higher values produce more logs.',
        min: 0,
        max: 5,
        default: 3,
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.httpApi',
        type: 'text',
        label: 'HTTP API',
        tooltip: 'Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3, txpool, parlia. More APIs = more attack surface.',
        placeholder: 'eth,net,web3,txpool,parlia',
        default: 'eth,net,web3,txpool,parlia',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.wsApi',
        type: 'text',
        label: 'WebSocket API',
        tooltip: 'Comma-separated list of RPC APIs available over WebSocket. WebSocket enables real-time event subscriptions. Common: eth, net, web3.',
        placeholder: 'eth,net,web3',
        default: 'eth,net,web3',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.txpool.globalslots',
        type: 'number',
        label: 'Global Slots',
        tooltip: 'Maximum number of executable transaction slots for all accounts. Higher values allow more pending transactions but use more memory.',
        default: 20000,
        section: 'txpool',
        gridColumns: 2,
      },
      {
        key: 'config.txpool.globalqueue',
        type: 'number',
        label: 'Global Queue',
        tooltip: 'Maximum number of non-executable transaction slots for all accounts. Queued transactions wait for nonce gaps to be filled.',
        default: 10000,
        section: 'txpool',
        gridColumns: 2,
      },
    ],

    tooltips: {
      basicConfig: 'Essential identifiers for your BSC node deployment. These values determine how your node is named and organized in your Kubernetes cluster.',
      imageConfig: 'Docker container image settings for the BSC node. Uses the official BNB Chain image from GitHub Container Registry. Always verify the latest stable version before deploying to production.',
      serviceConfig: 'Kubernetes Service configuration for network access. Service type determines how your node is exposed: ClusterIP for internal-only access, NodePort for external access via specific node ports, or LoadBalancer for cloud-managed load balancing.',
      nodeConfig: 'Core BSC node parameters controlling sync behavior, caching, logging, and API exposure. These settings directly impact node performance, resource usage, and security. Snap sync mode is recommended for faster initial synchronization.',
    },
  },

  eth: {
    name: 'Ethereum',
    fullName: 'Ethereum',
    apiEndpoint: 'eth',

    defaultImage: {
      repository: 'ethereum/client-go',
      tag: 'v1.13.0',
    },

    defaultPorts: {
      http: 8545,
      ws: 8546,
      metrics: 6060,
      p2p: 30303,
    },

    portLabels: {
      http: 'HTTP Port',
      ws: 'WS Port',
      metrics: 'Metrics Port',
      p2p: 'P2P Port',
    },

    nodeTypes: ['full', 'archive', 'validator'],

    basicConfigFields: [
      {
        key: 'config.networkId',
        type: 'number',
        label: 'Network ID',
        tooltip: 'Ethereum network identifier. 1: Mainnet, 11155111: Sepolia testnet, 17000: Holesky testnet.',
        default: 1,
        section: 'basic',
        gridColumns: 2,
      },
    ],

    nodeConfigFields: [
      {
        key: 'config.syncMode',
        type: 'select',
        label: 'Sync Mode',
        tooltip: 'Snap: Fast sync with state snapshots (recommended). Full: Downloads entire blockchain. Light: Minimal storage, downloads headers only.',
        options: [
          { value: 'snap', label: 'Snap' },
          { value: 'full', label: 'Full' },
          { value: 'light', label: 'Light' },
        ],
        default: 'snap',
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.gcMode',
        type: 'select',
        label: 'GC Mode',
        tooltip: 'Garbage collection mode. Full: Prunes old state (recommended for most nodes). Archive: Keeps all historical state.',
        options: [
          { value: 'full', label: 'Full' },
          { value: 'archive', label: 'Archive' },
        ],
        default: 'full',
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.stateScheme',
        type: 'select',
        label: 'State Scheme',
        tooltip: 'State storage format. Path: Modern, efficient scheme with better performance (recommended). Hash: Legacy scheme, larger disk footprint.',
        options: [
          { value: 'path', label: 'Path (Recommended)' },
          { value: 'hash', label: 'Hash' },
        ],
        default: 'path',
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.cache',
        type: 'number',
        label: 'Cache (MB)',
        tooltip: 'Memory allocated for state caching. Higher values improve performance but require more RAM. Recommended: 4096-8192MB depending on node type.',
        default: 4096,
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.verbosity',
        type: 'number',
        label: 'Verbosity (0-5)',
        tooltip: 'Logging level. 0: Silent, 1: Error, 2: Warn, 3: Info (recommended), 4: Debug, 5: Trace. Higher values produce more logs.',
        min: 0,
        max: 5,
        default: 3,
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.historyState',
        type: 'number',
        label: 'History State',
        tooltip: 'Number of recent blocks to keep state for historical queries. Default: 90000 (~12 days). Set to 0 for archive nodes.',
        default: 90000,
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.httpApi',
        type: 'text',
        label: 'HTTP API',
        tooltip: 'Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3. More APIs = more attack surface, limit in production.',
        placeholder: 'eth,net,web3',
        default: 'eth,net,web3',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.wsApi',
        type: 'text',
        label: 'WebSocket API',
        tooltip: 'Comma-separated list of RPC APIs available over WebSocket. WebSocket enables real-time event subscriptions. Common: eth, net, web3.',
        placeholder: 'eth,net,web3',
        default: 'eth,net,web3',
        section: 'node',
        gridColumns: 2,
      },
    ],

    tooltips: {
      basicConfig: 'Core identifiers for your Ethereum node deployment. These settings define how your node is named and organized within your Kubernetes cluster infrastructure.',
      imageConfig: 'Docker container image configuration for Geth (Go Ethereum). Uses the official ethereum/client-go image. Geth is the most widely used Ethereum execution client. Always verify the latest stable version before production deployment.',
      serviceConfig: 'Kubernetes Service settings controlling network access to your Ethereum node. Service type determines exposure: ClusterIP for cluster-internal only, NodePort for external access via node IPs, LoadBalancer for cloud provider load balancing.',
      nodeConfig: 'Core Geth parameters controlling synchronization, state management, caching, and API exposure. Sync mode affects initial sync speed. Path-based state scheme (recommended) offers better performance and smaller disk footprint than hash-based. These settings significantly impact performance and resource usage.',
    },
  },

  arb: {
    name: 'Arbitrum',
    fullName: 'Arbitrum Nitro',
    apiEndpoint: 'arb',

    defaultImage: {
      repository: 'offchainlabs/nitro-node',
      tag: 'v3.2.1',
    },

    defaultPorts: {
      http: 8547,
      ws: 8548,
      metrics: 6070,
      p2p: 9642,
    },

    portLabels: {
      http: 'HTTP Port',
      ws: 'WS Port',
      metrics: 'Metrics Port',
      p2p: 'Sequencer Feed Port',
    },

    nodeTypes: ['full', 'archive', 'validator'],

    basicConfigFields: [
      {
        key: 'config.chainName',
        type: 'select',
        label: 'Chain',
        tooltip: 'Arbitrum chain to connect to. Arb One: Main L2 network. Nova: Low-cost chain for gaming/social. Sepolia: Testnet for development.',
        options: [
          { value: 'arb1', label: 'Arbitrum One (Mainnet)' },
          { value: 'nova', label: 'Arbitrum Nova' },
          { value: 'sepolia', label: 'Arbitrum Sepolia (Testnet)' },
        ],
        default: 'arb1',
        section: 'basic',
        gridColumns: 2,
      },
    ],

    nodeConfigFields: [
      {
        key: 'config.parentChainUrl',
        type: 'text',
        label: 'Parent Chain URL (L1 Ethereum RPC)',
        tooltip: 'Ethereum L1 RPC endpoint URL. Required for state verification and batch reading. Use archive node for validators, full node sufficient for watchtower.',
        placeholder: 'https://ethereum-rpc.publicnode.com',
        default: '',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.pruneMode',
        type: 'select',
        label: 'Prune Mode',
        tooltip: 'State retention policy. Full: Recent state only (recommended). Validator: Optimized for validation. Archive: Complete historical state.',
        options: [
          { value: 'full', label: 'Full' },
          { value: 'validator', label: 'Validator' },
          { value: 'archive', label: 'Archive' },
        ],
        default: 'full',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.httpApi',
        type: 'text',
        label: 'HTTP API',
        tooltip: 'Comma-separated list of RPC APIs available over HTTP. Common: eth, net, web3, arb. Limit exposed APIs in production for security.',
        placeholder: 'eth,net,web3,arb',
        default: 'eth,net,web3,arb',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.wsApi',
        type: 'text',
        label: 'WebSocket API',
        tooltip: 'Comma-separated list of RPC APIs available over WebSocket. Enables real-time L2 event subscriptions. Common: eth, net, web3, arb.',
        placeholder: 'eth,net,web3,arb',
        default: 'eth,net,web3,arb',
        section: 'node',
        gridColumns: 2,
      },
      {
        key: 'config.p2pMaxPeers',
        type: 'number',
        label: 'Max Peers',
        tooltip: 'Maximum number of P2P network peers. Higher values improve network connectivity but increase bandwidth usage. Default: 50.',
        default: 50,
        section: 'node',
        gridColumns: 3,
      },
      {
        key: 'config.logLevel',
        type: 'select',
        label: 'Log Level',
        tooltip: 'Logging verbosity. Info: Standard production logging. Debug/Trace: Detailed troubleshooting. Warn/Error: Minimal logging for production.',
        options: [
          { value: 'trace', label: 'Trace' },
          { value: 'debug', label: 'Debug' },
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warn' },
          { value: 'error', label: 'Error' },
        ],
        default: 'info',
        section: 'node',
        gridColumns: 3,
      },
    ],

    tooltips: {
      basicConfig: 'Essential deployment identifiers for your Arbitrum Nitro node. These settings determine how your Layer 2 node is identified and organized in your Kubernetes environment.',
      imageConfig: 'Docker image settings for Arbitrum Nitro node. Official images from offchainlabs/nitro-node. Nitro is Arbitrum\'s optimistic rollup technology. Note: v3.8.0+ changes database schema and cannot be downgraded.',
      serviceConfig: 'Kubernetes Service configuration for network access to your Arbitrum node. Controls how the node is exposed to clients and peers. Includes standard RPC/WS ports plus sequencer feed port for L2 transaction streaming.',
      nodeConfig: 'Arbitrum Nitro-specific parameters. Parent Chain URL connects to Ethereum L1 for state verification. Prune mode determines state retention: \'full\' for recent states, \'archive\' for complete history. Single-core performance is critical for Nitro nodes.',
    },
  },
};
