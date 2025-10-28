interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="p-3 min-h-screen bg-primary flex flex-col gap-1.25">
      {/* Header */}
      <header className="bg-primary">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">FlowSpace</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-secondary rounded-md p-6 flex-1">
        {children}
      </main>
    </div>
  );
}
