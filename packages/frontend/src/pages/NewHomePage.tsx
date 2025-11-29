import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import bannerImage from '../assets/boba_node_banner.png';
import bscImage from '../assets/boba_node_bsc.png';
import ethereumImage from '../assets/boba_node_ethereum.png';
import arbitrumImage from '../assets/boba_node_arbitrum.png';
import NodeTypeModal from '../components/NodeTypeModal';
import UnifiedConfigContent from './UnifiedConfigContent';
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
          {chain === 'bsc' && <UnifiedConfigContent chain="bsc" nodeType={nodeType} />}
          {chain === 'ethereum' && <UnifiedConfigContent chain="eth" nodeType={nodeType} />}
          {chain === 'arbitrum' && <UnifiedConfigContent chain="arb" nodeType={nodeType} />}
        </main>

        <footer className="footer">
          <p>
            <a
              href="https://github.com/Flotapponnier/Boba_node"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Open source project to easily get started with blockchain nodes
            </a>
          </p>
        </footer>
      </div>
    );
  }

  // Show node selection (default view)
  return (
    <div className="home-page">
      <header className="header">
        <img src={bannerImage} alt="Boba Node" className="banner" />
        <pre className="ascii-art">{`   ___                          _                             _            _   _                                      _                    _                  _                _          __              _     _            _        _           _                         _
  / _ \\___ _ __   ___ _ __ __ _| |_ ___   _ __  _ __ ___   __| |_   _  ___| |_(_) ___  _ __        _ __ ___  __ _  __| |_   _    /\\  /\\___| |_ __ ___     ___| |__   __ _ _ __| |_ ___   / _| ___  _ __  | |__ | | ___   ___| | _____| |__   __ _(_)_ __    _ __   ___   __| | ___  ___
 / /_\\/ _ \\ '_ \\ / _ \\ '__/ _\` | __/ _ \\ | '_ \\| '__/ _ \\ / _\` | | | |/ __| __| |/ _ \\| '_ \\ _____| '__/ _ \\/ _\` |/ _\` | | | |  / /_/ / _ \\ | '_ \` _ \\   / __| '_ \\ / _\` | '__| __/ __| | |_ / _ \\| '__| | '_ \\| |/ _ \\ / __| |/ / __| '_ \\ / _\` | | '_ \\  | '_ \\ / _ \\ / _\` |/ _ \\/ __|
/ /_\\\\  __/ | | |  __/ | | (_| | ||  __/ | |_) | | | (_) | (_| | |_| | (__| |_| | (_) | | | |_____| | |  __/ (_| | (_| | |_| | / __  /  __/ | | | | | | | (__| | | | (_| | |  | |_\\__ \\ |  _| (_) | |    | |_) | | (_) | (__|   < (__| | | | (_| | | | | | | | | | (_) | (_| |  __/\\__ \\
\\____/\\___|_| |_|\\___|_|  \\__,_|\\__\\___| | .__/|_|  \\___/ \\__,_|\\__,_|\\___|\\__|_|\\___/|_| |_|     |_|  \\___|\\__,_|\\__,_|\\__, | \\/ /_/ \\___|_|_| |_| |_|  \\___|_| |_|\\__,_|_|   \\__|___/ |_|  \\___/|_|    |_.__/|_|\\___/ \\___|_|\\_\\___|_| |_|\\__,_|_|_| |_| |_| |_|\\___/ \\__,_|\\___||___/
                                         |_|                                                                            |___|                                                                                                                                                           `}</pre>
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
        <p>
          <a
            href="https://github.com/Flotapponnier/Boba_node"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Open source project to easily get started with blockchain nodes
          </a>
        </p>
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
