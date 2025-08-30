document.getElementById('factura-form').addEventListener('submit', manejarFormulario);

function manejarFormulario(e) {
    e.preventDefault();
    
    const datosFormulario = obtenerDatosFormulario();
    if (validarFormulario(datosFormulario)) {
        const total = calcularTotal(datosFormulario);
        mostrarResultado(total, datosFormulario.tipoAlquiler, datosFormulario.numEquipos, datosFormulario.diasIniciales, datosFormulario.diasAdicionales);
    }
}

// Datos del formulario
function obtenerDatosFormulario() {
    const numEquipos = parseInt(document.getElementById('num-equipos').value);
    const tipoAlquiler = document.getElementById('tipo-alquiler').value;
    const diasIniciales = parseInt(document.getElementById('dias-iniciales').value);
    const diasAdicionales = parseInt(document.getElementById('dias-adicionales').value) || 0;

    return {
        numEquipos,
        tipoAlquiler,
        diasIniciales,
        diasAdicionales
    };
}


function validarFormulario(datos) {
    if (datos.numEquipos < 2) {
        mostrarError("El número de equipos debe ser al menos 2.");
        return false;
    }
    if (!validarEntrada(datos.diasIniciales, "diasIniciales") || !validarEntrada(datos.diasAdicionales, "diasAdicionales")) {
        return false;
    }
    return true;
}

function validarEntrada(valor, tipo) {
    if (tipo === "diasIniciales") {
        if (valor < 1) {
            mostrarError("El número de días iniciales debe ser al menos 1.");
            return false;
        }
    }
    if (tipo === "diasAdicionales" && valor < 0) {
        mostrarError("El número de días adicionales no puede ser negativo.");
        return false;
    }
    return true;
}

//mensajes de error
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('error-mensaje');
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove('hidden');
}

// Total de la factura
function calcularTotal(datos) {
    const tarifaPorDia = 35000;
    let incremento = 0;
    let descuento = 0;

    if (datos.tipoAlquiler === 'fuera') {
        incremento = 0.05;
    } else if (datos.tipoAlquiler === 'dentro') {
        descuento = 0.05; 
    }

    let total = datos.numEquipos * tarifaPorDia * datos.diasIniciales;

    // aplicar incremento/descuento
    total += total * incremento;
    total -= total * descuento;

    // Calcular días adicionales
    if (datos.diasAdicionales > 0) {
        const descuentoAdicional = 0.02; // 2% de descuento por cada día adicional
        const totalAdicional = datos.numEquipos * tarifaPorDia * datos.diasAdicionales;
        total += totalAdicional - totalAdicional * descuentoAdicional;
    }

    return total;
}

// resultado final
function mostrarResultado(total, tipoAlquiler, numEquipos, diasIniciales, diasAdicionales) {
    const resultadoDiv = document.getElementById('resultado');
    const detalle = document.getElementById('detalle');

    let mensaje = `
        <strong>Tipo de Alquiler:</strong> ${tipoAlquiler}<br>
        <strong>Cantidad de equipos:</strong> ${numEquipos}<br>
        <strong>Días iniciales:</strong> ${diasIniciales}<br>
        <strong>Días adicionales:</strong> ${diasAdicionales}<br>
    `;

    // detalles de incrementos/descuentos
    if (tipoAlquiler === 'fuera') {
        mensaje += `<strong>Incremento por fuera de la ciudad:</strong> +$${(total * 0.05).toFixed(2)}<br>`;
    } else if (tipoAlquiler === 'dentro') {
        mensaje += `<strong>Descuento por dentro del establecimiento:</strong> -$${(total * 0.05).toFixed(2)}<br>`;
    }

    if (diasAdicionales > 0) {
        mensaje += `<strong>Total por días adicionales:</strong> $${(total - total * 0.02).toFixed(2)}<br>`;
    }

    mensaje += `<strong>Total a Pagar:</strong> $${total.toFixed(2)}`;

    detalle.innerHTML = mensaje;
    resultadoDiv.classList.remove('hidden');
}
