# LAB-05: Infraestructura como Codigo con Terraform

**Curso:** IF-1116 - Topicos de Tecnologias de Informacion  
**Semana:** 09  
**Semestre:** 2026-II  
**Repositorio:** ConnieDR8/ConnieDR8.github.io

## Objetivo

Implementar y administrar infraestructura en Google Cloud mediante Terraform, utilizando configuraciones declarativas, planes de ejecucion, gestion del estado y modulos reutilizables.

## Evidencias

| Laboratorio | Puntaje | Captura | Carpeta | Estado |
|---|---|---|---|---|
| GSP233 | 100/100 (3 puntos) | [Ver evidencia](evidencia/gsp233.png) | [01-gsp233](01-gsp233/) | Completado |
| GSP497 | Pendiente | [Ver evidencia](evidencia/gsp497.png) | [02-gsp497](02-gsp497/) | Pendiente |
| GSP345 | Pendiente | [Ver evidencia](evidencia/gsp345.png) | [03-gsp345](03-gsp345/) | Pendiente |

## Bitacora

### GSP233 - Kubernetes Load Balancer

**Fecha:** 06/11/2026  
**Resultado:** 100/100

**Objetivo:** Desplegar un cluster GKE mediante Terraform y publicar NGINX usando un servicio Kubernetes de tipo LoadBalancer.

**Actividades realizadas:**

1. Se inicio el laboratorio en Google Skills utilizando las credenciales temporales.
2. Se descargo el proyecto oficial `tf-gke-k8s-service-lb`.
3. Se revisaron los archivos `main.tf`, `k8s.tf` y `versions.tf`.
4. Se ejecuto `terraform init` para inicializar el entorno.
5. Se reviso el plan generado por Terraform antes de confirmar su ejecucion.
6. Se ejecuto `terraform apply` con la region y zona de la sesion.
7. Se verifico la creacion del cluster GKE y la respuesta HTTP de NGINX.
8. Se comprobo la puntuacion final del laboratorio: 100/100.

**Configuracion utilizada:**

| Parametro | Valor |
|---|---|
| Proyecto temporal | `qwiklabs-gcp-01-90eee82429b5` |
| Region | `us-central1` |
| Zona | `us-central1-c` |
| Cluster | `tf-gke-k8s` |
| Nodos | 3 |
| Provider Google | `8.10.0` |
| Provider Kubernetes | `1.10.0` |
| IP externa | `34.133.18.112` |

**Comandos principales:**

~~~bash
terraform init

terraform apply -var="region=us-central1" -var="location=us-central1-c"

curl http://34.133.18.112
~~~

**Revision del plan:**

El resultado previo a confirmar el despliegue fue:

~~~text
Plan: 7 to add, 0 to change, 0 to destroy.
~~~

Se verifico que Terraform no planificara modificaciones ni destrucciones.

El contenido se conserva en `01-gsp233/plan-inicial.txt`. El plan fue capturado de la salida de `terraform apply`, antes de introducir `yes`, y no de una ejecucion independiente de `terraform plan`.

**Verificacion del servicio:**

La respuesta HTTP incluyo:

~~~html
<h1>Welcome to nginx!</h1>
~~~

Esto confirmo que el servicio NGINX era accesible mediante la IP externa del balanceador.

**Dificultades:**

Durante un primer intento, Cloud Shell no tenia configurado el Project ID y Terraform no pudo identificar el proyecto de Google Cloud. Ademas, se presento un bloqueo temporal del estado durante una operacion de planificacion.

La primera sesion finalizo antes de completar el laboratorio.

**Solucion aplicada:**

Se identifico el problema del proyecto mediante `gcloud config get-value project` y se utilizo `gcloud config set project` para establecer el identificador temporal correcto.

Posteriormente se ejecuto nuevamente el laboratorio en una sesion independiente, se completo el despliegue y se obtuvo 100/100.

**Que cambiaria:**

Verificaria el Project ID desde el inicio y conservaria los archivos de evidencia durante la ejecucion, para evitar depender del tiempo restante de Cloud Shell.

**Archivos entregados:**

- `01-gsp233/main.tf`
- `01-gsp233/k8s.tf`
- `01-gsp233/versions.tf`
- `01-gsp233/plan-inicial.txt`

**Captura del resultado:**

![GSP233 - Puntuacion 100 de 100](evidencia/gsp233.png)

**Captura del cluster GKE:**

![GSP233 - Cluster GKE de tres nodos](evidencia/gsp233-cluster.png)

### GSP497 - Cloud Operations for GKE

**Actividades:** Pendiente.

**Dificultades:** Pendiente.

**Que cambiaria:** Pendiente.

### GSP345 - Terraform Challenge Lab

**Actividades:** Pendiente.

**Dificultades:** Pendiente.

**Que cambiaria:** Pendiente.

## Uso de IA

Se utilizo ChatGPT como herramienta de apoyo para interpretar el enunciado, organizar las evidencias y analizar la configuracion Terraform.

**GSP233:**

- Se consultaron errores relacionados con la configuracion del Project ID.
- Se analizaron las diferencias entre `terraform init`, `terraform plan` y `terraform apply`.
- Se reviso el resumen del plan de infraestructura antes de confirmar su ejecucion.
- Se recibio asistencia para organizar los archivos y redactar la bitacora.

**Correcciones realizadas por el estudiante:**

- Se identificaron enlaces incorrectos entre los laboratorios GSP233 y GSP497.
- Se configuro manualmente el Project ID cuando Cloud Shell no lo selecciono automaticamente.
- Se repitio la ejecucion del GSP233 en una nueva sesion tras finalizar la primera.
- Se verifico el cluster GKE, el servicio NGINX y la puntuacion 100/100.
- Se decidio conservar las capturas originales sin modificaciones.

Todos los recursos fueron desplegados directamente por el estudiante en su sesion de Google Cloud.

Las evidencias corresponden a resultados autenticos del laboratorio. La asistencia de IA se utilizo para orientacion tecnica y documentacion, no para sustituir la ejecucion practica.

Las contribuciones de IA correspondientes a GSP497 y GSP345 se documentaran cuando se ejecuten dichos laboratorios.