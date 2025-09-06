document.getElementById('factura-form').addEventListener('submit', manejarFormulario);

function manejarFormulario(e) {
    e.preventDefault();
    ocultarError();
    
    const datosFormulario = obtenerDatosFormulario();
    if (!validarFormulario(datosFormulario)) {
        return;
    }

    const cliente = obtenerORegistrarCliente(datosFormulario.nombre, datosFormulario.email);
    const calculo = calcularFactura(datosFormulario);

    persistirAlquiler(cliente.idCliente, datosFormulario, calculo);
    mostrarResultado(cliente, datosFormulario, calculo);
}

// Datos del formulario
function obtenerDatosFormulario() {
    const nombre = (document.getElementById('nombre')?.value || '').trim();
    const email = (document.getElementById('email')?.value || '').trim();
    const numEquipos = parseInt(document.getElementById('num-equipos').value);
    const tipoAlquiler = document.getElementById('tipo-alquiler').value; // 'ciudad' | 'fuera' | 'establecimiento'
    const diasIniciales = parseInt(document.getElementById('dias-iniciales').value);
    const diasAdicionales = parseInt(document.getElementById('dias-adicionales').value) || 0;

    return {
        nombre,
        email,
        numEquipos,
        tipoAlquiler,
        diasIniciales,
        diasAdicionales
    };
}

function validarFormulario(datos) {
    if (!datos.nombre) {
        mostrarError("Ingrese el nombre del cliente.");
        return false;
    }
    if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        mostrarError("Ingrese un email válido.");
        return false;
    }
    if (Number.isNaN(datos.numEquipos) || datos.numEquipos < 2) {
        mostrarError("El número de equipos debe ser al menos 2.");
        return false;
    }
    if (Number.isNaN(datos.diasIniciales) || datos.diasIniciales < 1) {
        mostrarError("El número de días iniciales debe ser al menos 1.");
        return false;
    }
    if (Number.isNaN(datos.diasAdicionales) || datos.diasAdicionales < 0) {
        mostrarError("El número de días adicionales no puede ser negativo.");
        return false;
    }
    if (!['ciudad','fuera','establecimiento'].includes(datos.tipoAlquiler)) {
        mostrarError("Seleccione una opción de alquiler válida.");
        return false;
    }
    return true;
}

// mensajes de error
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error-mensaje');
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove('hidden');
}
function ocultarError() {
    const errorDiv = document.getElementById('error-mensaje');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
}

// Cliente y persistencia
function obtenerORegistrarCliente(nombre, email) {
    const clave = 'alquipc_clientes';
    const clientes = JSON.parse(localStorage.getItem(clave) || '[]');
    const existente = clientes.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existente) {
        return existente;
    }
    const idCliente = generarIdCliente(nombre);
    const nuevo = { idCliente, nombre, email };
    clientes.push(nuevo);
    localStorage.setItem(clave, JSON.stringify(clientes));
    return nuevo;
}

function generarIdCliente(nombre) {
    const base = nombre.replace(/\s+/g, '').slice(0, 4).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ts = Date.now().toString().slice(-4);
    return `CLI-${base}-${rand}${ts}`;
}

function persistirAlquiler(idCliente, datos, calculo) {
    const clave = 'alquipc_alquileres';
    const alquileres = JSON.parse(localStorage.getItem(clave) || '[]');
    const registro = {
        idCliente,
        fecha: new Date().toISOString(),
        ...datos,
        calculo
    };
    alquileres.push(registro);
    localStorage.setItem(clave, JSON.stringify(alquileres));
}

