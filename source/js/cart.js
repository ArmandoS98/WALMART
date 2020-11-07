/**
 *
 */

var totalProductos = 0;

function template(product) {
  return `<tr class="text-center" data-id="${product.docid}">
              <td><img src="${
                product.image
              }" class="card-img-top img-fluid img-thumbnail" alt="..." style="width:6rem"></td>
              <td>${product.descripcion}</td>
              <td>${product.precio}</td>
              <td><input type="number" class="cantidad form-control text-center" min="0" value="${
                product.cantidad
              }"></td>
              <td>${product.precio * product.cantidad}</td>
              <td> <a href="#" class="btn"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg></a></td>
          </tr>`;
}

function myCart() {
  var objCartStored = localStorage.getItem("my_products");
  var storedProducts = objCartStored ? JSON.parse(objCartStored) : {};
  $("#list-products-final").html("");
  if (storedProducts.length > 0) {
    storedProducts.forEach((element) => {
      $("#list-products-final").append(template(element));
    });
  }
}

function addProduct(id, number) {
  var objCartStored = localStorage.getItem("my_products");
  var storedProducts = objCartStored ? JSON.parse(objCartStored) : {};
  existProduct = storedProducts.findIndex((product) => product.docid === id);
  if (existProduct !== -1) {
    storedProducts[existProduct].cantidad = number;
  }
  localStorage.setItem("my_products", JSON.stringify(storedProducts));
}

function calculateTotal() {
  var totalPago = 0;
  var objCartStored = localStorage.getItem("my_products");
  var storedProducts = objCartStored ? JSON.parse(objCartStored) : {};
  if (storedProducts.length > 0) {
    storedProducts.forEach((element) => {
      totalPago += Number(element.precio * element.cantidad);
    });
    templateTotal = `<tr>
      <th colspan="4" scope="col" class="text-right">TOTAL :</th>
      <th scope="col" class="text-center">$.${totalPago}</th>
    <tr>`;
    $("#list-products-final").append(templateTotal);
    $(".total-pay").html(totalPago);
    $("#total-product").html(storedProducts.length);
  }
}

$("#Shopping-Cart").on("change", ".cantidad", function () {
  let cantidad = $(this).val();
  let id = $(this).parent().parent().data("id");
  addProduct(id, cantidad);
  myCart();
  calculateTotal();
});

/***
 * Funcion para Formulario devuelve un array de los datos insertados en el
 * @form typo de dato jquery selector
 * @returns array
 */

function FormSerialicearray(form) {
  return form.serializeArray();
}

/*metodo que escucha el evento submit del formulario al enviarse detiene el evento por defecto y manejamos los datos 
  con la funcion FormSerialicearray
*/

$("#Billing-data-form").on("submit", function (e) {
  e.preventDefault(); // evitamos que el evento se propague
  e.stopPropagation(); // detenmos que el form se envie y recargue la pagina
  let form = $(this),
    required_fields_filled = true;

  form.find("input, textarea, select ,radio").each(function () {
    let input = document.getElementById($(this).attr("id"));
    if ($(this).prop("required") && $(this).val() == "") {
      $(this).focus();
      required_fields_filled = false;
    }
    if (!input.validity.valid) {
      required_fields_filled = false;
    }
  });

  if (required_fields_filled) {
    $(".toast").toast("show", {
      animation: true,
      autohide: true,
    });
    $(".toast").find(".toast-header").removeClass("bg-danger text-white");
    $(".toast").find(".toast-header").addClass("bg-info text-white");

    $(".toast").find(".toast-body").html("Gracias por tu Compra");
    console.log(FormSerialicearray(form)); // devolvemos en un array los datos insertados en el formulario
  } else {
    $(".toast").toast("show", {
      animation: true,
      autohide: true,
    });
    $(".toast").find(".toast-header").removeClass("bg-info text-white");
    $(".toast").find(".toast-header").addClass("bg-danger text-white");
    $(".toast").find(".toast-body").html("Verifica los campos obligatorios");
    form.addClass("was-validated");
  }
});

myCart();
calculateTotal();
