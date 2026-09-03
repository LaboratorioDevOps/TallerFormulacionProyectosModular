# Análisis de opciones de despliegue

**Proyecto:** Artefacto MML · Formulación de Proyectos
**Contexto académico:** Laboratorio DevOps — Taller Modular
**Fecha:** 2026-09-02
**Responsable del proyecto:** luisldra@gmail.com

Este documento analiza, sin generar archivos de infraestructura, las alternativas de arquitectura frontend, servidor y hosting, y empaquetado/automatización disponibles para desplegar el artefacto MML modular. Cierra con una decisión final argumentada y contrastada frente al registro de decisiones técnicas del proyecto (`docs/decisiones-tecnicas.md`).

---

## 1. Contexto y restricciones

El artefacto resultante de la reestructuración es una aplicación de página única (SPA) **enteramente estática**: no existe backend, no existe base de datos y no existe mecanismo de autenticación. Toda la lógica de negocio —validaciones, generación del árbol de problemas, composición de enunciados, exportación e importación de casos— se ejecuta en el navegador.

La persistencia se resuelve mediante `localStorage`: el navegador guarda el estado del caso en curso de forma automática, y el propio artefacto ofrece exportación e importación manual a JSON como mecanismo complementario. No hay ningún dato que resida en un servidor, ni ninguna base de datos que administrar, respaldar o migrar. Esta característica simplifica de raíz el análisis de despliegue: cualquier alternativa que se evalúe en este documento parte de la premisa de que basta con **servir archivos estáticos** (HTML, CSS, JavaScript) a un navegador.

El artefacto declara además, como regla permanente, la prohibición de introducir datos personales —nombres de personas naturales, números de identificación, teléfonos, correos electrónicos u otros— en las herramientas de apoyo de IA que integra, en concordancia con la Ley 1581 de 2012 de Colombia (Régimen General de Protección de Datos Personales). El texto original de esa regla, presente en el artefacto monolítico (`ArtefactoUnal/artefacto_MML_esqueleto_11_pantallas.html`, líneas 3708-3717), establece:

> «Uso responsable de la IA: la inteligencia artificial se utiliza como apoyo para revisar, comparar y formular propuestas. El criterio metodológico y las decisiones finales pertenecen al formulador. No introduzca en herramientas de IA nombres de personas naturales, números de identificación, teléfonos, correos electrónicos ni otros datos personales. El artefacto mantiene esta prohibición como regla permanente, en concordancia con la Ley 1581 de 2012.»

Esta declaración tiene una consecuencia directa sobre el despliegue: como la aplicación no recolecta, transmite ni almacena datos personales en ningún servidor —todo el estado vive en el navegador del formulador—, ninguna de las alternativas de hosting analizadas en este documento implica un tratamiento de datos personales que deba registrarse ante la autoridad de protección de datos ni que exija cláusulas contractuales de encargo de tratamiento. El cumplimiento de la Ley 1581 de 2012 se sostiene, en este caso, en el diseño mismo de la aplicación (ausencia de recolección) y no en una medida de infraestructura.

La restricción más determinante para el despliegue, sin embargo, proviene de una decisión de arquitectura ya tomada (decisión 5 del registro): las 11 pantallas de la aplicación se cargan como parciales HTML desde la carpeta `views/` mediante `fetch`. Esto tiene una implicación que condiciona todo lo que sigue: **la aplicación no puede ejecutarse abriendo `index.html` con doble clic**. Bajo el esquema `file://`, los navegadores bloquean las peticiones `fetch` por política de CORS (Cross-Origin Resource Sharing), ya que cada archivo local se trata como un origen distinto. En consecuencia, la aplicación requiere **siempre** un servidor HTTP —por mínimo que sea— incluso durante el desarrollo local y las pruebas manuales. Esta restricción no es negociable dentro del stack ya elegido (ES Modules nativos sin build, decisión 1) y se traslada íntegramente a las dimensiones B y C de este análisis: cualquier alternativa de servidor u hosting debe, como mínimo, servir archivos por HTTP con las cabeceras MIME correctas para `.js`, `.css`, `.html` y `.json`.

En síntesis, el problema de despliegue que resuelve este documento es acotado: **cómo servir un conjunto de archivos estáticos por HTTP**, de la manera más simple posible, en un contexto de taller académico de un Laboratorio DevOps, sin backend, sin base de datos y sin tratamiento de datos personales.

---

## 2. Dimensión A · Arquitectura frontend

