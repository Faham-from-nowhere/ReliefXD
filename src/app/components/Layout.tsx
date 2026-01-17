import { ReactNode } from 'react';
import { CollapsibleSidebar } from './CollapsibleSidebar';

interface LayoutProps {
    children: ReactNode;
    activeTab: 'dashboard' | 'history';
    onTabChange: (tab: 'dashboard' | 'history') => void;
    isAdmin: boolean;
    onLoginClick: () => void;
}

export function Layout({ children, activeTab, onTabChange, isAdmin, onLoginClick }: LayoutProps) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <CollapsibleSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                isAdmin={isAdmin}
                onLoginClick={onLoginClick}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Content Render - Header removed as per request */}
                <main className="flex-1 overflow-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
