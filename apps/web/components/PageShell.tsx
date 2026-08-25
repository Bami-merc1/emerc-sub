import Sidebar from "./Sidebar";

export default function PageShell({
  breadcrumb,
  children,
}: {
  breadcrumb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex-1">
        <div className="border-b border-gray-200 bg-white px-8 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Dashboard <span className="text-gray-300 mx-1">/</span>{" "}
            <span className="text-gray-900 font-medium">{breadcrumb}</span>
          </span>
          <span className="text-xs text-gray-400 font-mono">user@emercsub.com</span>
        </div>
        <main className="px-8 py-8 max-w-5xl">{children}</main>
      </div>
    </div>
  );
}