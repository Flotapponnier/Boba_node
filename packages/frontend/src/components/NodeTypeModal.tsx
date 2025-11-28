import { useState } from 'react';
import '../styles/common.css';
import './NodeTypeModal.css';

interface NodeTypeOption {
  type: string;
  title: string;
  description: string;
  specs: string;
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
    specs: '16 cores | 32GB RAM | 2TB SSD'
  },
  {
    type: 'full',
    title: 'Full Node',
    description: 'Complete node with recent state. Balanced performance.',
    specs: '16 cores | 64GB RAM | 3TB SSD'
  },
  {
    type: 'archive',
    title: 'Archive Node',
    description: 'Full historical data. For historical queries.',
    specs: '32 cores | 128GB RAM | 10TB SSD'
  },
  {
    type: 'validator',
    title: 'Validator Node',
    description: 'Block validation. Requires BNB stake.',
    specs: '16 cores | 64GB RAM | 3TB SSD'
  }
];

const ETH_NODE_TYPES: NodeTypeOption[] = [
  {
    type: 'light',
    title: 'Light Node',
    description: 'Downloads headers only, minimal storage.',
    specs: '2 cores | 4GB RAM | 100GB SSD'
  },
  {
    type: 'full',
    title: 'Full Node',
    description: 'Complete validation, snap sync, recent ~128 blocks state.',
    specs: '8 cores | 16GB RAM | 2TB SSD'
  },
  {
    type: 'archive',
    title: 'Archive Node',
    description: 'Full historical state from genesis (path-based).',
    specs: '16 cores | 64GB RAM | 12-20TB SSD'
  },
  {
    type: 'validator',
    title: 'Validator Node',
    description: 'Staking node with consensus client (requires 32 ETH).',
    specs: '8 cores | 16GB RAM | 2TB SSD'
  }
];

const ARB_NODE_TYPES: NodeTypeOption[] = [
  {
    type: 'full',
    title: 'Full Node',
    description: 'Pruned full node with watchtower mode.',
    specs: '4 cores | 16GB RAM | 2TB NVMe'
  },
  {
    type: 'archive',
    title: 'Archive Node',
    description: 'Complete historical data (Arb One: 9.7TB + 850GB/month).',
    specs: '4 cores | 16GB RAM | 12TB NVMe'
  },
  {
    type: 'validator',
    title: 'Validator Node',
    description: 'Validator with staking (allowlisted for mainnet).',
    specs: '4 cores | 16GB RAM | 3TB NVMe'
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
                <h3>{option.title}</h3>
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
