import { Home, BookOpen } from 'lucide-react';

interface BottomNavProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
    const tabs = [
        { id: 'principal', label: 'Inicio', icon: Home },
        { id: 'library', label: 'Biblioteca', icon: BookOpen },
    ];

    // Determine if currentView is a sub-view of 'principal' (e.g. game intro/play screens) to highlight the Home tab
    const getActiveTab = (view: string) => {
        if (['principal', 'vocabulario_intro', 'vocabulario_play', 'tiempos_intro', 'tiempos_play', 'oraciones_intro', 'oraciones_play'].includes(view)) {
            return 'principal';
        }
        return view;
    };

    const activeTab = getActiveTab(currentView);

    return (
        <nav className="bottom-nav">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setCurrentView(tab.id)}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
