import { client } from './client';

export const query = doc => {
  const observable = client.watchQuery({ query: doc });
  return {
    subscribe: storeSubscriber => {
      storeSubscriber({
        loading: true,
        data: null,
        error: null,
        refetch: () => {}
      });

      const subscription = observable.subscribe({
        next: ({ loading, data }) => {
          storeSubscriber({
            loading,
            data,
            error: null,
            refetch: () => observable.refetch()
          });
        },
        error: error => {
          storeSubscriber({
            loading: false,
            data: null,
            error,
            refetch: () => observable.refetch()
          });
        }
      });
      return () => subscription.unsubscribe();
    }
  };
};

export const mutation = (doc, variables, update) => {
  const status = {
    current: null
  };

  const getStatus = () => status.current;

  return {
    subscribe: storeSubscriber => {
      const setStatus = newStatus => {
        status.current = newStatus;
        storeSubscriber({ newStatus, mutate: runMutation });
      };

      const runMutation = () => {
        if (getStatus().loading) return;
        setStatus({ ...getStatus(), loading: true });
        client
          .mutate({ mutation: doc, variables, update })
          .then(data => {
            setStatus({ error: null, loading: false, data, called: true });
          })
          .catch(error => {
            setStatus({ error, loading: false, data: null, called: true });
          });
      };

      setStatus({ error: null, loading: false, data: null, called: true });

      return () => {};
    }
  };
};
