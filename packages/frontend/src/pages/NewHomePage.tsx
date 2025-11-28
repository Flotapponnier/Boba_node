import { useState } from 'react';
import bannerImage from '../assets/boba_node_banner.png';
import bscImage from '../assets/boba_node_bsc.png';
import ethereumImage from '../assets/boba_node_ethereum.png';
import arbitrumImage from '../assets/boba_node_arbitrum.png';
import NodeTypeModal from '../components/NodeTypeModal';
import BscConfigContent from './BscConfigContent';
import EthConfigContent from './EthConfigContent';
import './HomePage.css';

interface NodeCard {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
}

const nodes: NodeCard[] = [
  {
    id: 'bsc',
    name: 'BSC Node',
    description: 'Binance Smart Chain Fast Node - Optimized for real-time log streaming',
    image: bscImage,
    available: true,
  },
  {
    id: 'ethereum',
    name: 'Ethereum Node',
    description: 'Ethereum Geth Node - Optimized for mainnet deployment',
    image: ethereumImage,
    available: true,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum Node',
    description: 'Arbitrum Layer 2 Node - Coming soon',
    image: arbitrumImage,
    available: false,
  },
];

export default function NewHomePage() {
  const [selectedChain, setSelectedChain] = useState<'bsc' | 'ethereum' | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleNodeClick = (node: NodeCard) => {
    if (node.available) {
      setSelectedChain(node.id as 'bsc' | 'ethereum');
      setShowModal(true);
    }
  };

  const handleNodeTypeSelect = (nodeType: string) => {
    setSelectedNodeType(nodeType);
    setShowModal(false);
  };

  const handleBack = () => {
    setSelectedChain(null);
    setSelectedNodeType(null);
  };

  // Show configuration page if chain and node type are selected
  if (selectedChain && selectedNodeType) {
    return (
      <div className="home-page">
        <header className="header">
          <img src={bannerImage} alt="Boba Node" className="banner" />
          <button className="back-button-header" onClick={handleBack}>
            ← Back to Node Selection
          </button>
        </header>

        <main className="main-content">
          {selectedChain === 'bsc' && <BscConfigContent nodeType={selectedNodeType} />}
          {selectedChain === 'ethereum' && <EthConfigContent nodeType={selectedNodeType} />}
        </main>

        <footer className="footer">
          <p>Open source project - MIT License</p>
          <p>Built with React + TypeScript + Express</p>
        </footer>
      </div>
    );
  }

  // Show node selection (default view)
  return (
    <div className="home-page">
      <header className="header">
        <img src={bannerImage} alt="Boba Node" className="banner" />
        <p className="subtitle">
          Generate production-ready Helm charts for blockchain nodes
        </p>
      </header>

      <main className="main-content">
        <h2>Select a Node Type</h2>
        <div className="nodes-grid">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`node-card ${!node.available ? 'disabled' : ''}`}
              onClick={() => handleNodeClick(node)}
            >
              {node.image && (
                <div className="node-image">
                  <img src={node.image} alt={node.name} />
                </div>
              )}
              <div className="node-content">
                <h3>{node.name}</h3>
                <p>{node.description}</p>
                {!node.available && (
                  <span className="coming-soon-badge">Coming Soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>Open source project - MIT License</p>
        <p>Built with React + TypeScript + Express</p>
      </footer>

      {selectedChain && (
        <NodeTypeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={handleNodeTypeSelect}
          chain={selectedChain}
        />
      )}
    </div>
  );
}
