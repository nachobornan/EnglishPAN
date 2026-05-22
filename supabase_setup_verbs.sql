-- =============================================================
-- SCRIPT DE CREACIÓN DE TABLA VERBS (EnglishPAN)
-- =============================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase.

-- 1. Crear la tabla de verbos si no existe
CREATE TABLE IF NOT EXISTS public.verbs (
    id SERIAL PRIMARY KEY,
    verbo text NOT NULL,
    traduccion text NOT NULL,
    pasado text NOT NULL,
    error1 text NOT NULL,
    error2 text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad de nivel de fila (RLS)
ALTER TABLE public.verbs ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para lectura y escritura de usuarios autenticados
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.verbs;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON public.verbs;

CREATE POLICY "Allow read access to authenticated users" ON public.verbs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to authenticated users" ON public.verbs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Sembrar datos iniciales (solo si la tabla está vacía)
INSERT INTO public.verbs (verbo, traduccion, pasado, error1, error2)
SELECT v.verbo, v.traduccion, v.pasado, v.error1, v.error2
FROM (VALUES
  ('be', 'ser/estar', 'was/were', 'beed', 'ben'),
  ('beat', 'golpear', 'beat', 'beated', 'beaten'),
  ('become', 'convertirse', 'became', 'becomed', 'becumen'),
  ('begin', 'empezar', 'began', 'begined', 'begun'),
  ('bite', 'morder', 'bit', 'bited', 'bitten'),
  ('blow', 'soplar', 'blew', 'blowed', 'blown'),
  ('break', 'romper', 'broke', 'breaked', 'broked'),
  ('bring', 'traer', 'brought', 'bringed', 'brang'),
  ('burn', 'quemar', 'burnt/burned', 'burned', 'burn'),
  ('build', 'construir', 'built', 'builded', 'builted'),
  ('buy', 'comprar', 'bought', 'buyed', 'buyed'),
  ('can', 'poder', 'could', 'caned', 'canned')
) AS v(verbo, traduccion, pasado, error1, error2)
WHERE NOT EXISTS (SELECT 1 FROM public.verbs LIMIT 1);