Esta dimensión evalúa el modelo de construcción y entrega del código JavaScript/CSS/HTML del cliente. La decisión 1 del registro ya fijó "ES Modules sin build" como stack elegido; aquí se contrasta esa opción contra las alternativas descartadas, para que la decisión final de este documento (sección 6) pueda argumentarse con el mismo rigor que las demás.

### 2.1 ES Modules nativos (sin bundler)

**Funcionamiento:** el navegador interpreta directamente los archivos `.js` marcados como `type="module"` en el HTML, resolviendo los `import`/`export` en tiempo de ejecución mediante peticiones HTTP independientes por cada módulo. No existe paso de compilación ni transformación: el código que se escribe es, literalmente, el código que ejecuta el navegador.

**Beneficios:** cero dependencias de terceros, sin `package.json` ni `node_modules`; el ciclo de edición es instantáneo (guardar y recargar, sin build intermedio); la depuración en las herramientas del navegador corresponde exactamente al código fuente, sin mapas de origen (`source maps`) que reconstruir; el despliegue consiste en copiar archivos, sin artefactos de compilación que puedan divergir del código fuente.

**Costos:** cada módulo importado genera una petición HTTP independiente (en este proyecto, del orden de varias decenas de archivos entre `core/`, `utils/` y `pasos/`), lo que en un enlace lento incrementa la latencia inicial frente a un único archivo empaquetado; no hay minificación ni *tree-shaking*, por lo que el peso transferido es mayor que el de un bundle optimizado; la compatibilidad con navegadores antiguos (Internet Explorer, versiones muy antiguas de navegadores móviles) queda fuera de alcance.

**Soporte de navegador:** los ES Modules nativos cuentan con soporte estable y generalizado en todos los navegadores modernos (Chrome, Firefox, Safari, Edge) desde hace varios años; dado que el artefacto original ya asume un navegador moderno (usa `<details>`, SVG generado dinámicamente y APIs de portapapeles), esta restricción no introduce ninguna limitación adicional real.

**Implicación sobre el despliegue:** ninguna especial más allá de la ya señalada en la sección 1 (requiere servidor HTTP por el uso combinado de módulos y `fetch` para los parciales). No exige ningún paso de build antes de publicar: los archivos del repositorio son, directamente, los archivos que se sirven en producción.

### 2.2 Vite

**Funcionamiento:** herramienta de build y servidor de desarrollo que combina un servidor con recarga en caliente (Hot Module Replacement) basado en ES Modules nativos durante el desarrollo, con un empaquetado de producción mediante Rollup que genera archivos minificados, con *code-splitting* y *tree-shaking*.

**Beneficios:** recarga en caliente sin perder el estado de la aplicación durante el desarrollo; bundle de producción optimizado (menos peticiones HTTP, archivos minificados); soporte de primera clase para TypeScript, CSS con preprocesadores y otros formatos sin configuración adicional.

**Costos:** introduce `package.json`, `node_modules` y una dependencia de Node.js para construir el proyecto; añade un paso de build antes de cada despliegue, que debe ejecutarse y verificarse; el código fuente deja de ser literalmente el código servido, lo que introduce una capa de indirección al depurar en producción (aunque mitigable con *source maps*); para un proyecto sin dependencias externas como este, buena parte del valor de un bundler (gestión de paquetes de npm) no se aprovecha.

**Soporte de navegador:** el bundle de producción puede dirigirse a navegadores más antiguos mediante *transpilación*, pero eso no es una necesidad de este proyecto.

**Implicación sobre el despliegue:** exige un paso de build (`vite build`) previo a cada publicación, y por tanto una máquina o pipeline con Node.js disponible en el momento de desplegar, no solo en el de servir. El resultado (carpeta `dist/`) sigue siendo estático y por tanto compatible con cualquiera de las opciones de hosting de la sección 3.

### 2.3 Webpack

**Funcionamiento:** empaquetador configurable mediante grafos de dependencias y *loaders*, predecesor histórico de Vite en popularidad. Igual que Vite, produce un bundle de producción a partir del código fuente.

**Beneficios:** ecosistema muy maduro de *plugins* y *loaders*; alta flexibilidad de configuración para necesidades no estándar.

**Costos:** configuración sensiblemente más verbosa y con mayor curva de aprendizaje que Vite para lograr el mismo resultado; el servidor de desarrollo no usa ES Modules nativos de la misma manera que Vite, por lo que los tiempos de arranque y recarga en desarrollo suelen ser mayores en proyectos comparables; misma dependencia de Node.js y de un paso de build que Vite.

**Soporte de navegador:** equivalente a Vite: configurable según el público objetivo.

**Implicación sobre el despliegue:** las mismas que Vite (build previo obligatorio, resultado estático), con un costo de configuración mayor sin un beneficio claro para un proyecto de este tamaño y sin dependencias.

