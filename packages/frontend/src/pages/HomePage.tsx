import { useNavigate } from 'react-router-dom';
import bannerImage from '../assets/boba_node_banner.png';
import bscImage from '../assets/boba_node_bsc.png';
import './HomePage.css';

interface NodeCard {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
  route: string;
}

const nodes: NodeCard[] = [
  {
    id: 'bsc',
    name: 'BSC Node',
    description: 'Binance Smart Chain Fast Node - Optimized for real-time log streaming',
    image: bscImage,
    available: true,
    route: '/bsc',
  },
  {
    id: 'ethereum',
    name: 'Ethereum Node',
    description: 'Ethereum Full Node - Coming soon',
    image: '',
    available: false,
    route: '/ethereum',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum Node',
    description: 'Arbitrum Layer 2 Node - Coming soon',
    image: '',
    available: false,
    route: '/arbitrum',
  },
];

function HomePage() {
  const navigate = useNavigate();

  const handleNodeClick = (node: NodeCard) => {
    if (node.available) {
      navigate(node.route);
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <img src={bannerImage} alt="Boba Node" className="banner" />
        <h1>Boba Node</h1>
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
    </div>
  );
}

export default HomePage;
