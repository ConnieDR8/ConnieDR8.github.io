# LAB-05: Terraform en Google Cloud

## Evidencia

En este laboratorio utilicé Terraform para crear, modificar y administrar recursos de Google Cloud. Completé los tres laboratorios de Google Skills y guardé los archivos de configuración, planes de ejecución y capturas.

| Laboratorio | Puntaje | Captura | Carpeta |
|---|---|---|---|
| GSP233 — Deploy Kubernetes Load Balancer Service with Terraform | 100/100 | `evidencia/gsp233.png` | `01-gsp233/` |
| GSP497 — Cloud Operations for GKE | 100/100 | `evidencia/gsp497.png` | `02-gsp497/` |
| GSP345 — Build Infrastructure with Terraform on Google Cloud: Challenge Lab | 100/100 | `evidencia/gsp345.png` | `03-gsp345/` |

**Puntaje obtenido en Google Skills:** 100/100 en cada laboratorio.

## Bitácora

### GSP233 — Deploy Kubernetes Load Balancer Service with Terraform

**¿Qué hice?**

Trabajé con Terraform para desplegar un clúster de Kubernetes en Google Cloud y publicar una aplicación NGINX mediante un servicio de tipo LoadBalancer.

Primero revisé los archivos Terraform del laboratorio y generé `plan-inicial.txt` antes de aplicar los cambios. Después ejecuté el despliegue y comprobé que el servicio tuviera una IP externa.

Finalmente, verifiqué que NGINX respondiera correctamente desde el navegador y guardé las capturas correspondientes.

**¿Qué me costó?**

Entender la relación entre Terraform, el clúster de Kubernetes y el servicio LoadBalancer. También tuve que identificar en qué momento debía guardar el plan para que sirviera como evidencia.

**¿Qué cambiaría?**

Revisaría primero todos los archivos `.tf` y generaría el plan antes de empezar el despliegue, para tener más claro qué recursos se crearán.

**Resultado:** Completé GSP233 con 100/100 puntos. Guardé los archivos Terraform, `plan-inicial.txt` y las capturas del clúster y del servicio NGINX.

### GSP497 — Cloud Operations for GKE

**¿Qué hice?**

Trabajé con un proyecto de monitoreo en Google Kubernetes Engine. Revisé la configuración de Terraform y los comandos del repositorio antes de desplegar la aplicación.

Generé `plan-inicial.txt` para conocer los recursos que se crearían. El plan mostró:

```text
Plan: 5 to add, 0 to change, 0 to destroy.
```

Después ejecuté `make create` para desplegar los recursos y `make validate` para comprobar que la aplicación funcionara.

La validación mostró:

```text
App is deployed.
```

También revisé las métricas de la aplicación en Google Cloud Monitoring, incluida la política `Prometheus mem alloc`, y guardé la captura.

Finalmente, ejecuté la limpieza de recursos y conservé `destroy.txt`.

```text
Destroy complete! Resources: 5 destroyed.
```

**¿Qué me costó?**

Al inicio no tenía claro que `make create` ejecutaba Terraform automáticamente. Por eso tuve que revisar el procedimiento para evitar aplicar cambios antes de guardar el plan.

También me tomó tiempo identificar la captura adecuada de Cloud Monitoring.

**¿Qué cambiaría?**

Antes de ejecutar comandos automatizados como `make create`, revisaría qué instrucciones contienen los scripts y qué recursos van a modificar.

**Resultado:** Completé GSP497 con 100/100 puntos. Se crearon y eliminaron correctamente los cinco recursos, y conservé el plan inicial, el registro de destrucción y las evidencias de monitoreo.

### GSP345 — Build Infrastructure with Terraform on Google Cloud: Challenge Lab

**¿Qué hice?**

En este laboratorio trabajé con una infraestructura de Google Cloud que debía administrar mediante Terraform. A diferencia de los laboratorios anteriores, tuve que completar varias tareas relacionadas entre sí.

Primero preparé la estructura del proyecto con `main.tf`, `variables.tf` y los módulos `instances` y `storage`. Configuré el proveedor de Google con la versión `~> 6.0`.

Después consulté las características de dos máquinas virtuales existentes, `tf-instance-1` y `tf-instance-2`, y las importé a Terraform.