### 2.4 Frameworks SPA (React, Vue)

**Funcionamiento:** bibliotecas de UI basadas en componentes con renderizado declarativo y gestión de estado reactiva, que reemplazan la manipulación directa del DOM por una capa de reconciliación (virtual DOM en React, DOM reactivo compilado en Vue). Requieren, en la práctica, un bundler (típicamente Vite) para su flujo de desarrollo y build.

**Beneficios:** modelo de componentes reutilizables; gestión de estado con patrones establecidos; ecosistema amplio de librerías y herramientas de depuración especializadas.

**Costos:** para este proyecto, adoptar un framework SPA no es una migración sino una **reescritura completa** del renderizado: el artefacto original resuelve la interfaz mediante 31 asignaciones directas a `innerHTML` y manipulación imperativa del DOM, un patrón incompatible con el modelo declarativo de React o Vue. Reescribir esa capa multiplicaría el alcance del proyecto muy por encima del de una migración estructural, con el consiguiente riesgo de introducir regresiones funcionales en una aplicación que, además, no cuenta con pruebas automatizadas (decisión 6 del registro).

**Soporte de navegador:** equivalente al de Vite/Webpack, dado que dependen del mismo tipo de *pipeline* de build.

**Implicación sobre el despliegue:** idéntica a la de un bundler (build previo, resultado estático), pero el costo relevante de esta opción no está en el despliegue sino en el desarrollo: es la alternativa descartada con mayor diferencia en la decisión 1 del registro, precisamente porque equivaldría a un proyecto nuevo y no a una migración del código vanilla existente.

### 2.5 Síntesis de la dimensión A

Las cuatro opciones producen, al final, un conjunto de archivos que se sirve de forma estática; la diferencia real entre ellas está en el costo de desarrollo y mantenimiento, no en el despliegue en sí. ES Modules nativos es la única opción sin paso de build, coherente con un código fuente que ya es JavaScript vanilla y con la decisión explícita de minimizar el riesgo de regresión durante la migración.

---

## 3. Dimensión B · Servidor y hosting

Dado que la aplicación exige servidor HTTP incluso en desarrollo (sección 1), esta dimensión distingue entre **servidores de desarrollo** (uso local, transitorio) y **opciones de servidor/hosting de producción** (publicación pública o compartida del artefacto).

### 3.1 Servidores de desarrollo

**`python3 -m http.server`**
Servidor HTTP incluido en la biblioteca estándar de Python (disponible en la máquina de desarrollo: Python 3.12.3), que sirve el directorio actual sin ninguna instalación ni configuración adicional. Basta con ejecutar el comando en la raíz del proyecto para obtener un servidor funcional en `http://localhost:8000`. Es la opción de menor fricción para desarrollo y para las verificaciones manuales pantalla por pantalla que exige la ausencia de pruebas automatizadas (decisión 6 del registro): no requiere instalar nada más allá de lo que ya trae el sistema operativo.

**`npx serve`**
Paquete de Node.js (ejecutable sin instalación previa gracias a `npx`, disponible con npm 10.8.2) que sirve un directorio como sitio estático, con soporte de compresión y cabeceras razonables por defecto. Es una alternativa equivalente a `http.server` cuando se prefiere mantenerse en el ecosistema de Node en lugar del de Python; no aporta ninguna ventaja decisiva para este proyecto frente a la opción de Python, dado que ambas cubren la misma necesidad (servir archivos estáticos sin configuración).

Ambas opciones son intercambiables para el propósito de desarrollo local; la elección entre una y otra es indiferente para el resultado del despliegue y puede documentarse como preferencia del equipo (por ejemplo, en un `README.md`) sin que ello constituya una decisión de arquitectura.

### 3.2 Servidores de producción autoadministrados

**Nginx**
Servidor HTTP y proxy inverso de alto rendimiento, ampliamente usado para servir contenido estático. Configurarlo para este proyecto exigiría, como mínimo, un bloque `server` con `root` apuntando al proyecto, tipos MIME correctos para `.js` como módulo (`application/javascript` o `text/javascript`) y, opcionalmente, compresión `gzip`/`brotli` y cabeceras de caché. Es la opción natural si se optara por autoadministrar el servidor (por ejemplo, dentro de un contenedor Docker, véase sección 4.2), pero exige mantener un proceso, un sistema operativo subyacente y su superficie de parches de seguridad, algo que una aplicación sin backend ni datos sensibles en servidor no justifica por sí sola.

