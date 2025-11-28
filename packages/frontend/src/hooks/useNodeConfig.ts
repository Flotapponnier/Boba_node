import { useState, useEffect } from 'react';

export type ChainType = 'arb' | 'bsc' | 'eth';

interface UseNodeConfigOptions<T> {
  chainType: ChainType;
  nodeType: string;
  defaultConfig: T;
  createPresetConfig?: (data: T, preset: any, nodeType: string) => T;
}

export function useNodeConfig<T>({
  chainType,
  nodeType,
  defaultConfig,
  createPresetConfig,
}: UseNodeConfigOptions<T>) {
  const [config, setConfig] = useState<T>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generating, setGenerating] = useState(false);

  // Load default config and preset from backend
  useEffect(() => {
    fetch(`/api/defaults/${chainType}`)
      .then(res => res.json())
      .then(async (data) => {
        setConfig(data);

        // Load preset based on nodeType prop
        if (nodeType) {
          try {
            const presetResponse = await fetch(`/api/presets/${chainType}/${nodeType}`);
            const preset = await presetResponse.json();

            if (createPresetConfig) {
              setConfig(prev => createPresetConfig(prev, preset, nodeType));
            } else {
              // Default preset merging logic
              setConfig(prev => ({
                ...prev,
                nodeType: nodeType as any,
                deploymentName: `${chainType}-${nodeType}`,
                nodeName: `${chainType}-${nodeType}-node`,
                namespace: `${chainType}-${nodeType}`,
                config: { ...(prev as any).config, ...preset.config },
                resources: preset.resources,
                persistence: { ...(prev as any).persistence, ...preset.persistence },
              }));
            }
          } catch (err) {
            console.error('Failed to load preset:', err);
          }
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load defaults:', err);
        setError('Failed to load configuration');
        setLoading(false);
      });
  }, [nodeType, chainType]);

  const handleGenerate = async (downloadFileName: string) => {
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/generate/${chainType}`, {
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
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Helm chart generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate chart');
    } finally {
      setGenerating(false);
    }
  };

  return {
    config,
    setConfig,
    loading,
    error,
    success,
    generating,
    handleGenerate,
    setError,
    setSuccess,
  };
}