Para comprobar la importación utilicé:

```bash
terraform state list
```

También guardé `plan-2.txt`. El plan mostró dos actualizaciones y ninguna destrucción.

En la tercera tarea creé el bucket `tf-bucket-902618` y configuré un backend remoto de Cloud Storage, con el prefijo `terraform/state`, para almacenar el estado de Terraform.

Luego cambié el tipo de las dos máquinas virtuales a `e2-standard-2` y creé una tercera instancia. Tuve que corregir su nombre porque Google Skills solicitaba `tf-instance-715496`. Después retiré esa instancia de la configuración y apliqué su destrucción.

En la sexta tarea utilicé un módulo del Terraform Registry, versión `10.0.0`, para crear la red `tf-vpc-605465` y dos subredes:

- `subnet-01`: `10.10.10.0/24`.
- `subnet-02`: `10.10.20.0/24`.

Después asocié las dos máquinas existentes a las subredes correspondientes y comprobé que Terraform no indicara su recreación.

Por último, configuré la regla `tf-firewall` para permitir tráfico TCP por el puerto 80, tal como solicitaba el laboratorio.

En cada etapa guardé el archivo de plan correspondiente antes de aplicar los cambios.

**¿Qué me costó?**

Lo más complicado fue entender cómo importar recursos existentes sin volver a crearlos y cómo interpretar los cambios que mostraba Terraform.

También tuve dificultades con el nombre de la tercera máquina virtual y con el nombre exacto de la VPC, porque ambos debían coincidir con los valores indicados por Google Skills.

Otro punto nuevo fue configurar el backend remoto y entender la diferencia entre quitar un recurso del archivo `.tf`, retirarlo del estado y destruirlo realmente.

**¿Qué cambiaría?**

Revisaría con más cuidado todos los nombres que aparecen en el enunciado antes de crear los recursos.

También guardaría una copia de los archivos `.tf` en cada etapa, además de los planes, para poder comparar con mayor facilidad los cambios realizados durante el laboratorio.

**Resultado:** Completé las siete tareas de GSP345 y obtuve 100/100 puntos. Guardé los archivos Terraform, los planes de ejecución y la captura del resultado final.

## Uso de IA

Utilicé ChatGPT como apoyo para comprender algunos comandos, revisar los planes de Terraform y resolver los problemas que aparecieron durante los laboratorios.

### GSP233

**¿Qué le pedí?**

- Ayuda para entender la estructura de los archivos Terraform.
- Explicación de los recursos que se crearían en Google Cloud.
- Orientación para generar el plan antes del despliegue.
- Ayuda para verificar que el servicio NGINX funcionara correctamente.
- Indicaciones para organizar las evidencias.

**¿Qué me dio?**

ChatGPT me explicó la función de los archivos principales y cómo utilizar los comandos básicos de Terraform.

Entre los comandos utilizados estuvieron:

```bash
terraform init
terraform plan
terraform apply
```

También me orientó para comprobar el servicio de Kubernetes y revisar la respuesta de NGINX.

**¿Qué corregí?**

- Revisé la configuración antes de aplicar los cambios.
- Comprobé que el plan correspondiera a los recursos del laboratorio.
- Verifiqué la IP externa y la respuesta de NGINX.
- Organicé las capturas y los archivos de evidencia.

**Resultado:** Pude completar el despliegue y comprender mejor cómo Terraform administra recursos de Kubernetes.

### GSP497

**¿Qué le pedí?**

- Revisar el procedimiento de GSP497 e identificar cuándo generar `plan-inicial.txt`.
- Explicar qué hacía `make create` antes de ejecutarlo.
- Ayudarme a interpretar el plan de Terraform.
- Explicar cómo comprobar la aplicación con `make validate`.
- Ayudarme a identificar la evidencia de Cloud Monitoring.
- Revisar cómo registrar la eliminación de recursos con `make teardown`.
- Orientarme para organizar las evidencias.

**¿Qué me dio?**

ChatGPT me explicó que `make create` ejecutaba Terraform automáticamente y me recomendó generar el plan por separado para conservarlo antes del despliegue.

Utilicé:

```bash
cd ~/gke-monitoring-tutorial/terraform

terraform init -input=false
terraform plan -input=false -no-color > plan-inicial.txt 2>&1
grep -E 'Plan:|Error:' plan-inicial.txt
```