**Apache (httpd)**
Alternativa histórica a Nginx con capacidades equivalentes para servir contenido estático (mediante `mod_mime` y la configuración habitual de `DocumentRoot`). No aporta ninguna ventaja sobre Nginx para este caso de uso; su inclusión en este análisis responde a que es una opción de referencia habitual en cualquier comparación de servidores web, no a que se considere preferible aquí.

**Node/Express**
Framework de aplicaciones web sobre Node.js. Permitiría servir los archivos estáticos mediante `express.static()` en unas pocas líneas, y dejaría abierta la puerta a añadir rutas de API en el futuro. Para una aplicación puramente estática esto es sobredimensionado: exige mantener un proceso Node.js corriendo de forma indefinida, gestionar su ciclo de vida (reinicios, actualización de dependencias, monitorización) y su superficie de seguridad, todo para un beneficio —servir archivos— que un servidor estático o una plataforma de hosting resuelven sin ese costo operativo.

**Implicación común:** las tres opciones autoadministradas comparten un mismo costo de fondo: requieren aprovisionar y mantener un servidor (máquina virtual, contenedor persistente o equivalente) con el tiempo de actividad, los parches de seguridad y la administración que ello conlleva. Para una SPA estática sin backend, este costo operativo no tiene contrapartida funcional: no hay lógica de servidor que ejecutar, ni datos que proteger en ese servidor, más allá de servir bytes.

### 3.3 Plataformas de hosting estático

**GitHub Pages**
Publica directamente el contenido de un repositorio (o de una rama/carpeta designada) como sitio estático, sin necesidad de configurar servidor alguno. Sin costo en el plan gratuito para repositorios públicos. El despliegue se limita a hacer *push* al repositorio; GitHub reconstruye y publica el sitio automáticamente. Existe un límite de tamaño del sitio publicado, que GitHub describe como pensado para sitios de tamaño moderado (del orden de unos pocos cientos de megabytes); este proyecto, sin imágenes ni dependencias empaquetadas, está muy por debajo de cualquier umbral de ese tipo. Sirve automáticamente las cabeceras MIME correctas para `.js`, `.css`, `.html` y `.json`, por lo que es compatible sin ajustes con el requisito de ES Modules vía `fetch`.

**Netlify**
Plataforma de hosting estático con integración continua desde un repositorio Git: cada `push` dispara un despliegue automático. Ofrece un plan gratuito orientado a proyectos personales y de este tamaño, con dominio de subdominio propio y HTTPS automático. Añade capacidades no necesarias para este proyecto (funciones *serverless*, redirecciones avanzadas, *previews* por *pull request*) que no perjudican pero tampoco aportan valor a una aplicación sin backend.

**Vercel**
Equivalente a Netlify en propósito y modelo (integración continua desde Git, HTTPS automático, plan gratuito para proyectos personales), con un enfoque histórico más orientado a frameworks de frontend con *server-side rendering*, algo que este proyecto no utiliza. Para servir archivos estáticos, su comportamiento es prácticamente indistinguible del de Netlify.

**Cloudflare Pages**
Hosting estático sobre la red de distribución de contenido (CDN) de Cloudflare, con despliegue automático desde Git y plan gratuito para proyectos de este tamaño. Su principal diferencial frente a GitHub Pages, Netlify o Vercel es la infraestructura de CDN de Cloudflare, que puede traducirse en tiempos de respuesta más uniformes según la ubicación geográfica de quien accede; para un taller académico esta diferencia es irrelevante en la práctica.

**Firebase Hosting**
Servicio de hosting estático de Google Cloud, con despliegue mediante una CLI dedicada (`firebase deploy`) en lugar de integración automática por `push` a un repositorio (aunque puede configurarse también con GitHub Actions). Ofrece un plan gratuito para proyectos pequeños. Su valor diferencial está en la integración con el resto de servicios de Firebase (autenticación, base de datos en tiempo real, funciones), ninguno de los cuales tiene cabida en una aplicación sin backend como esta; adoptarlo introduciría una dependencia de cuenta y CLI de Google sin beneficio correspondiente.

**Síntesis de las plataformas de hosting estático:** las cinco opciones son funcionalmente equivalentes para las necesidades de este proyecto —servir archivos estáticos por HTTPS, sin costo en sus respectivos planes gratuitos para uso de este tamaño— y todas resuelven de forma directa el requisito de servidor HTTP de la sección 1. La diferencia entre ellas es marginal y se reduce, en la práctica, a la comodidad de integración con el flujo de trabajo ya elegido (git, decisión 8 del registro) y a la ausencia de cuentas o servicios adicionales que administrar.

---

