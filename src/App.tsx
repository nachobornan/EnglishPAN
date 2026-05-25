import { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { Principal } from './pages/Principal';
import { Practica } from './pages/Practica';
import { Library } from './pages/Library';
import { Config } from './pages/Config';
import { GameIntro } from './components/GameIntro';
import { TiemposPlay } from './pages/TiemposPlay';
import { OracionesPlay } from './pages/OracionesPlay';
import mascotImage from './assets/mascot.png';
import mascotThumbsUp from './assets/mascot_thumbsup.png';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import { ALLOWED_EMAILS, getUserName } from './authConfig';
import { LogOut } from 'lucide-react';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('principal');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Authentication Setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  // Check if user is allowed (only if logged in)
  const isAllowed = session && ALLOWED_EMAILS.includes(session.user.email);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    switch (currentView) {
      case 'principal':
        return <Principal userEmail={session?.user?.email} setCurrentView={setCurrentView} />;
      case 'vocabulario_intro':
        return (
          <GameIntro
            title="Vocabulario"
            description="Juego de emparejar palabras en inglés y español. ¡Completa las 15 palabras con la menor cantidad de errores posible!"
            mascot={mascotImage}
            gameType="vocabulario"
            userEmail={session?.user?.email}
            onStart={() => setCurrentView('vocabulario_play')}
            onBack={() => setCurrentView('principal')}
          />
        );
      case 'vocabulario_play':
        return <Practica userEmail={session?.user?.email} setCurrentView={setCurrentView} />;
      case 'tiempos_intro':
        return (
          <GameIntro
            title="Tiempos Verbales"
            description="Practica estructuras gramaticales y conjugaciones en pasado, presente y futuro."
            mascot={mascotThumbsUp}
            gameType="tiempos_verbales"
            userEmail={session?.user?.email}
            onStart={() => setCurrentView('tiempos_play')}
            onBack={() => setCurrentView('principal')}
          />
        );
      case 'tiempos_play':
        return <TiemposPlay userEmail={session?.user?.email} setCurrentView={setCurrentView} />;
      case 'oraciones_intro':
        return (
          <GameIntro
            title="Armar Oraciones"
            description="Ordena las palabras en inglés para formar la oración correcta. ¡Presiona 'Ayuda' si necesitas ver la traducción!"
            mascot={mascotImage}
            gameType="armar_oraciones"
            userEmail={session?.user?.email}
            onStart={() => setCurrentView('oraciones_play')}
            onBack={() => setCurrentView('principal')}
          />
        );
      case 'oraciones_play':
        return <OracionesPlay userEmail={session?.user?.email} setCurrentView={setCurrentView} />;
      case 'library':
        return <Library />;
      case 'config':
        return <Config />;
      default:
        return <Principal userEmail={session?.user?.email} setCurrentView={setCurrentView} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (!isAllowed) {
    const name = getUserName(session.user.email);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Acceso Denegado 🚫</h1>
          <p className="mb-2 text-gray-300">Hola <strong className="text-white">{name}</strong>,</p>
          <p className="mb-6 text-gray-300">Tu correo <strong className="text-white">{session.user.email}</strong> no está autorizado para usar esta aplicación.</p>
          <button onClick={handleSignOut} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer">Cerrar Sesión</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-container">
        {renderView()}
      </div>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <span className="text-xs bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-white/90">
          {getUserName(session?.user?.email)}
        </span>
        <button
          onClick={handleSignOut}
          className="p-2 bg-gray-800/80 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-gray-700 transition cursor-pointer flex items-center justify-center"
          title="Cerrar Sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </>
  );
}

export default App;
