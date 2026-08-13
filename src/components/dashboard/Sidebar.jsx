import React from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', active: true },
    { name: 'My Cases', icon: 'folder_shared' },
    { name: 'New Case', icon: 'add_box' },
    { name: 'AI FIR Generator', icon: 'psychology' },
    { name: 'Evidence', icon: 'inventory_2' },
    { name: 'Reports', icon: 'assessment' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bureau-navy/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`fixed inset-y-0 left-0 z-50 w-64 bg-bureau-bg border-r border-bureau-navy transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col py-6`}>
        <div className="px-6 mb-8 flex items-center justify-between border-b border-bureau-navy pb-6">
          <a href="#" className="block w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-bureau-navy flex items-center justify-center font-bold text-lg bg-bureau-navy text-bureau-bg font-headline-md">G</div>
              <span className="font-headline-md font-bold text-xl tracking-tight">CRIMEGPT</span>
            </div>
          </a>
          <button className="lg:hidden text-bureau-navy p-1" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {navItems.map((item, index) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center space-x-3 px-6 py-3 bg-bureau-bg text-bureau-navy ${
                index === 0 ? 'border-y' : 'border-b'
              } border-bureau-navy transition-colors hover:bg-surface-dim ${
                item.active ? 'font-bold' : ''
              } ${index === 0 ? '-mt-px' : ''}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-label-md font-label-md">{item.name}</span>
            </a>
          ))}
        </div>

        <div className="px-6 mt-4">
          <button className="w-full bg-bureau-bg text-bureau-navy py-2 px-4 border border-bureau-navy text-label-md font-label-md flex items-center justify-center space-x-2 hover:bg-surface-dim transition-colors font-bold uppercase">
            <span className="material-symbols-outlined text-[18px]">emergency</span>
            <span>Emergency Alert</span>
          </button>
        </div>

        <div className="mt-8 flex flex-col border-t border-bureau-navy">
          <a href="#" className="flex items-center space-x-3 px-6 py-3 bg-bureau-bg text-bureau-navy border-b border-bureau-navy hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-label-md font-label-md">Settings</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-6 py-3 bg-bureau-bg text-bureau-navy border-b border-bureau-navy hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-label-md font-label-md">Logout</span>
          </a>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
