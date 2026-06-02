export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white py-4 px-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
