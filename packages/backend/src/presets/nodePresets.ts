export const BSC_BOOTNODES = [
  'enode://f3cfd69f2808ef64c48943f3c610c3bc69ba1d0c4d0b98a7c0f8ae5b3a8d6f1f3b3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f@54.250.247.222:30311',
  'enode://9b0c7d0c1c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c7c@54.250.250.250:30311',
].join(',');

export interface NodePreset {
  nodeType: 'fast' | 'full' | 'archive' | 'validator';
  config: {
    triesVerifyMode: 'local' | 'full' | 'insecure' | 'none';
    gcMode: 'full' | 'archive';
    cache: number;
  };
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
  };
  persistence: {
    size: string;
  };
}

export const NODE_PRESETS: Record<string, NodePreset> = {
  fast: {
    nodeType: 'fast',
    config: {
      triesVerifyMode: 'none',
      gcMode: 'full',
      cache: 16384, // 16GB
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '32Gi',
      },
    },
    persistence: {
      size: '2Ti',
    },
  },
  full: {
    nodeType: 'full',
    config: {
      triesVerifyMode: 'local',
      gcMode: 'full',
      cache: 20480, // 20GB
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '64Gi',
      },
    },
    persistence: {
      size: '3Ti',
    },
  },
  archive: {
    nodeType: 'archive',
    config: {
      triesVerifyMode: 'full',
      gcMode: 'archive',
      cache: 40960, // 40GB
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '128Gi',
      },
    },
    persistence: {
      size: '10Ti',
    },
  },
  validator: {
    nodeType: 'validator',
    config: {
      triesVerifyMode: 'local',
      gcMode: 'full',
      cache: 20480, // 20GB
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '64Gi',
      },
    },
    persistence: {
      size: '3Ti',
    },
  },
};

export const SNAPSHOT_URLS = {
  mainnet: 'https://tf-dex-prod-public-snapshot.s3-accelerate.amazonaws.com/geth-20240101.tar.gz',
  testnet: 'https://tf-dex-prod-public-snapshot-testnet.s3-accelerate.amazonaws.com/geth-20240101.tar.gz',
};