## 4. Dimensión C · Empaquetado y automatización

### 4.1 Despliegue manual

Consiste en copiar o sincronizar los archivos del proyecto al destino de hosting sin ningún paso intermedio de compilación ni ninguna canalización automatizada: en el caso de una plataforma integrada con Git (GitHub Pages, Netlify, Vercel, Cloudflare Pages), el propio `git push` constituye el "despliegue"; no hay artefacto distinto que generar, porque los archivos servidos son los mismos que los del repositorio (consecuencia directa de la ausencia de build en la dimensión A).

**Beneficios:** ausencia total de infraestructura que mantener o depurar; el despliegue es tan confiable como el propio control de versiones; no hay divergencia posible entre "lo que hay en el repositorio" y "lo que está publicado", más allá del tiempo que tarde la plataforma en propagar el cambio.

**Costos:** no hay ninguna verificación automática (lint, pruebas, revisión de tamaño de archivos) antes de que un cambio quede publicado; toda comprobación depende de la disciplina de quien hace el `push`, en línea con el riesgo ya asumido en la decisión 6 del registro (ausencia de pruebas automatizadas).

### 4.2 Docker con Nginx

Empaquetar el proyecto como una imagen Docker que incluya Nginx configurado para servir los archivos estáticos permitiría reproducir el entorno de servicio de forma idéntica en cualquier máquina con Docker instalado (disponible en el entorno de desarrollo: Docker 29.1.3), y sería coherente con la naturaleza del taller ("Laboratorio DevOps").

**Beneficios:** reproducibilidad exacta del entorno de servicio entre máquinas distintas; portabilidad hacia cualquier proveedor que acepte contenedores; útil como ejercicio pedagógico explícito de contenerización.

**Costos:** para una aplicación cuyo "servicio" consiste en repartir bytes estáticos sin lógica de servidor, envolverla en un contenedor con su propio sistema operativo base, su propio proceso Nginx y su propia superficie de actualización de seguridad es una capa de complejidad que no resuelve ningún problema presente del proyecto: no hay diferencias de entorno entre desarrollo y producción que reproducir (no hay versión de intérprete, librería del sistema o variable de entorno de la que depender), porque la aplicación no ejecuta código en el servidor. Añade, además, un `Dockerfile` y (para orquestar el contenedor) típicamente un `docker-compose.yml`, ambos expresamente excluidos del alcance de esta tarea por la decisión 4 del registro.

**Implicación sobre el despliegue:** viable y coherente con el contexto de "Laboratorio DevOps", pero no resuelve ninguna necesidad no cubierta ya por una plataforma de hosting estático (sección 3.3); su valor sería principalmente pedagógico (demostrar contenerización) o de portabilidad hacia un proveedor que exija contenedores, ninguno de los cuales es un requisito actual del proyecto.

### 4.3 CI/CD con GitHub Actions

Un flujo de integración continua ejecutaría, en cada `push`, pasos de verificación —por ejemplo, `node --test` si en el futuro se incorporan pruebas automatizadas (actualmente descartadas por la decisión 6 del registro), o un `linter`— antes de disparar el despliegue hacia la plataforma de hosting elegida.

**Beneficios:** introduce una puerta de calidad automática antes de publicar, mitigando el riesgo señalado en 4.1 (ausencia de verificación previa al despliegue manual); es una práctica estándar y reconocible en un contexto de Laboratorio DevOps; se integra de forma nativa con GitHub Pages si esa fuera la plataforma elegida.

**Costos:** el beneficio real de un flujo de CI/CD en este proyecto está condicionado a que exista algo que verificar automáticamente; hoy no hay pruebas automatizadas (decisión 6) ni un paso de build (decisión 1), por lo que un workflow de GitHub Actions en el estado actual del proyecto se reduciría, en la práctica, a repetir lo que ya hace `git push` hacia una plataforma con integración nativa (sección 3.3), sin verificación adicional que aportar. Su valor crecería de forma natural si en una fase posterior se incorporan pruebas (`node --test`, ya evaluado y descartado por ahora en la decisión 6) o un *linter*.

**Implicación sobre el despliegue:** no aporta valor incremental mientras el proyecto carezca de pasos de verificación automatizable; se identifica aquí como la extensión natural del proyecto si en el futuro se retoma la decisión 6 y se incorporan pruebas. Su adopción queda, por la decisión 4 del registro, fuera del alcance de archivos que esta tarea produce.

---

## 5. Cuadro comparativo

