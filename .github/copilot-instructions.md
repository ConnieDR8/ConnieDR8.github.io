# Reglas del proyecto

## Commits

Todos los commits deben cumplir las siguientes reglas:

- Usar modo imperativo.
- Tener máximo 50 caracteres.
- No terminar con punto.
- Contener un único tema o cambio.
- Ser claros y descriptivos.

## Ejemplos correctos

- Agregar sección de proyectos
- Agregar modo oscuro
- Mejorar diseño responsive
- Corregir estilos móviles
- Documentar repositorio

## Ejemplos incorrectos

- Cambié varias cosas
- Actualización del proyecto.
- Hice algunos cambios
- Arreglé todo el diseño y varias cosas más

## Revisión

Antes de confirmar un commit se debe revisar:

- `git diff --staged`
- `git log --oneline`

El cambio debe ser revisado por una persona antes de realizar el merge del Pull Request.