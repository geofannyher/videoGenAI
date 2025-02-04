"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const query = new QueryClient();
  return <QueryClientProvider client={query}>{children}</QueryClientProvider>;
};

export default QueryProvider;
