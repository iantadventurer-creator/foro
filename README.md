# IanTBuild

Portafolio de fotografía de miniaturas LEGO (`@iantadventurer`) con una comunidad donde otros fans publican sus propias fotos.

- **Frontend:** Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Framer Motion
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime). No hay servidor propio: la seguridad vive en las políticas RLS de la base de datos.
- **Despliegue:** Vercel

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena las dos variables de Supabase
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Tests unitarios (Vitest) de la lógica de `lib/` |

## Base de datos (Supabase)

Ejecuta los scripts de `supabase/` en **SQL Editor** en este orden (todos son seguros de repetir):

1. `rls-policies.sql` — políticas de seguridad (quién puede leer/escribir qué).
2. `add-profiles-avatar.sql` — tabla `profiles` con la foto de perfil.
3. `add-community-category.sql` — categoría de las publicaciones.
4. `add-profiles-username.sql` — nombre de usuario único y nombre completo (registro estilo Instagram).
5. `harden-security.sql` — límites de datos, índices, un like por persona, restricciones del bucket y autor forzado.

## Estructura

```
app/                  Rutas: cada página es solo un "esqueleto" que guarda el estado y compone componentes
components/home       Secciones de la portada (cabecera, hero, galería, visor, sobre mí, pie)
components/community  Cabecera, feed, tarjetas y modales (publicar / ver publicación) de la comunidad
components/ui         Piezas reutilizables (toasts, diálogos, filtros, fondo...)
lib/                  Lógica compartida y testeada: validación, temas, textos (homeContent,
                      communityContent), carga de datos (gallery, useCommunityFeed) y hooks
supabase/             Scripts SQL
```

## Notas de seguridad

- Las URLs escritas por usuarios solo se aceptan si son `http(s)` (`lib/validation.ts`), tanto al guardar como al mostrarlas.
- La extensión de los archivos subidos se deduce del tipo MIME validado, nunca del nombre.
- Las imágenes de perfil solo se muestran si viven en el Storage del propio proyecto.
- Cabeceras de seguridad en `next.config.ts`. Pendiente: Content-Security-Policy (requiere nonces con Next.js).
