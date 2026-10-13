import { useCallback, useEffect, useState } from 'react';
import { request } from './api';

export function useRemoteData(path, property) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request(path);
      setData(response[property]);
      setError('');
      return response[property];
    } catch (loadError) {
      setError(loadError.message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, [path, property]);

  useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  return { data, loading, error, refresh };
}
