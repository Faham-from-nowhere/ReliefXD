import React from 'react';
import {
    LayoutDashboard,
    History,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    LogIn,
    LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    isActive?: boolean;
    onClick?: () => void;
}

function SidebarItem({ icon, label, isCollapsed, isActive, onClick }: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative
        ${isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
        ${isCollapsed ? 'justify-center' : ''}
      `}
            title={isCollapsed ? label : undefined}
        >
            <div className={`${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {icon}
            </div>
            {!isCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {label}
                </span>
            )}
            {isCollapsed && isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full" />
            )}
        </button>
    );
}

interface CollapsibleSidebarProps {
    activeTab: 'dashboard' | 'history';
    onTabChange: (tab: 'dashboard' | 'history') => void;
    isAdmin: boolean;
    onLoginClick: () => void;
}

export function CollapsibleSidebar({ activeTab, onTabChange, isAdmin, onLoginClick }: CollapsibleSidebarProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <motion.div
            className="h-full bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 relative"
            initial={false}
            animate={{ width: isCollapsed ? '80px' : '260px' }}
        >
            {/* Header & Toggle */}
            <div className="p-4 flex items-center justify-between border-b border-slate-800/50 h-16">
                <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    <div className="w-8 h-8 min-w-[32px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight whitespace-nowrap">ReliefXD</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{isAdmin ? 'Admin Console' : 'User View'}</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                <SidebarItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                    isActive={activeTab === 'dashboard'}
                    onClick={() => onTabChange('dashboard')}
                />
                <SidebarItem
                    icon={<History size={20} />}
                    label="Request History"
                    isCollapsed={isCollapsed}
                    isActive={activeTab === 'history'}
                    onClick={() => onTabChange('history')}
                />
            </div>

            {/* Footer Login/Logout */}
            <div className="p-3 border-t border-slate-800/50">
                <SidebarItem
                    icon={isAdmin ? <LogOut size={20} /> : <LogIn size={20} />}
                    label={isAdmin ? "Logout Admin" : "Admin Login"}
                    isCollapsed={isCollapsed}
                    onClick={onLoginClick}
                />
            </div>
        </motion.div>
    );
}
