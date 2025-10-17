$(document).ready(function() {
  let empleados = [];
  let paginaActual = 1;
  let registrosPorPagina = parseInt($("#rows").val());
  let ordenAsc = true;
  let campoOrden = 'id';


  // === FUNCIÓN PRINCIPAL PARA CARGAR DATOS ===
  function cargarDatos() {
    $.ajax({
      type: "GET",
      url: "data.xml", // Puedes cambiarlo por una URL externa: "https://tu-servidor.com/empleados.xml"
      dataType: "text",
      success: function(data) {
		let xml = $.parseXML(data); // forzar interpretación XML
		let $xml = $(xml);
        empleados = [];
		
        $(xml).find("empleado").each(function() {
          empleados.push({
            id: $(this).find("id").text().trim(),
            nombre: $(this).find("nombre").text().trim(),
            departamento: $(this).find("departamento").text().trim(),
            salario: parseFloat($(this).find("salario").text().trim())
          });
        });
        renderTabla();
      },
      error: function() {
        $("#tabla-empleados tbody").html(`
          <tr><td colspan="4" style="text-align:center;color:red;">❌ Error al cargar el archivo XML</td></tr>
        `);
        $("#total").text("No se pudieron cargar los registros.");
        $("#paginacion").empty();
      }
    });
  }

  // === FUNCIÓN PARA RENDERIZAR LA TABLA ===
  function renderTabla() {
    let filtro = $("#search").val().toLowerCase();
    let filtrados = empleados.filter(emp =>
      emp.nombre.toLowerCase().includes(filtro) ||
      emp.departamento.toLowerCase().includes(filtro)
    );

    // Ordenar registros
    filtrados.sort((a, b) => {
      if (a[campoOrden] < b[campoOrden]) return ordenAsc ? -1 : 1;
      if (a[campoOrden] > b[campoOrden]) return ordenAsc ? 1 : -1;
      return 0;
    });

    // Paginación
    let totalRegistros = filtrados.length;
    let totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    paginaActual = Math.min(paginaActual, totalPaginas) || 1;
    let inicio = (paginaActual - 1) * registrosPorPagina;
    let pagina = filtrados.slice(inicio, inicio + registrosPorPagina);

    // Render filas
    let tbody = $("#tabla-empleados tbody");
    tbody.empty();
    if (pagina.length === 0) {
      tbody.append(`<tr><td colspan="4" style="text-align:center;">Sin resultados</td></tr>`);
    } else {
      $.each(pagina, function(_, emp) {
        tbody.append(`
          <tr>
            <td>${emp.id}</td>
            <td>${emp.nombre}</td>
            <td>${emp.departamento}</td>
            <td>${emp.salario.toLocaleString()}</td>
          </tr>
        `);
      });
    }

    // Mostrar total y paginación
    $("#total").text(`Total de registros: ${totalRegistros}`);
    renderPaginacion(totalPaginas);
  }

  // === FUNCIÓN PARA RENDERIZAR LA PAGINACIÓN ===
  function renderPaginacion(totalPaginas) {
    let paginacion = $("#paginacion");
    paginacion.empty();
    for (let i = 1; i <= totalPaginas; i++) {
      let btn = $(`<button class="ui-button">${i}</button>`);
      if (i === paginaActual) btn.addClass("ui-state-active");
      btn.click(function() {
        paginaActual = i;
        renderTabla();
      });
      paginacion.append(btn);
    }
  }

  // === EVENTOS ===
  $("#search").on("input", function() {
    paginaActual = 1;
    renderTabla();
  });

  $("#rows").on("change", function() {
    registrosPorPagina = parseInt($(this).val());
    paginaActual = 1;
    renderTabla();
  });

  $("#tabla-empleados th").on("click", function() {
    let nuevoCampo = $(this).data("sort");
    if (campoOrden === nuevoCampo) {
      ordenAsc = !ordenAsc;
    } else {
      campoOrden = nuevoCampo;
      ordenAsc = true;
    }
    renderTabla();
  });

  // Botón de recarga AJAX
  $("#reload").on("click", function() {
    $(this).addClass("ui-state-active");
    cargarDatos();
    setTimeout(() => $(this).removeClass("ui-state-active"), 500);
  });

  // Carga inicial automática
  cargarDatos();
});
