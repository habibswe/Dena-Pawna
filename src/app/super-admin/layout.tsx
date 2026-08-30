export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="force-light min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
