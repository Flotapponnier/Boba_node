import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import bannerImage from '../assets/boba_node_banner.png';
import bscImage from '../assets/boba_node_bsc.png';
import ethereumImage from '../assets/boba_node_ethereum.png';
import arbitrumImage from '../assets/boba_node_arbitrum.png';
import NodeTypeModal from '../components/NodeTypeModal';
import BscConfigContent from './BscConfigContent';
import EthConfigContent from './EthConfigContent';
import ArbConfigContent from './ArbConfigContent';
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
    description: 'Fast, Full, Archive, Validator',
    image: bscImage,
    available: true,
  },
  {
    id: 'ethereum',
    name: 'Ethereum Node',
    description: 'Light, Full, Archive, Validator',
    image: ethereumImage,
    available: true,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum Node',
    description: 'Full, Archive, Validator',
    image: arbitrumImage,
    available: true,
  },
];

export default function NewHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  const chain = searchParams.get('chain') as 'bsc' | 'ethereum' | 'arbitrum' | null;
  const nodeType = searchParams.get('nodeType');

  // Initialize modal state based on URL
  useEffect(() => {
    if (chain && !nodeType) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [chain, nodeType]);

  const handleNodeClick = (node: NodeCard) => {
    if (node.available) {
      setSearchParams({ chain: node.id });
    }
  };

  const handleNodeTypeSelect = (selectedNodeType: string) => {
    if (chain) {
      setSearchParams({ chain, nodeType: selectedNodeType });
    }
  };

  const handleBack = () => {
    setSearchParams({});
  };

  // Show configuration page if chain and node type are selected
  if (chain && nodeType) {
    return (
      <div className="home-page">
        <header className="header">
          <img src={bannerImage} alt="Boba Node" className="banner" />
          <button className="back-button-header" onClick={handleBack}>
            ← Back to Node Selection
          </button>
        </header>

        <main className="main-content">
          {chain === 'bsc' && <BscConfigContent nodeType={nodeType} />}
          {chain === 'ethereum' && <EthConfigContent nodeType={nodeType} />}
          {chain === 'arbitrum' && <ArbConfigContent nodeType={nodeType} />}
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

      {chain && (
        <NodeTypeModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSearchParams({});
          }}
          onSelect={handleNodeTypeSelect}
          chain={chain}
        />
      )}
    </div>
  );
}
