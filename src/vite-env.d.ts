/// <reference types="vite/client" />

declare module '*/StudentDiscovery' {
  import React from 'react';
  const StudentDiscovery: React.FC<{ isDark: boolean; toggleTheme: () => void; user: unknown }>;
  export default StudentDiscovery;
}