El plan mostró cinco recursos por crear y ninguna destrucción.

Después utilicé los comandos del laboratorio:

```bash
cd ~/gke-monitoring-tutorial

make create
make validate
```

Para registrar la limpieza de recursos, ChatGPT me indicó:

```bash
make teardown 2>&1 | tee terraform/destroy.txt
```

Finalmente comprobé la salida:

```bash
grep -E 'Destroy complete!|Error:' terraform/destroy.txt
```

**¿Qué corregí?**

- Interrumpí una primera ejecución de `make create` para guardar el plan antes del despliegue.
- Revisé el funcionamiento de los scripts.
- Comprobé que Terraform creara cinco recursos sin destrucciones.
- Verifiqué que la aplicación estuviera desplegada.
- Seleccioné la captura de Cloud Monitoring que mostraba las métricas solicitadas.
- Comprobé que `make teardown` eliminara los cinco recursos.

**Resultado:** Aprendí a revisar comandos automatizados, conservar planes y comprobar la creación y eliminación de infraestructura.

### GSP345

**¿Qué le pedí?**

- Ayuda para organizar los módulos y archivos de Terraform.
- Explicación de cómo importar máquinas virtuales existentes.
- Apoyo para revisar los planes antes de aplicar cambios.
- Orientación para configurar un backend remoto.
- Ayuda para corregir errores en los nombres de los recursos.
- Explicación sobre el uso de módulos del Terraform Registry.
- Ayuda para verificar las subredes y el firewall.
- Indicaciones para guardar los archivos y las evidencias.

**¿Qué me dio?**

ChatGPT me ayudó a preparar las configuraciones de Terraform y me explicó comandos que no había utilizado en los laboratorios anteriores.

Uno de ellos fue `terraform import`, que permite incorporar recursos existentes al estado:

```bash
terraform import \
  module.instances.google_compute_instance.tf_instance_1 \
  projects/qwiklabs-gcp-00-48c6309041bd/zones/us-east1-b/instances/tf-instance-1
```

También utilicé:

```bash
terraform state list
```

Este comando me permitió comprobar qué recursos estaban registrados en el estado de Terraform.

Para guardar y revisar los planes utilicé:

```bash
terraform plan -input=false -no-color > plan-2.txt 2>&1

grep -E 'Plan:|Error:|must be replaced' plan-2.txt
```

Con estos comandos pude comprobar si Terraform iba a crear, modificar, destruir o reemplazar recursos.

En la tarea del backend remoto aprendí a utilizar:

```bash
terraform init -migrate-state
```

También conocí `terraform state rm`, que elimina la asociación de un recurso con el estado de Terraform, pero no destruye el recurso de Google Cloud.

Para la creación de la VPC, ChatGPT me orientó sobre cómo utilizar un módulo del Terraform Registry y fijar su versión en `10.0.0`.

Finalmente, me ayudó a verificar la regla de firewall con:

```bash
gcloud compute firewall-rules describe tf-firewall \
  --format="yaml(name,network,direction,allowed,sourceRanges)"
```

Este comando permitió comprobar que la regla estaba asociada a la red correcta y permitía el puerto TCP 80.

**¿Qué corregí?**

- Revisé las características reales de las máquinas virtuales antes de importarlas.
- Comprobé los planes para evitar recreaciones no previstas.
- Corregí el nombre del bucket cuando interrumpí accidentalmente su configuración.
- Verifiqué que el estado se conservara después de configurar el backend remoto.
- Detecté que el nombre de la tercera instancia no coincidía con el solicitado y lo cambié a `tf-instance-715496`.
- Revisé la diferencia entre retirar un recurso del estado y destruirlo.
- Comprobé el nombre de la VPC y las direcciones de las dos subredes.
- Verifiqué que el cambio de red no destruyera las máquinas existentes.
- Comprobé la configuración final del firewall.
- Organicé los archivos de configuración y las evidencias para entregarlos.

**Resultado:** GSP345 me permitió practicar la importación de recursos, los cambios controlados de infraestructura, el uso de backends remotos y los módulos de Terraform Registry. Completé el laboratorio con 100/100 puntos.