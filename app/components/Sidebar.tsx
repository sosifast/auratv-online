'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Compass, 
  Tv, 
  Flame, 
  History, 
  Heart, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Discover', icon: Home, path: '/' },
    { name: 'Browse', icon: Compass, path: '/browse' },
    { name: 'Live TV', icon: Tv, path: '/live' },
    { name: 'Trending', icon: Flame, path: '/trending' },
  ];

  const personalItems = [
    { name: 'Favorites', icon: Heart, path: '/favorites' },
    { name: 'Watch History', icon: History, path: '/history' },
  ];

  return (
    <aside className="sidebar">
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
          <Zap className="w-6 h-6 text-white fill-white" />
        </div>
        <span className="text-2xl font-black tracking-tighter text-glow">AURA<span className="text-violet-500">TV</span></span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 pl-4">Menu</p>
          {menuItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <div className={`nav-item ${pathname === item.path ? 'active' : ''}`}>
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-bold text-sm">{item.name}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 pl-4">Library</p>
          {personalItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <div className={`nav-item ${pathname === item.path ? 'active' : ''}`}>
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-bold text-sm">{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="nav-item">
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-bold text-sm">Settings</span>
        </div>
        <div className="nav-item text-red-400 hover:text-red-300">
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-bold text-sm">Logout</span>
        </div>
        
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-violet-500/20">
            <p className="text-[10px] font-bold text-violet-300 uppercase mb-1">Premium Plan</p>
            <p className="text-xs text-white font-medium mb-3">Get unlimited access to 4K channels.</p>
            <button className="w-full py-2 bg-white text-black text-[10px] font-black rounded-lg hover:bg-violet-100 transition-colors uppercase">Upgrade Now</button>
        </div>
      </div>
    </aside>
  );
}
