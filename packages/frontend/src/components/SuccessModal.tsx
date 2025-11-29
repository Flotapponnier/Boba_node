import bobaTrophy from '../assets/boba_trophy.png';
import './SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  deploymentName: string;
  chain: string;
}

export default function SuccessModal({ isOpen, onClose, deploymentName, chain }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="success-modal-close" onClick={onClose}>&times;</button>

        <div className="success-modal-body">
          <img src={bobaTrophy} alt="Success" className="success-trophy" />

          <h2>Helm Chart Ready</h2>

          <p className="success-filename">{chain}-node-{deploymentName}.tgz</p>

          <div className="deployment-steps">
            <h3>Deployment Steps</h3>
            <ol>
              <li>Extract the chart:
                <code>tar -xzf {chain}-node-{deploymentName}.tgz</code>
              </li>
              <li>Deploy to Kubernetes:
                <code>helm install {deploymentName} ./{chain}-node -f {chain}-node/{deploymentName}/values-{deploymentName}.yaml</code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
