import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StatusMonitor from './components/StatusMonitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000, // 10 seconds
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusMonitor />
    </QueryClientProvider>
  );
}

export default App;