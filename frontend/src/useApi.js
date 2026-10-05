import { useCallback, useEffect, useState } from 'react';
import { request } from './api';

export function useApi(path) {
  const [state, setState] = useState({ path, data: null, error: '', loading: true });
  const reload = useCallback(() => {
    setState(current => ({ ...current, path, error: '', loading: true }));
    return request(path).then(data => setState({ path, data, error: '', loading: false }))
      .catch(failure => setState({ path, data: null, error: failure.message, loading: false }));
  }, [path]);
  useEffect(() => {
    let active = true;
    request(path).then(data => { if (active) setState({ path, data, error: '', loading: false }); })
      .catch(failure => { if (active) setState({ path, data: null, error: failure.message, loading: false }); });
    return () => { active = false; };
  }, [path]);
  return { ...(state.path === path ? state : { data: null, error: '', loading: true }), reload };
}
