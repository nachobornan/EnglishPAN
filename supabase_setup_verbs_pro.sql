-- =============================================================
-- SCRIPT DE CREACIÓN DE TABLA VERBS_PRO (EnglishPAN)
-- =============================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase.

-- 1. Crear la tabla verbs_pro si no existe
CREATE TABLE IF NOT EXISTS public.verbs_pro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sentence TEXT NOT NULL,
    correctverbform TEXT NOT NULL,
    wrongtverbform1 TEXT NOT NULL,
    wrongtverbform2 TEXT NOT NULL,
    traduction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad de nivel de fila (RLS)
ALTER TABLE public.verbs_pro ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para lectura y escritura de usuarios autenticados
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.verbs_pro;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON public.verbs_pro;

CREATE POLICY "Allow read access to authenticated users" ON public.verbs_pro
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to authenticated users" ON public.verbs_pro
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Sembrar 15 oraciones iniciales (solo si la tabla está vacía)
INSERT INTO public.verbs_pro (sentence, correctverbform, wrongtverbform1, wrongtverbform2, traduction)
SELECT v.sentence, v.correctverbform, v.wrongtverbform1, v.wrongtverbform2, v.traduction
FROM (VALUES
  ('I ___ to the school yesterday. (Go)', 'went', 'gone', 'going', 'Yo fui a la escuela ayer.'),
  ('She is ___ a book right now. (Read)', 'reading', 'read', 'reads', 'Ella está leyendo un libro ahora mismo.'),
  ('They have ___ all the orange juice. (Drink)', 'drunk', 'drank', 'drinking', 'Ellos han bebido todo el jugo de naranja.'),
  ('We ___ soccer in the park last Sunday. (Play)', 'played', 'playing', 'plays', 'Jugamos al fútbol en el parque el domingo pasado.'),
  ('He ___ his keys this morning. (Lose)', 'lost', 'losing', 'loses', 'Él perdió sus llaves esta mañana.'),
  ('They are ___ to music in their room. (Listen)', 'listening', 'listened', 'listens', 'Ellos están escuchando música en su habitación.'),
  ('She has ___ three letters today. (Write)', 'written', 'wrote', 'writing', 'Ella ha escrito tres cartas hoy.'),
  ('My brother ___ early yesterday. (Wake up)', 'woke up', 'woken up', 'waking up', 'Mi hermano se despertó temprano ayer.'),
  ('We are ___ dinner right now. (Cook)', 'cooking', 'cooked', 'cooks', 'Estamos cocinando la cena ahora mismo.'),
  ('He ___ a new car last month. (Buy)', 'bought', 'buying', 'buys', 'Él compró un auto nuevo el mes pasado.'),
  ('I have ___ this movie twice. (See)', 'seen', 'saw', 'seeing', 'He visto esta película dos veces.'),
  ('Look! The baby is ___. (Sleep)', 'sleeping', 'slept', 'sleeps', '¡Mira! El bebé está durmiendo.'),
  ('She ___ English very well every day. (Speak)', 'speaks', 'speaking', 'spoke', 'Ella habla inglés muy bien todos los días.'),
  ('They ___ the museum two days ago. (Visit)', 'visited', 'visiting', 'visits', 'Ellos visitaron el museo hace dos días.'),
  ('He has ___ his homework already. (Do)', 'done', 'did', 'doing', 'Él ya ha hecho su tarea.')
) AS v(sentence, correctverbform, wrongtverbform1, wrongtverbform2, traduction)
WHERE NOT EXISTS (SELECT 1 FROM public.verbs_pro LIMIT 1);
