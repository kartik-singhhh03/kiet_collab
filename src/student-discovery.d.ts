declare module './pages/StudentDiscovery' {
  import React from 'react';
  interface StudentDiscoveryProps {
    isDark: boolean;
    toggleTheme: () => void;
    user: unknown;
  }
  const StudentDiscovery: React.FC<StudentDiscoveryProps>;
  export default StudentDiscovery;
}
