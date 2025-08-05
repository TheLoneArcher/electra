import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import LandingPage from "@/pages/LandingPage";
import BrowsePage from "@/pages/BrowsePage";
import DashboardPage from "@/pages/DashboardPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Not found");
          }
          throw new Error("Network response was not ok");
        }
        return res.json();
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen">
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/browse" component={BrowsePage} />
              <Route path="/dashboard" component={DashboardPage} />
            </Switch>
            <Toaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
