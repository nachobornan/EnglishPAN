-- ========================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS (EnglishPAN)
-- ========================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase.

-- 1. Crear la tabla de palabras (Vocabulario)
create table if not exists public.words (
    id uuid default gen_random_uuid() primary key,
    word text not null unique,
    translation text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Crear la tabla de rankings (Historial de Sesiones)
create table if not exists public.rankings (
    id uuid default gen_random_uuid() primary key,
    user_email text not null,
    correct_hits integer not null,
    incorrect_hits integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar RLS (Seguridad a Nivel de Fila)
alter table public.words enable row level security;
alter table public.rankings enable row level security;

-- 4. Crear Políticas de Seguridad para la tabla 'words'
-- Permitir lectura (select) a cualquier usuario autenticado
create policy "Permitir lectura a usuarios autenticados" on public.words
    for select to authenticated using (true);

-- Permitir inserción (insert) a usuarios autenticados
create policy "Permitir insercion a usuarios autenticados" on public.words
    for insert to authenticated with check (true);

-- Permitir modificación (update) a usuarios autenticados
create policy "Permitir modificacion a usuarios autenticados" on public.words
    for update to authenticated using (true) with check (true);

-- Permitir eliminación (delete) a usuarios autenticados
create policy "Permitir eliminacion a usuarios autenticados" on public.words
    for delete to authenticated using (true);

-- 5. Crear Políticas de Seguridad para la tabla 'rankings'
-- Permitir lectura (select) a cualquier usuario autenticado
create policy "Permitir lectura de rankings a autenticados" on public.rankings
    for select to authenticated using (true);

-- Permitir inserción (insert) a cualquier usuario autenticado
create policy "Permitir insercion de rankings a autenticados" on public.rankings
    for insert to authenticated with check (true);

-- 6. Insertar 20 palabras iniciales de vocabulario para arrancar
insert into public.words (word, translation) values
('cat', 'gato'),
('dog', 'perro'),
('climb', 'escalar'),
('like', 'gustar'),
('have', 'tener'),
('beautiful', 'hermoso'),
('house', 'casa'),
('apple', 'manzana'),
('run', 'correr'),
('water', 'agua'),
('book', 'libro'),
('friend', 'amigo'),
('sleep', 'dormir'),
('happy', 'feliz'),
('green', 'verde'),
('speak', 'hablar'),
('write', 'escribir'),
('work', 'trabajar'),
('easy', 'fácil'),
('love', 'amar')
on conflict (word) do nothing;