Los criterios se ponderan **antes** de puntuar las opciones, para evitar ajustar los pesos a posteriori en función del resultado. Los pesos reflejan el contexto del proyecto: un taller académico de un Laboratorio DevOps, con una SPA estática sin backend, sin pruebas automatizadas y con un único responsable a cargo del despliegue.

| Criterio | Peso | Justificación del peso |
|---|---|---|
| Encaje con el taller DevOps | 20 % | Es un taller de un Laboratorio DevOps: la solución debe ser explicable y defendible como decisión de despliegue, no solo funcional. |
| Reproducibilidad | 20 % | Sin pruebas automatizadas (decisión 6), la confianza en que "lo publicado es lo que hay en el repositorio" recae en gran medida en que el despliegue sea determinista. |
| Complejidad de configuración | 20 % | Un único responsable, sin equipo de operaciones, ejecuta el despliegue; la complejidad de configurar y mantener la solución es un costo recurrente, no de una sola vez. |
| Mantenibilidad | 15 % | El proyecto tiene una vida esperada de taller académico; una solución difícil de mantener consumiría tiempo que compite con el desarrollo funcional. |
| Costo | 10 % | Relevante, pero todas las opciones de hosting estático evaluadas son gratuitas en el uso de este tamaño; el criterio pesa poco porque no diferencia mucho entre las opciones candidatas. |
| Curva de aprendizaje | 10 % | El responsable ya conoce git y servidores HTTP básicos; el costo de aprendizaje adicional de cada opción es moderado en todos los casos. |
| Rendimiento | 5 % | Una SPA estática de este tamaño, sin imágenes pesadas ni dependencias externas, no tiene una necesidad de rendimiento que discrimine seriamente entre las opciones candidatas. |

Escala de puntuación: 1 (deficiente) a 5 (excelente) por criterio. Se puntúan las combinaciones más representativas de cada dimensión, no todas las opciones evaluadas en las secciones 2-4, para mantener el cuadro legible.

| Opción | Complejidad (20 %) | Costo (10 %) | Rendimiento (5 %) | Reproducibilidad (20 %) | Curva de aprendizaje (10 %) | Encaje DevOps (20 %) | Mantenibilidad (15 %) | Total ponderado |
|---|---|---|---|---|---|---|---|---|
| ES Modules + GitHub Pages (manual) | 5 | 5 | 3 | 4 | 5 | 3 | 5 | **4,25** |
| ES Modules + Netlify/Vercel (manual) | 5 | 5 | 4 | 4 | 5 | 3 | 5 | **4,35** |
| Vite + bundler + hosting estático | 3 | 5 | 4 | 4 | 3 | 3 | 3 | **3,50** |
| ES Modules + Docker/Nginx (autoadministrado) | 2 | 3 | 3 | 5 | 2 | 5 | 2 | **3,05** |
| ES Modules + hosting estático + CI/CD (GitHub Actions) | 3 | 5 | 3 | 5 | 3 | 5 | 4 | **3,95** |

**Lectura del cuadro:** la puntuación más alta corresponde a "ES Modules + Netlify/Vercel (manual)" (4,35), seguida muy de cerca por "ES Modules + GitHub Pages (manual)" (4,25); ambas comparten el mismo patrón (sin build, sin contenedor, despliegue disparado por `push`) y superan tanto a la variante con bundler como a la variante con Docker o con CI/CD explícito. La opción con Docker/Nginx obtiene la puntuación más baja pese a anotar el máximo en "encaje con el taller DevOps" y en "reproducibilidad": el peso combinado de complejidad, curva de aprendizaje y mantenibilidad —los tres criterios en los que un contenedor autoadministrado penaliza más— es suficiente para que el resultado ponderado no la favorezca.

---

## 6. Decisión final

**Decisión: ES Modules nativos, sin bundler, servidos como sitio estático mediante GitHub Pages, con despliegue manual disparado por `git push` (sin workflow de CI/CD en esta etapa).**

### 6.1 Coherencia con las decisiones ya tomadas

Esta decisión es directamente consistente con el registro de decisiones técnicas:

- **Decisión 1 (Stack: ES Modules sin build).** El análisis de la dimensión A (sección 2) confirma que ES Modules nativos es la única opción sin paso de compilación, coherente con un código fuente que ya es JavaScript vanilla.
- **Decisión 3 (Persistencia: estático + `localStorage`).** Ninguna de las opciones de hosting estático evaluadas (sección 3.3) requiere ni permite lógica de servidor; todas son compatibles, sin ajuste alguno, con una aplicación cuyo único estado vive en el navegador.
- **Decisión 5 (HTML: `index.html` + parciales por `fetch`).** El requisito de servidor HTTP que esta decisión implica (sección 1) queda resuelto de forma directa por cualquier plataforma de hosting estático, sin necesidad de servidor autoadministrado ni de contenedor.
- **Decisión 4 (DevOps: solo análisis, sin archivos).** Este mismo documento analiza Docker y CI/CD a fondo (secciones 4.2 y 4.3) sin producir `Dockerfile`, `docker-compose.yml` ni workflows.

