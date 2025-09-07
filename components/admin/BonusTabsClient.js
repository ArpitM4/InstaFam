'use client';

import { useState } from 'react';
import BonusManagementClient from './BonusManagementClient';
import FamPointsBonusClient from './FamPointsBonusClient';

export default function BonusTabsClient() {
  const [activeTab, setActiveTab] = useState('creator-bonus');

  const tabs = [
    {
      id: 'creator-bonus',
      label: 'Creator Bonuses',
      description: 'Review and approve creator bonus requests'
    },
    {
      id: 'fampoints-bonus',
      label: 'FamPoints Bonus',
      description: 'Award bonus FamPoints to users'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-[var(--border)]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mb-4">
        <p className="text-[var(--text-secondary)]">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--background)] rounded-lg">
        {activeTab === 'creator-bonus' && <BonusManagementClient />}
        {activeTab === 'fampoints-bonus' && <FamPointsBonusClient />}
      </div>
    </div>
  );
}
