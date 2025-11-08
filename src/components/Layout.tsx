import { Toolbar } from './Toolbar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="p-2 min-h-screen bg-primary flex flex-col gap-1.5">
      <Header />

      {/* Main Content */}
      <main className="bg-secondary rounded-md p-6 flex-1 relative">
        <Toolbar />
        {children}
      </main>
    </div>
  );
}
