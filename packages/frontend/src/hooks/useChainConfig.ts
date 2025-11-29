import { useState, useEffect, FormEvent } from 'react';
import { ChainType } from '../config/chainConfig';
import { setNestedValue } from '../components/shared/DynamicField';

export function useChainConfig(chain: ChainType, nodeType: string) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load default config and preset from backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Load defaults for this chain
        const defaultsResponse = await fetch(`/api/defaults/${chain}`);
        const defaultsData = await defaultsResponse.json();
        setConfig(defaultsData);

        // If nodeType is provided, load that preset
        if (nodeType) {
          try {
            const presetResponse = await fetch(`/api/presets/${chain}/${nodeType}`);
            const preset = await presetResponse.json();

            setConfig((prev: any) => prev ? ({
              ...prev,
              nodeType: nodeType,
              deploymentName: `${chain}-${nodeType}`,
              nodeName: `${chain}-${nodeType}-node`,
              namespace: `${chain}-${nodeType}`,
              config: { ...prev.config, ...preset.config },
              resources: preset.resources,
              persistence: preset.persistence ? { ...prev.persistence, ...preset.persistence } : prev.persistence,
            }) : prev);
          } catch (err) {
            console.error('Failed to load preset:', err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load defaults:', err);
        setError('Failed to load configuration');
        setLoading(false);
      }
    };

    loadConfig();
  }, [chain, nodeType]);

  // Handle nested path updates
  const handleChange = (path: string, value: any) => {
    if (!config) return;

    const newConfig = setNestedValue(config, path, value);
    setConfig(newConfig);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!config) return;

    if (!config.deploymentName) {
      setError('Deployment name is required');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/generate/${chain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chart');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determine download filename based on chain
      const chainNames: Record<ChainType, string> = {
        bsc: 'bsc',
        eth: 'ethereum',
        arb: 'arbitrum',
      };

      link.setAttribute('download', `${chainNames[chain]}-node-${config.deploymentName}.tgz`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Failed to generate chart:', err);
      setError(err.message || 'Failed to generate chart. Please check your configuration.');
    } finally {
      setGenerating(false);
    }
  };

  return {
    config,
    loading,
    error,
    generating,
    showSuccessModal,
    setShowSuccessModal,
    handleChange,
    handleSubmit,
  };
}