El cuadro comparativo de la sección 5 no requirió ningún ajuste de pesos para llegar a este resultado: la combinación "ES Modules + hosting estático + despliegue manual" obtuvo la puntuación ponderada más alta con los pesos declarados de antemano. **No hay discrepancia que registrar** entre el resultado del cuadro comparativo y las decisiones 1, 3 y 5 ya tomadas.

### 6.2 Sobre la plataforma concreta de hosting

Dentro de las plataformas de hosting estático evaluadas, GitHub Pages y Netlify/Vercel obtuvieron puntuaciones casi idénticas (4,25 y 4,35 respectivamente), con una diferencia que en la práctica corresponde a un único criterio (rendimiento, con el peso más bajo del cuadro) y que no es decisiva. Se recomienda **GitHub Pages** como plataforma de referencia para este proyecto, no porque el cuadro lo imponga con holgura, sino por dos razones adicionales que el cuadro comparativo no captura de forma explícita: el proyecto ya vive en un repositorio Git desde su inicio (decisión 8 del registro) y GitHub Pages no exige dar de alta ninguna cuenta ni servicio adicional al que ya aloja el código; y su modelo de "el repositorio es el sitio" es el más transparente para un ejercicio académico que otra persona deba poder auditar o reproducir sin credenciales de terceros. Esta preferencia es una recomendación operativa, no una decisión que condicione la arquitectura del proyecto: cualquiera de las plataformas de la sección 3.3 serviría igual de bien si en el futuro se optara por otra.

### 6.3 Qué se descarta y por qué

- **Vite/Webpack (dimensión A).** Descartados ya en la decisión 1 del registro; el cuadro comparativo confirma el descarte desde la óptica del despliegue: la variante con bundler pierde 0,85 puntos frente a la opción elegida, principalmente por mayor complejidad de configuración y menor mantenibilidad, sin que el beneficio de un bundle optimizado tenga contrapartida real en un proyecto de este tamaño y sin dependencias externas.
- **Frameworks SPA (React/Vue).** Descartados en la decisión 1 por implicar una reescritura, no una migración; no se puntúan en el cuadro comparativo porque su costo decisivo está en el desarrollo, no en el despliegue, y ya quedó argumentado en el registro.
- **Servidores autoadministrados (Nginx, Apache, Node/Express) fuera de un contenedor.** Descartados por el mismo motivo que Docker: exigen aprovisionar y mantener un proceso de servidor de forma indefinida para una aplicación que no necesita ejecutar ningún código en el servidor. Se analizan en la sección 3.2 pero no se puntúan de forma independiente en el cuadro porque su patrón de costos coincide, en lo esencial, con el de Docker/Nginx (sección 4.2), que sí se puntuó y obtuvo la posición más baja.
- **Docker con Nginx.** Analizado a fondo en la sección 4.2 y puntuado en el cuadro comparativo, donde obtiene la puntuación más baja (3,05) pese a liderar en reproducibilidad y en encaje con el taller DevOps: el costo de complejidad, curva de aprendizaje y mantenibilidad que introduce no tiene, hoy, ningún problema real que resolver, porque no existen diferencias de entorno entre "desarrollo" y "producción" que reproducir en una aplicación sin lógica de servidor. Se descarta para esta etapa, no de forma permanente (véase la ruta de evolución en 6.4).
- **CI/CD con GitHub Actions.** Analizado en la sección 4.3 y puntuado (3,95): pierde frente a la opción elegida principalmente porque, en ausencia de pruebas automatizadas (decisión 6) y de paso de build (decisión 1), un workflow no tendría hoy ningún paso de verificación real que ejecutar antes de desplegar; se limitaría a repetir la integración que ya ofrece de forma nativa una plataforma como GitHub Pages. Se descarta por ahora, con una condición explícita de reconsideración (véase 6.4).

### 6.4 Ruta de evolución

Esta decisión no es definitiva para el ciclo de vida completo del proyecto; conviene dejar explícitas las condiciones bajo las cuales tendría sentido revisarla:

