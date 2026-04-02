---
trigger: always_on
---

# TaxiLink — Guardrails & Development Rules (Windsurf)

## 1. Propósito

Este documento define las reglas obligatorias que la IA debe seguir al generar código para TaxiLink.

El objetivo es:

* mantener consistencia
* evitar sobreingeniería
* reducir errores
* asegurar escalabilidad simple
* proteger el código existente

---

## 2. Regla principal

La IA debe seguir estrictamente el PRD del MVP.

NO debe:

* agregar funcionalidades no solicitadas
* expandir el alcance del proyecto
* implementar features “por si acaso”

---

## 3. Filosofía de desarrollo

* Simplicidad > complejidad
* Funcionalidad > perfección
* Claridad > abstracción
* MVP > sistema completo

---

## 4. Arquitectura obligatoria

* Monolito en Next.js (App Router)
* TypeScript estricto
* Prisma como ORM
* Supabase como DB y Storage

NO crear:

* microservicios
* arquitecturas distribuidas
* capas innecesarias

---

## 5. Organización del código

El código debe organizarse por módulos:

/modules
/drivers
/leads
/auth
/admin

Cada módulo debe tener:

* service (lógica)
* repository (DB)
* types
* validations

---

## 6. Reglas de generación de código

### 6.1 NO sobreingeniería

NO usar:

* patrones complejos innecesarios
* factories avanzadas
* arquitecturas enterprise

---

### 6.2 Código claro y directo

* funciones simples
* nombres descriptivos
* evitar lógica innecesaria

---

### 6.3 Reutilización

* no duplicar lógica
* centralizar validaciones
* centralizar acceso a DB

---

## 7. Base de datos

* mantener schema simple
* evitar columnas innecesarias
* usar enums solo cuando sea necesario

NO crear:

* tablas futuras
* estructuras especulativas

---

## 8. API y lógica

* endpoints claros y simples
* validación obligatoria en inputs
* manejar errores correctamente

NO crear:

* endpoints no usados
* lógica anticipada

---

## 9. Frontend

* mobile-first obligatorio
* UI simple (shadcn)
* evitar animaciones complejas
* priorizar velocidad

CTA (botón principal) debe ser:

* visible inmediatamente
* accesible en máximo 2 clics

---

## 10. Manejo de errores

* usar try/catch en operaciones críticas
* integrar Sentry
* logs claros y legibles

---

## 11. Seguridad

* validar inputs siempre
* proteger rutas privadas
* no exponer API keys
* usar variables de entorno

---

## 12. Cambios en el código

La IA NO debe:

* borrar código existente sin justificación
* reestructurar el proyecto completo
* cambiar nombres de archivos sin razón

---

## 13. Refactors

Solo se permiten si:

* mejoran claridad
* reducen complejidad
* NO rompen funcionalidad existente

---

## 14. Documentación obligatoria

Cada cambio debe actualizar:

/docs:

* CHANGELOG.md
* módulo afectado

Debe incluir:

* qué se hizo
* por qué
* cómo funciona

---

## 15. Manejo de prompts

La IA debe:

* responder SOLO a lo solicitado
* no expandir el scope
* no asumir funcionalidades nuevas

---

## 16. Performance

* evitar queries innecesarias
* optimizar carga inicial
* usar lazy loading cuando aplique

---

## 17. SEO

* URLs limpias
* metadata dinámica
* JSON-LD básico

NO implementar SEO avanzado en MVP

---

## 18. Logs y monitoreo

* integrar Sentry
* logs claros
* evitar logs excesivos

---

## 19. Anti-bugs

* validar datos antes de guardar
* manejar estados correctamente
* evitar null/undefined errors

---

## 20. Regla final

Construir solo lo necesario para lanzar el MVP.

El objetivo es:

👉 sistema funcional
👉 validación real
👉 iteración rápida

NO perfección.

---
