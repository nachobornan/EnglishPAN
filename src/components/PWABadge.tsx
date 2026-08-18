import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export function PWABadge() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 p-4 bg-gray-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl shadow-2xl max-w-xs text-white animate-fadeIn flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin text-indigo-400" size={18} />
          <span className="font-semibold text-sm">Nueva versión disponible</span>
        </div>
        <button
          onClick={close}
          className="text-gray-400 hover:text-white transition p-1 rounded-full"
          title="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-300">
        Hay contenido nuevo disponible en EnglishPAN. Haz clic para actualizar la app.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition"
        >
          Actualizar ahora
        </button>
      </div>
    </div>
  );
}
