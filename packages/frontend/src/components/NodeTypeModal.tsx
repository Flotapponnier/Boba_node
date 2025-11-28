import { useState } from 'react';
import HelpTooltip from './HelpTooltip';
import '../styles/common.css';
import './NodeTypeModal.css';

interface NodeTypeOption {
  type: string;
  title: string;
  description: string;
  specs: string;
  tooltip: string;
}

interface NodeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nodeType: string) => void;
  chain: 'bsc' | 'eth' | 'ethereum' | 'arbitrum';
}

const BSC_NODE_TYPES: NodeTypeOption[] = [
  {
    type: 'fast',
    title: 'Fast Node',
    description: 'High performance RPC node. Best for serving requests.',
    specs: '16 cores | 32GB RAM | 2TB SSD',
    tooltip: 'Optimized for high-throughput RPC services with minimal state verification. Perfect for DeFi apps, DEXs, and trading bots needing fast query responses. Lower resource overhead than full validation.'
  },
  {
    type: 'full',
    title: 'Full Node',
    description: 'Complete node with recent state. Balanced performance.',
    specs: '16 cores | 64GB RAM | 3TB SSD',
    tooltip: 'Validates all transactions with full state verification. Recommended for most production use cases requiring reliable RPC, smart contract deployment, and maintaining network security.'
  },
  {
    type: 'archive',
    title: 'Archive Node',
    description: 'Full historical data. For historical queries.',
    specs: '32 cores | 128GB RAM | 10TB SSD',
    tooltip: 'Stores complete blockchain history from genesis. Essential for block explorers, analytics platforms, auditing tools, and apps requiring historical state queries at any block height.'
  },
  {
    type: 'validator',
    title: 'Validator Node',
    description: 'Block validation. Requires BNB stake.',
    specs: '16 cores | 64GB RAM | 3TB SSD',
    tooltip: 'Participates in BSC consensus and block production. Requires BNB stake and high availability infrastructure. Earns block rewards and transaction fees for securing the network.'
  }
];

const ETH_NODE_TYPES: NodeTypeOption[] = [
  {
    type: 'light',
    title: 'Light Node',
    description: 'Downloads headers only, minimal storage.',
    specs: '2 cores | 4GB RAM | 100GB SSD',
    tooltip: 'Minimal resource requirements with header-only sync. Suitable for lightweight applications, mobile wallets, and development environments requiring basic blockchain interaction without full validation.'
  },
  {
    type: 'full',
    title: 'Full Node',
    description: 'Complete validation, snap sync, recent ~128 blocks state.',
    specs: '8 cores | 16GB RAM | 2TB SSD',
    tooltip: 'Validates all blocks with snap sync and recent state retention. Recommended for most applications: RPC providers, dApp backends, smart contract deployment, and transaction broadcasting.'
  },
  {
    type: 'archive',
    title: 'Archive Node',
    description: 'Full historical state from genesis (path-based).',
    specs: '16 cores | 64GB RAM | 12-20TB SSD',
    tooltip: 'Maintains complete historical state from genesis block. Essential for block explorers (Etherscan), analytics platforms, DeFi protocols requiring historical data, and forensic analysis.'
  },
  {
    type: 'validator',
    title: 'Validator Node',
    description: 'Staking node with consensus client (requires 32 ETH).',
    specs: '8 cores | 16GB RAM | 2TB SSD',
    tooltip: 'Participates in Ethereum Proof-of-Stake consensus. Requires 32 ETH stake, consensus client (Prysm/Lighthouse/etc), and 99.9% uptime. Earns staking rewards and transaction fees.'
  }
];

const ARB_NODE_TYPES: NodeTypeOption[] = [
  {
    type: 'full',
    title: 'Full Node',
    description: 'Pruned full node with watchtower mode.',
    specs: '4 cores | 16GB RAM | 2TB NVMe',
    tooltip: 'L2 node with pruned state running in watchtower mode. Validates rollup state against L1 and provides RPC access. Ideal for dApp backends, L2 infrastructure, and cost-effective Ethereum applications.'
  },
  {
    type: 'archive',
    title: 'Archive Node',
    description: 'Complete historical data (Arb One: 9.7TB + 850GB/month).',
    specs: '4 cores | 16GB RAM | 12TB NVMe',
    tooltip: 'Complete L2 historical state from genesis. Required for L2 block explorers (Arbiscan), analytics platforms, DeFi protocols needing historical queries, and forensic analysis of Arbitrum transactions.'
  },
  {
    type: 'validator',
    title: 'Validator Node',
    description: 'Validator with staking (allowlisted for mainnet).',
    specs: '4 cores | 16GB RAM | 3TB NVMe',
    tooltip: 'Verifies L2 state correctness and can post fraud proofs to L1. Watchtower mode monitors for invalid states. Active validation requires allowlisting on mainnet. Essential for network security.'
  }
];

export default function NodeTypeModal({ isOpen, onClose, onSelect, chain }: NodeTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');

  let nodeTypes = BSC_NODE_TYPES;
  if (chain === 'ethereum' || chain === 'eth') {
    nodeTypes = ETH_NODE_TYPES;
  } else if (chain === 'arbitrum') {
    nodeTypes = ARB_NODE_TYPES;
  }

  const displayChain = chain === 'ethereum' ? 'ETH' : chain === 'arbitrum' ? 'ARBITRUM' : chain.toUpperCase();

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Select Node Type</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
          <p className="modal-subtitle">
            Choose the type of {displayChain} node you want to deploy
          </p>

          <div className="node-type-selector">
            {nodeTypes.map((option) => (
              <div
                key={option.type}
                className={`node-type-card ${selectedType === option.type ? 'selected' : ''}`}
                onClick={() => setSelectedType(option.type)}
              >
                <h3>
                  {option.title}
                  <HelpTooltip content={option.tooltip} />
                </h3>
                <p>{option.description}</p>
                <div className="node-type-specs">
                  <small>{option.specs}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button-primary"
            onClick={handleSelect}
            disabled={!selectedType}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
