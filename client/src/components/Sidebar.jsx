import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart2, ShoppingBag, Package, Truck, Users, 
  Settings, Heart, ChevronLeft, ChevronRight, Activity 
} from 'lucide-react';

export const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuLinks = () => {
    switch (role) {
      case 'StoreAdmin':
        return [
          { name: 'Analytics', path: '/store-admin', icon: BarChart2 },
          { name: 'Order Manager', path: '/store-admin/orders', icon: ShoppingBag },
          { name: 'Stock Inventory', path: '/store-admin/inventory', icon: Package }
        ];
      case 'Courier':
        return [
          { name: 'Rider Console', path: '/courier-dashboard', icon: Truck },
          { name: 'My Deliveries', path: '/courier-dashboard/deliveries', icon: Package }
        ];
      case 'SystemAdmin':
        return [
          { name: 'Overview', path: '/system-admin', icon: BarChart2 },
          { name: 'Supermarkets', path: '/system-admin/stores', icon: Package },
          { name: 'Platform Users', path: '/system-admin/users', icon: Users },
          { name: 'System Status', path: '/system-admin/health', icon: Activity }
        ];
      default:
        return [
          { name: 'Marketplace', path: '/dashboard', icon: ShoppingBag },
          { name: 'My Orders', path: '/orders', icon: Package }
        ];
    }
  };

  const menuItems = getMenuLinks();

  return (
    <div 
      className={`h-[calc(100vh-73px)] sticky top-[73px] bg-[#020617] border-r border-slate-900 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex-1">
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-end p-2 mb-4 rounded-xl text-slate-400 hover:text-white bg-slate-900/50 border border-slate-850 hover:bg-slate-900"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 uppercase px-1"><span>Menu</span><ChevronLeft className="w-4 h-4" /></div>}
        </button>

        {/* Navigation links */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-ceylon-500 text-white shadow-lg shadow-ceylon-500/15'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-900/80">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
            ⚙️
          </div>
          {!isCollapsed && (
            <div>
              <div className="text-xs font-bold text-slate-300">System V1.0</div>
              <div className="text-[10px] text-slate-500 font-semibold">Active Mode</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
