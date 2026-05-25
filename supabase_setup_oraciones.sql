-- =============================================================
-- SCRIPT DE CREACIÓN DE TABLA ORACIONES (EnglishPAN)
-- =============================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase.

-- 1. Crear la tabla de oraciones si no existe
CREATE TABLE IF NOT EXISTS public.oraciones (
    id SERIAL PRIMARY KEY,
    traduccion TEXT NOT NULL,
    parte1 TEXT,
    parte2 TEXT,
    parte3 TEXT,
    parte4 TEXT,
    parte5 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad de nivel de fila (RLS)
ALTER TABLE public.oraciones ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para lectura y escritura de usuarios autenticados
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.oraciones;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON public.oraciones;

CREATE POLICY "Allow read access to authenticated users" ON public.oraciones
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write access to authenticated users" ON public.oraciones
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Sembrar datos iniciales (solo si la tabla está vacía)
INSERT INTO public.oraciones (traduccion, parte1, parte2, parte3, parte4, parte5)
SELECT o.traduccion, o.parte1, o.parte2, o.parte3, o.parte4, o.parte5
FROM (VALUES
('Ellos fueron a nueva york', 'They', 'went', 'to new york', NULL, NULL),
('Ella fue hace 2 años', 'She', 'went', 'two years', 'ago', NULL),
('Soy bueno leyendo', 'I am', 'good at', 'reading', NULL, NULL),
('Cuando me levanto me lavo los dientes', 'When I', 'get up I', 'brush my', 'teeth', NULL),
('Me gusta tomar el desayuno con pan', 'I like', 'to have', 'breakfast', 'with bread', NULL),
('A qué hora vas a la escuela?', 'What time', 'do you', 'go to school?', NULL, NULL),
('Hace dos veranos, hicimos un viaje a Nueva York.', 'Two summers ago', 'we went', 'on a trip', 'to New York.', NULL),
('El viaje fue muy largo, pero estábamos muy emocionados.', 'The journey', 'was so long', 'but we were', 'very excited.', NULL),
('Cuando llegamos al hotel nos fuimos a dormir.', 'When we arrive', 'at the hotel', 'we went', 'to sleep.', NULL),
('Crees tu que ella es una buena conductora de biciletas?', 'Do you think', 'she''s a good', 'bike rider?', NULL, NULL),
('¿Cree ella que nosotros somos buenos cantantes?', 'Does she', 'think we''re', 'good singers?', NULL, NULL),
('Me llamo Nora y vivo en Suecia.', 'My name', 'is Nora', 'and I live', 'in Sweden', NULL),
('Después de la escuela me gusta ayudar a mi papá a cuidar a los terneros', 'After school I', 'like to help', 'my dad', 'to take care', 'of calves.'),
('Estamos haciendo algo muy especial en la escuela hoy', 'We''re doing', 'something', 'very special', 'at school today.', NULL),
('Puedo oir tu respiración desde aquí.', 'I can', 'hear your', 'breathing', 'from here.', NULL),
('Sentí dolor de mi tobillo cuando caí.', 'I felt', 'pain in my', 'ankle', 'when I fell.', NULL),
('Estaba muy contento cuando jugué con mis amigos.', 'I was very', 'happy when I', 'played with', 'my friends.', NULL),
('¿Cuándo estuvimos en la playa?', 'When', 'were we', 'at the', 'beach?', NULL),
('¿Que comió ella? -Ella comió zanahorias', 'What did', 'she eat?', 'She ate', 'carrots.', NULL),
('Anoche hubo mucho ruido en la calle.', 'Last night', 'there was', 'loud noise', 'in the street.', NULL),
('¿Qué ocurrió ayer en el parque?', 'What was', 'happening', 'yesterday', 'in the park?', NULL),
('Mientras mi madre estaba cocinando mi hermano comió los tomates.', 'While', 'my mother', 'was cooking', 'my brother', 'ate the tomatoes.'),
('Había mucha gente en el parque.', 'There were', 'a lot of', 'people', 'in the park.', NULL),
('Hay tres naranjas en la cocina.', 'There are', 'three oranges', 'in the kitchen.', NULL, NULL),
('Una chica estaba leyendo un libro sobre Messi.', 'A girl', 'was reading', 'a book', 'about Messi.', NULL),
('Un hombre estaba comiendo pasta cuando se quedó dormido.', 'A man', 'was eating', 'pasta', 'when he', 'fall asleep.'),
('Un chico estaba patinando cuando choco una piedra.', 'A boy', 'was skating', 'when he', 'hit a rock.', NULL),
('Los hombres estaban escribiendo en la calle cuando el coche se estrelló.', 'The men', 'were writing', 'on the street', 'when the', 'car crashed.'),
('Mientras estudiaba, mis amigos me llamaron.', 'While', 'I was studying', 'my friends', 'called me.', NULL),
('Se lastimó la pierna mientras jugaba al fútbol.', 'She hurt', 'her leg', 'while she', 'was playing', 'football.')
) AS o(traduccion, parte1, parte2, parte3, parte4, parte5)
WHERE NOT EXISTS (SELECT 1 FROM public.oraciones LIMIT 1);
