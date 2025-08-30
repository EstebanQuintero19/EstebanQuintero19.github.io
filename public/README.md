# Sistema de Facturación ALQUIPC

Este es un sistema de facturación para el alquiler de equipos de cómputo portátiles, desarrollado con HTML, CSS, y JavaScript. El sistema calcula el costo de alquiler de equipos de acuerdo con las opciones de alquiler (dentro de la ciudad, fuera de la ciudad, dentro del establecimiento), la cantidad de equipos, los días de alquiler iniciales y los días adicionales.


## Funcionalidades

- **Ingreso de datos**: El usuario puede ingresar la cantidad de equipos a alquilar, el tipo de alquiler, los días iniciales de alquiler y los días adicionales.
- **Cálculo de la factura**: El sistema calcula el total de la factura en función de:
  - El número de equipos.
  - El tipo de alquiler (dentro del establecimiento, fuera de la ciudad, dentro del local).
  - Los días iniciales de alquiler.
  - Los días adicionales (si aplica).
- **Aplicación de descuentos e incrementos**: Dependiendo del tipo de alquiler y los días adicionales, se aplican los siguientes:
  - Descuento del 5% si el alquiler es dentro del establecimiento.
  - Incremento del 5% si el alquiler es fuera de la ciudad.
  - Descuento del 2% por cada día adicional de alquiler.
- **Resultado de la factura**: El sistema muestra un resumen con los detalles del alquiler, los descuentos o incrementos aplicados, y el total a pagar.



## Estructura del Proyecto

- **index.html**: Contiene la estructura del formulario y la interfaz de usuario.
- **app.js**: Archivo JavaScript que gestiona la lógica del sistema (validación de datos, cálculos de la factura, visualización de resultados).
- **README.md**: Documento de documentación de este proyecto.