- **Incorporar un bundler (Vite)** tendría sentido si el proyecto llegara a acumular un número de módulos ES lo bastante grande como para que la latencia de las peticiones HTTP individuales por módulo se volviera perceptible en la práctica, o si se decidiera, en una fase posterior, retomar la opción descartada en la decisión 1 de tipar el código con TypeScript. Ninguna de las dos condiciones se cumple en el estado actual del proyecto.
- **Incorporar CI/CD con GitHub Actions** tendría sentido en cuanto se revirtiera la decisión 6 del registro y se incorporaran pruebas automatizadas (`node --test`, ya evaluado como opción viable en esa decisión) o un *linter*: en ese momento, un workflow dejaría de ser una réplica del despliegue nativo de la plataforma de hosting para pasar a ser una puerta de calidad real antes de publicar.
- **Incorporar Docker** tendría sentido si el proyecto necesitara, en algún momento, desplegarse en un proveedor que no ofrezca hosting estático nativo (por ejemplo, infraestructura propia sin integración con plataformas como las de la sección 3.3), o si el ejercicio pedagógico de contenerización se convirtiera en un objetivo explícito del taller distinto del despliegue del artefacto en sí. Mientras el destino de publicación siga siendo una plataforma de hosting estático, un contenedor no resuelve ningún problema pendiente.

Mientras la aplicación se mantenga estática, sin backend y sin pruebas automatizadas, la combinación de ES Modules nativos con una plataforma de hosting estático y despliegue manual sigue siendo la opción más simple capaz de cumplir todos los requisitos del proyecto, y es la que se recomienda mantener.

---

## 7. Contraste con la implementación realizada

El proyecto modular se construyó completamente después de escribir este análisis (21 tareas, 30 commits sobre la rama `implementacion-modular`, revisados en `docs/decisiones-tecnicas.md` §8). Esta sección verifica que las premisas de las secciones 1 a 6 se cumplen en el código real, no solo en el plan.

**La premisa de la sección 1 se sostiene sin excepción.** El proyecto terminado no tiene backend, no tiene base de datos y no tiene mecanismo de autenticación: la totalidad de la lógica —35 módulos JavaScript— se ejecuta en el navegador. El repositorio no contiene `package.json` ni ninguna dependencia declarada, lo que confirma en la práctica el análisis de la dimensión A: "ES Modules nativos" no fue solo la opción de menor costo sobre el papel, es literalmente lo único que hay en el árbol final.

**El requisito de servidor HTTP (sección 1, párrafo 4) se confirmó de la forma más directa posible: fallando primero.** Durante la construcción, el propio router de la aplicación (`js/core/router.js`) se diseñó y probó deliberadamente contra el escenario de `fetch` fallido bajo `file://`, y el código incluye desde el primer commit un mensaje explicativo en pantalla para ese caso exacto — la restricción que este documento predijo en la sección 1 no es una advertencia teórica, es una rama de código real y ejercitada.

**La dimensión C (empaquetado y automatización) se cumplió literalmente.** El repositorio, ya publicado en `https://github.com/LaboratorioDevOps/TallerFormulacionProyectosModular`, no contiene `Dockerfile`, `docker-compose.yml` ni ningún workflow de GitHub Actions — exactamente lo que la decisión 4 del registro y la sección 4 de este documento anticipaban. El despliegue manual analizado en 4.1 ("el propio `git push` constituye el despliegue") es hoy literalmente ejecutable: el repositorio existe en GitHub, de modo que activar GitHub Pages sobre la rama `main` — la recomendación de la sección 6.2 — es una acción de configuración, no una tarea pendiente de infraestructura.

**Un matiz que este documento no anticipó, y que conviene incorporar a la sección 6.4 (ruta de evolución).** El análisis de la dimensión A no consideraba el costo de que la ausencia de bundler significa también ausencia de cualquier paso de verificación automática antes de publicar — ni *linter*, ni comprobación de tipos, ni *tree-shaking* que fallaría ante un import roto. La revisión final de la implementación (`docs/decisiones-tecnicas.md` §8, decisión 6) encontró dos bugs que bloqueaban el uso normal de la aplicación y que ni la ausencia de build ni la verificación estática (`tools/verificar.sh`) detectaron por sí solas; se necesitó una lectura completa del código para encontrarlos. Esto no invalida la decisión de prescindir de un bundler —ninguna de las dos herramientas (Vite o un *linter* independiente) los habría detectado tampoco, porque eran errores de lógica de la aplicación, no de sintaxis ni de tipos—, pero sí refuerza la condición ya escrita en la sección 6.4: el momento en que un flujo de CI/CD (sección 4.3, hoy descartado por falta de algo que verificar) empiece a aportar valor real es el mismo momento en que se incorporen pruebas automatizadas capaces de ejercitar esos caminos de código, no antes.
