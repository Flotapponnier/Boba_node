import { ChainType, CHAIN_CONFIGS } from '../config/chainConfig';
import { useChainConfig } from '../hooks/useChainConfig';
import { getDocUrl, getNodeDescription } from '../utils/nodeTypeHelpers';
import SuccessModal from '../components/SuccessModal';
import BasicConfigSection from '../components/shared/BasicConfigSection';
import ImageConfigSection from '../components/shared/ImageConfigSection';
import ServiceConfigSection from '../components/shared/ServiceConfigSection';
import NodeConfigSection from '../components/shared/NodeConfigSection';
import BscResourcesSection from '../components/sections/bsc/ResourcesSection';
import BscPersistenceSection from '../components/sections/bsc/PersistenceSection';
import BscSnapshotSection from '../components/sections/bsc/SnapshotSection';
import BscMonitoringSection from '../components/sections/bsc/MonitoringSection';
import EthResourcesSection from '../components/sections/eth/ResourcesSection';
import EthPersistenceSection from '../components/sections/eth/PersistenceSection';
import EthSnapshotSection from '../components/sections/eth/SnapshotSection';
import EthMonitoringSection from '../components/sections/eth/MonitoringSection';
import EthValidatorSection from '../components/sections/eth/ValidatorSection';
import ArbResourcesSection from '../components/sections/arb/ResourcesSection';
import ArbPersistenceSection from '../components/sections/arb/PersistenceSection';
import ArbSnapshotSection from '../components/sections/arb/SnapshotSection';
import ArbMonitoringSection from '../components/sections/arb/MonitoringSection';
import ArbValidatorSection from '../components/sections/arb/ValidatorSection';
import '../styles/common.css';

interface UnifiedConfigContentProps {
  chain: ChainType;
  nodeType: string;
}

export default function UnifiedConfigContent({ chain, nodeType }: UnifiedConfigContentProps) {
  const chainConfig = CHAIN_CONFIGS[chain];
  const {
    config,
    loading,
    error,
    generating,
    showSuccessModal,
    setShowSuccessModal,
    handleChange,
    handleSubmit,
  } = useChainConfig(chain, nodeType);

  if (loading || !config) {
    return (
      <div className="config-page-container">
        <div className="loading">Loading configuration...</div>
      </div>
    );
  }

  // Get chain display name for modal
  const chainDisplayNames: Record<ChainType, string> = {
    bsc: 'bsc',
    eth: 'ethereum',
    arb: 'arbitrum',
  };

  return (
    <div className="config-page-container">
      {/* Page Header */}
      <div className="config-page-header">
        <h1>
          {chainConfig.fullName} {config.nodeType.charAt(0).toUpperCase() + config.nodeType.slice(1)} Node Configuration
        </h1>
        <p>{getNodeDescription(chain, config.nodeType)}</p>
        <div className="doc-link-container">
          <a
            href={getDocUrl(chain, config.nodeType)}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-link"
          >
            Official {chainConfig.fullName} {config.nodeType === 'validator' ? 'Validator' : 'Node'} Documentation
          </a>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && <div className="error-message">{error}</div>}

      {/* Configuration Form */}
      <form onSubmit={handleSubmit}>
        {/* Shared Sections - Powered by metadata */}
        <BasicConfigSection
          config={config}
          onChange={handleChange}
          chainConfig={chainConfig}
        />

        <ImageConfigSection
          config={config}
          onChange={handleChange}
          chainConfig={chainConfig}
        />

        <ServiceConfigSection
          config={config}
          onChange={handleChange}
          chainConfig={chainConfig}
        />

        <NodeConfigSection
          config={config}
          onChange={handleChange}
          chainConfig={chainConfig}
        />

        {/* Chain-specific sections */}
        {chain === 'bsc' && (
          <>
            <BscResourcesSection
              resources={config.resources}
              nodeType={config.nodeType}
              onChange={handleChange}
            />
            <BscPersistenceSection
              persistence={config.persistence}
              nodeType={config.nodeType}
              onChange={handleChange}
            />
            <BscSnapshotSection
              snapshot={config.snapshot}
              onChange={handleChange}
            />
            <BscMonitoringSection
              monitoring={config.monitoring}
              onChange={handleChange}
            />
          </>
        )}

        {chain === 'eth' && (
          <>
            <EthResourcesSection
              resources={config.resources}
              nodeType={config.nodeType}
              onChange={handleChange}
            />
            <EthPersistenceSection
              persistence={config.persistence}
              nodeType={config.nodeType}
              onChange={handleChange}
            />
            <EthSnapshotSection
              snapshot={config.snapshot}
              onChange={handleChange}
            />
            <EthMonitoringSection
              monitoring={config.monitoring}
              onChange={handleChange}
            />
            {config.nodeType === 'validator' && (
              <EthValidatorSection
                validator={config.validator}
                onChange={handleChange}
              />
            )}
          </>
        )}

        {chain === 'arb' && (
          <>
            <ArbResourcesSection
              resources={config.resources}
              nodeType={config.nodeType}
              onChange={handleChange}
            />
            <ArbPersistenceSection
              persistence={config.persistence}
              nodeType={config.nodeType}
              onChange={handleChange}
            />
            <ArbSnapshotSection
              snapshot={config.snapshot}
              onChange={handleChange}
            />
            <ArbMonitoringSection
              monitoring={config.monitoring}
              onChange={handleChange}
            />
            {config.nodeType === 'validator' && (
              <ArbValidatorSection
                stakerEnable={config.config.stakerEnable}
                stakerStrategy={config.config.stakerStrategy}
                onChange={handleChange}
              />
            )}
          </>
        )}

        {/* Submit Button */}
        <button type="submit" className="button-primary" disabled={generating}>
          {generating ? 'Generating...' : 'Generate Helm Chart'}
        </button>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        deploymentName={config.deploymentName}
        chain={chainDisplayNames[chain]}
      />
    </div>
  );
}
