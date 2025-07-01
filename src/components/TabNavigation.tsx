import React from 'react';

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
  return (
    <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={
            activeTab === tab.id
              ? "px-6 py-3 rounded-md font-medium bg-blue-600 text-white shadow-lg transition-all"
              : "px-6 py-3 rounded-md font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
          }
          title={tab.description}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;