// Cálculo de factura con desglose y regla mejorada
function calcularFactura(datos) {
    const TARIFA_POR_DIA = 35000;

    const subtotalInicial = datos.numEquipos * TARIFA_POR_DIA * datos.diasIniciales;

    // Incrementos/Descuentos por tipo
    let porcentajeIncremento = 0;
    let porcentajeDescuento = 0;
    if (datos.tipoAlquiler === 'fuera') {
        porcentajeIncremento = 0.05; // +5%
    } else if (datos.tipoAlquiler === 'establecimiento') {
        porcentajeDescuento = 0.05; // -5%
    }

    const valorIncremento = subtotalInicial * porcentajeIncremento;
    const valorDescuento = subtotalInicial * porcentajeDescuento;
    const subtotalTipo = subtotalInicial + valorIncremento - valorDescuento;

    // Días adicionales con mejora de regla para no quebrar:
    // 2% de descuento sobre el valor de días adicionales, con tope máximo de 20%
    // y además nunca se descuenta más que el 50% del subtotal de adicionales
    const subtotalAdicionales = datos.numEquipos * TARIFA_POR_DIA * (datos.diasAdicionales || 0);
    const porcentajeDescAdicionalBase = 0.02 * (datos.diasAdicionales || 0);
    const porcentajeDescAdicional = Math.min(porcentajeDescAdicionalBase, 0.20);
    const descuentoAdicionalTeorico = subtotalAdicionales * porcentajeDescAdicional;
    const descuentoAdicionalMaximo = subtotalAdicionales * 0.5;
    const valorDescAdicional = Math.min(descuentoAdicionalTeorico, descuentoAdicionalMaximo);
    const totalAdicionales = subtotalAdicionales - valorDescAdicional;

    const total = subtotalTipo + totalAdicionales;

    return {
        tarifaPorDia: TARIFA_POR_DIA,
        subtotalInicial,
        porcentajeIncremento,
        valorIncremento,
        porcentajeDescuento,
        valorDescuento,
        subtotalTipo,
        diasAdicionales: datos.diasAdicionales || 0,
        subtotalAdicionales,
        porcentajeDescAdicional,
        valorDescAdicional,
        totalAdicionales,
        total
    };
}

// resultado final
function mostrarResultado(cliente, datos, calculo) {
    const resultadoDiv = document.getElementById('resultado');
    const detalle = document.getElementById('detalle');

    const etiquetaTipo = datos.tipoAlquiler === 'ciudad'
        ? 'Dentro de la ciudad'
        : datos.tipoAlquiler === 'fuera'
            ? 'Fuera de la ciudad'
            : 'Dentro del establecimiento';

    let mensaje = `
        <strong>Id-Cliente:</strong> ${cliente.idCliente}<br>
        <strong>Cliente:</strong> ${cliente.nombre} (${cliente.email})<br>
        <strong>Opción de alquiler:</strong> ${etiquetaTipo}<br>
        <strong>Cantidad de equipos:</strong> ${datos.numEquipos}<br>
        <strong>Días iniciales:</strong> ${datos.diasIniciales}<br>
        <strong>Días adicionales:</strong> ${calculo.diasAdicionales}<br>
        <hr class="my-3 border-gray-600">
        <strong>Tarifa por día:</strong> $${formatear(calculo.tarifaPorDia)}<br>
        <strong>Subtotal inicial:</strong> $${formatear(calculo.subtotalInicial)}<br>
    `;

    if (calculo.porcentajeIncremento > 0) {
        mensaje += `<strong>Incremento (servicio domicilio 5%):</strong> +$${formatear(calculo.valorIncremento)}<br>`;
    }
    if (calculo.porcentajeDescuento > 0) {
        mensaje += `<strong>Descuento (establecimiento 5%):</strong> -$${formatear(calculo.valorDescuento)}<br>`;
    }

    mensaje += `<strong>Subtotal tras opción:</strong> $${formatear(calculo.subtotalTipo)}<br>`;

    if (calculo.diasAdicionales > 0) {
        mensaje += `
            <strong>Subtotal días adicionales:</strong> $${formatear(calculo.subtotalAdicionales)}<br>
            <strong>Descuento días adicionales (${(calculo.porcentajeDescAdicional*100).toFixed(0)}%):</strong> -$${formatear(calculo.valorDescAdicional)}<br>
            <strong>Total días adicionales:</strong> $${formatear(calculo.totalAdicionales)}<br>
        `;
    }

    mensaje += `<hr class="my-3 border-gray-600">`;
    mensaje += `<strong>Total a pagar:</strong> $${formatear(calculo.total)}`;

    detalle.innerHTML = mensaje;
    resultadoDiv.classList.remove('hidden');
}

function formatear(valor) {
    return valor.toLocaleString('es-CO', { minimumFractionDigits: 0 });
}
