import React from 'react';

const Header = ({ setIsSidebarOpen }) => {
  return (
    <header className="h-16 bg-bureau-bg border-b border-bureau-navy flex justify-between items-center px-gutter py-4 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden text-bureau-navy p-1"
          onClick={() => setIsSidebarOpen(true)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-headline-md font-headline-md text-bureau-navy font-bold hidden sm:block">
          Good Morning, Officer Priyanshu
        </h1>
      </div>
      
      <div className="flex-1 flex justify-center max-w-md mx-8">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-bureau-navy">search</span>
          <input 
            className="w-full bg-bureau-bg border border-bureau-navy py-2 pl-10 pr-4 text-body-md font-body-md focus:outline-none focus:ring-1 focus:ring-bureau-navy placeholder-bureau-navy transition-all" 
            placeholder="Search cases, suspects, or evidence..." 
            type="text" 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative text-bureau-navy hover:text-bureau-navy transition-colors p-1">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-bureau-navy"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-bureau-navy">
          <div className="text-right hidden md:block">
            <div className="text-label-sm font-label-sm text-bureau-navy font-bold">Badge #4892</div>
            <div className="text-body-md font-body-md font-bold text-bureau-navy">Officer Priyanshu</div>
          </div>
          <div className="relative border border-bureau-navy p-1">
            <img 
              alt="Officer Avatar" 
              className="w-8 h-8 bg-bureau-bg object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGP_jLkmKdmLoSal4_QeC7HZM4Y-6D5aAO0wK9t0RUCd8hbSiWY8vvbNSTNPrvWJWI1rXBmZDsLXUyKEiGOrxiNfVa5uHacAW5cmkjGtN8nvFToIuQoKNegTZaFEOAbZu4xhdqlGjhq53BEFHYrrw9T1dKv-9qwolb8vZPzgkQIRb2mR4VBhy-ULsR-cqVTOMmu4q6Lx3GUUUUr4pzy7aa5NRuSdpaXhVRvak5Ar44dOOtIr_KOw9SYJBZpTAKiOw12pI" 
            />
            <div className="absolute -bottom-2 -right-2 bg-bureau-bg text-bureau-navy text-[10px] font-bold px-1 py-px border border-bureau-navy font-label-sm">OP</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
