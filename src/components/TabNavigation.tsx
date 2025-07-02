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
  const [buttonRefs, setButtonRefs] = useState<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const newIndex = tabs.findIndex(tab => tab.id === activeTab);
    setActiveIndex(newIndex);
  }, [activeTab, tabs]);

  useEffect(() => {
    setButtonRefs(refs => Array(tabs.length).fill(null).map((_, i) => refs[i] || null));
  }, [tabs.length]);

  return (
    <div className="relative flex rounded-lg p-1 border border-white/20 overflow-hidden backdrop-blur-2xl"
      style={{
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `
      }}>
      
      {/* Enhanced glass refraction layers */}
      <div className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.02) 30%, 
            rgba(255, 255, 255, 0.08) 100%)`,
        }}
      />
      <div className="absolute inset-0 rounded-lg"
        style={{
          background: `radial-gradient(circle at 30% 20%, 
            rgba(255, 255, 255, 0.08) 0%, 
            transparent 50%)`,
        }}
      />
      
      {/* Active tab indicator */}
      <div 
        className="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out"
        style={{
          left: buttonRefs[activeIndex]?.offsetLeft ? `${buttonRefs[activeIndex]!.offsetLeft}px` : '4px',
          width: buttonRefs[activeIndex]?.offsetWidth ? `${buttonRefs[activeIndex]!.offsetWidth}px` : 'auto',
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.25) 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            rgba(255, 255, 255, 0.15) 100%)`,
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05),
            0 4px 24px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={el => {
            const newRefs = [...buttonRefs];
            newRefs[index] = el;
            setButtonRefs(newRefs);
          }}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative z-10 px-6 py-3 rounded-md font-medium transition-all duration-300 cursor-pointer whitespace-nowrap
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