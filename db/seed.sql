INSERT INTO public.config(key, value) VALUES
  ('app.name',       '{"service":"dernier-metro-api"}'),
  ('metro.defaults', '{"line":"M1","headwayMin":3,"tz":"Europe/Paris"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;