import type { ReactNode } from 'react';

interface PageBackgroundProps {
  children: ReactNode;
  className?: string;
}

const PageBackground = ({ children, className = '' }: PageBackgroundProps) => (
  <div className={`relative min-h-screen w-full overflow-x-hidden bg-[#DCE1E6] ${className}`}>
    <div className="fixed inset-0 z-0">
      <img src="/src/assets/images/Fondo3.jpg" alt="" className="object-cover w-full h-full" />
      <div className="absolute inset-0 bg-[#0B1E3D]/[0.04]" />
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export default PageBackground;
