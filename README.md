# Control Planta iGen5000

Webapp movil/PWA para registrar horas de uso y mantenimiento de una planta Westinghouse iGen5000.

## Funciones

- Registro de horas por Ana o Jesus.
- Tablero rapido con horas totales, ultimo uso, proximo mantenimiento y estado general.
- Seguimiento de mantenimiento por horas o calendario, lo que ocurra primero.
- Historial de horas y servicios.
- Consulta rapida del manual y sintomas comunes.
- Sincronizacion en la nube con Supabase usando una clave familiar compartida.
- PWA instalable en iPhone desde Safari.

## Nube

La app usa el proyecto Supabase `tasa-visitas` y la tabla `public.planta_sync_states`.
En cada iPhone hay que abrir `Mas > Sincronizacion`, escribir la misma clave familiar y tocar `Activar nube`.
La clave no se publica en el repo: el navegador guarda un hash local y lo usa para leer/escribir el registro compartido.

## Desarrollo local

```bash
npm install
npm run dev
```

## Produccion

```bash
npm run build
```
