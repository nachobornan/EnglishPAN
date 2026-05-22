import { useState } from 'react';
import { supabase } from '../lib/supabase';
import mascotImage from '../assets/mascot.png';

const Login = () => {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.href,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl max-w-sm w-full p-8 flex flex-col items-center gap-6 shadow-xl">
                <img 
                    src={mascotImage} 
                    alt="EnglishPAN Mascot" 
                    style={{ 
                        height: "120px", 
                        width: "120px", 
                        objectFit: "contain",
                        animation: "float 3s ease-in-out infinite"
                    }} 
                />
                
                <div>
                    <h1 className="text-2xl font-bold mb-2 text-white">EnglishPAN</h1>
                    <p className="text-muted-foreground text-sm">Aprende inglés con el pan lactal más buena onda. ¡Inicia sesión para comenzar!</p>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
                >
                    {loading ? (
                        <span>Conectando...</span>
                    ) : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ height: "1.25em", width: "1.25em" }} />
                            <span>Iniciar sesión con Google</span>
                        </>
                    )}
                </button>
            </div>
            
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
};

export default Login;
