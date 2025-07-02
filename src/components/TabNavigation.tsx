import React, { useEffect, useState } from 'react';

interface Tab {
  id: string;
  name: string;
  description?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const newIndex = tabs.findIndex(tab => tab.id === activeTab);
    setActiveIndex(newIndex);
  }, [activeTab, tabs]);

  return (
    <div className="relative flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
      {/* Continuous gradient background spanning the entire container */}
      <div 
        className="absolute inset-1 rounded-md opacity-20"
        style={{
          background: `linear-gradient(90deg, 
            #3b82f6, 
            #8b5cf6, 
            #ec4899, 
            #10b981)`,
        }}
      />
      
      {/* Sliding active indicator that reveals the gradient */}
      <div 
        className="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out"
        style={{
          left: `calc(${activeIndex} * (100% / ${tabs.length}) + 4px)`,
          width: `calc(100% / ${tabs.length} - 8px)`,
          background: `linear-gradient(90deg, 
            #3b82f6, 
            #8b5cf6, 
            #ec4899, 
            #10b981)`,
          backgroundSize: `${tabs.length * 100}% 100%`,
          backgroundPosition: `${-activeIndex * 100}% 0%`,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative z-10 px-6 py-3 rounded-md font-medium transition-all duration-300 cursor-pointer flex-1
            ${activeTab === tab.id
              ? 'text-white' 
              : 'text-slate-400 hover:text-slate-200'
            }
          `}
          title={tab.description}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;