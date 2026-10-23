import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface LayoutPlot {
  id: number;
  title: string;
  slug: string;
  plot_number: string;
  price: number;
  area_sqft: number;
  status: 'available' | 'reserved' | 'sold';
  layout_x: number;
  layout_y: number;
  layout_w: number;
  layout_d: number;
  project_name: string;
}

export function useLayoutPlots(projectName: string) {
  const [data, setData] = useState<LayoutPlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/properties/layout', { params: projectName ? { projectName } : {} })
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [projectName]);

  return { data, loading };
}

export function useProjectList() {
  const [projects, setProjects] = useState<string[]>([]);
  useEffect(() => {
    api.get('/properties/projects').then((res) => setProjects(res.data.data));
  }, []);
  return projects;
}
