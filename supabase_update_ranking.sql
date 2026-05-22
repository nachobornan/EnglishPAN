-- =============================================================
-- SCRIPT DE ACTUALIZACIÓN DE TABLA RANKINGS (EnglishPAN)
-- =============================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase.
-- Añade soporte para identificar puntuaciones de diferentes juegos.

-- 1. Agregar columna game_type con valor predeterminado 'vocabulario'
ALTER TABLE public.rankings 
ADD COLUMN IF NOT EXISTS game_type text NOT NULL DEFAULT 'vocabulario';

-- 2. Asegurar que las políticas RLS permitan leer y escribir la nueva columna (ya están abiertas, pero confirmamos)
-- El RLS de 'rankings' está configurado para permitir lecturas e inserciones a cualquier usuario autenticado,
-- por lo que la nueva columna heredará estas políticas automáticamente.
