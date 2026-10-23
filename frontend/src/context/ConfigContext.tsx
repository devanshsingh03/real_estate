import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';

interface SiteConfig {
  brandName: string;
  whatsappNumber: string;
  contactEmail: string;
}

const defaultConfig: SiteConfig = {
  brandName: 'Real Estate Bros',
  whatsappNumber: '',
  contactEmail: '',
};

const ConfigContext = createContext<SiteConfig>(defaultConfig);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);

  useEffect(() => {
    api
      .get('/config')
      .then((res) => setConfig(res.data.data))
      .catch(() => {});
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  return useContext(ConfigContext);
}
