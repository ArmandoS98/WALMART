const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const loginCheck = (user) => {
  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = "inline-block"));
    loggedOutLinks.forEach((link) => (link.style.display = "none"));
  } else {
    loggedInLinks.forEach((link) => (link.style.display = "none"));
    loggedOutLinks.forEach((link) => (link.style.display = "inline-block"));
  }
};

//SingUp anonimo
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("#signup-email").value;
  const password = document.querySelector("#signup-password").value;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = auth.currentUser;
      let name, email, photoUrl, uid;
      name = "User Default";
      email = user.email;
      photoUrl = "img Default";
      uid = user.uid;

      await saveTaskByGoogle(name, email, photoUrl, uid, 0);
      signupForm.reset();
      $("#signupModal").modal("hide");
    });
});

//SingIn anonimo
const signinForm = document.querySelector("#login-form");
signinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;

  auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
    signupForm.reset();
    $("#signinModal").modal("hide");
    console.log("sign in");
  });
});

//Logout anonimo/Google
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
  e.preventDefault();

  auth.signOut().then(() => {
    console.log("Sign out");
  });
});

function dataUser(user) {
  document.querySelector(".user-name").innerHTML = user
    ? user.displayName
    : "Anonimus";
  document.querySelector(".user-email").innerHTML = user
    ? user.email
    : "e-mail";
  let img = document.getElementById("user-image").src;

  document.getElementById("isline").innerHTML = user ? "online" : "offline";
  document.getElementById("user-image").src = user ? user.photoURL : img;
}

//GoogleLgin
const googleButton = document.querySelector("#googleLogin");
const objGoogleUser = localStorage.getItem("objGoogleUser");
const storedGoogleUser = objGoogleUser ? JSON.parse(objGoogleUser) : {};
googleButton.addEventListener("click", (e) => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then(async (result) => {
      console.log("Google sign in");

      const user = auth.currentUser;
      let name, email, photoUrl, uid;
      name = user.displayName;
      email = user.email;
      photoUrl = user.photoURL;
      uid = user.uid;
      dataUser(user);
      localStorage.setItem("objGoogleUser", JSON.stringify(user));
      localStorage.setItem("isLogged", true);
      await saveTaskByGoogle(name, email, photoUrl, uid, 1);
      signupForm.reset();
      $("#signinModal").modal("hide");
    })
    .catch((err) => {
      localStorage.setItem("isLogged", false);
      console.log(err);
    });
});

//Productos
const productos = document.querySelector(".productos");
const setupProductos = (data) => {
  if (data.length) {
    let html = "";
    data.forEach((doc) => {
      const producto = doc.data();
      //Necesito crear CARDVIEW
      const card = `
          <div class="card d-inline-block shadow p-1 m-sm-1 m-md-2 bg-white rounded card-product">
            <img src="${producto.url_imagen}" class="card-img-top img-fluid img-thumbnail" alt="...">
            <div class="card-body bg-light">
              <p class="card-text">${producto.nombre}</p>
              <hr>
              <p class="font-weight-bold text-dark">$${producto.precio}</p>
              <button class="btn btn-block btn-warning font-weight-bold text-white-50 add-card" data-image="${producto.url_imagen}" data-name="${producto.nombre}" data-descripcion=${producto.descripcion} data-docID=${producto.docID} data-precio=${producto.precio}>  <i class="fa fa-shopping-cart mx-2"></i>
                <span class="d-none d-md-inline-block text-light">Add to cart</span>
              </button>
            </div>
          </div>
      `;
      html += card;
    });
    productos.innerHTML = html;
  } else {
    productos.innerHTML = `<p class ="text-center mx-auto"><i class="fa fa-exclamation-triangle text-warning mx-2"></i>No products added</p>`;
  }
};

// Eventos
// validacion del logeo del usuario
auth.onAuthStateChanged((user) => {
  if (user) {
    localStorage.setItem("isLogged", true);
    dataUser(user);
  } else {
    localStorage.setItem("isLogged", false);
    dataUser(user);
    loginCheck(user);
  }
  fs.collection("Productos")
    .get()
    .then((snapshot) => {
      console.log(snapshot.docs);
      setupProductos(snapshot.docs);
      loginCheck(user);
    });

  //Cargar los localStorage del carrito y imprimir la longitud del array almacenado

  var objCartStored = localStorage.getItem("my_products");
  var storedProducts = objCartStored ? JSON.parse(objCartStored) : {};

  $(".notification").html(storedProducts.length);
});

//Firestore - REGISTRO ANONIMO
//Guardar informacion
const user_coleccion = "Usuarios";
const saveTask = (name, email, photoUrl, uid, rol) => {
  const docID = fs.collection(user_coleccion).doc().id;
  fs.collection(user_coleccion).doc(docID).set({
    email,
    uid,
    name,
    rol,
    docID,
    photoUrl,
  });
};

//Firestore - REGISTRO CON GOOGLE
//Guardar informacion
const saveTaskByGoogle = (name, email, photoUrl, uid, rol) => {
  const docID = fs.collection(user_coleccion).doc(uid);
  docID
    .get()
    .then(function (doc) {
      if (doc.exists) {
        console.log("Usuario ya ingresado:", doc.data());
      } else {
        fs.collection(user_coleccion).doc(uid).set({
          email,
          uid,
          name,
          rol,
          photoUrl,
        });
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
};

/***
 * AÑADIR PRODUCTOS AL CARRITO POR MEDIO DE LOCAL STORAGE
 */

/**
 * funciones
 */

var products = []; //Objects data will be stored here.

// inserta los productos

function addToCart(productsData) {
  const objCartStored = localStorage.getItem("my_products");
  const objCart = objCartStored ? JSON.parse(objCartStored) : {};
  let existProduct = false;
  productsData.cantidad = 1;

  if (objCart.length > 0) {
    existProduct = objCart.findIndex(
      (product) => product.docid === productsData.docid
    );
    if (existProduct !== -1) {
      CustomAlert(
        $(".toast"),
        "El producto ya esta añadido, puedes agregar mas en tu carrito!",
        "danger"
      );
    } else {
      products.push(productsData);
      localStorage.setItem("my_products", JSON.stringify(products));

      // agrega al icono del carrito la cantidad de productos comprados
      products.length > 0
        ? $(".notification").html(products.length)
        : $(".notification").html(0);
    }
  } else {
    products.push(productsData);
    localStorage.setItem("my_products", JSON.stringify(products));

    // agrega al icono del carrito la cantidad de productos comprados
    products.length > 0
      ? $(".notification").html(products.length)
      : $(".notification").html(0);
  }
}

/***
 * acciones
 */

$(".productos").on("click", ".add-card", function () {
  let data = $(this).data();
  addToCart(data);
});

/**
 * alert custom
 * @param {type jquery elelement} elementHtml
 * @param {type string } mensaje
 * @param {type string } alertType
 */
const CustomAlert = (elementHtml, mensaje, alertType) => {
  let type = {
    class: ["bg-info text-white", "bg-danger text-white"],
  };
  elementHtml.toast("show", {
    animation: true,
    autohide: true,
  });
  $(elementHtml).css({ "z-index": "5000" });
  $(elementHtml)
    .find(".toast-header")
    .removeClass(`${alertType == "success" ? type.class[1] : type.class[1]}`);
  $(elementHtml)
    .find(".toast-header")
    .addClass(`${alertType == "success" ? type.class[0] : type.class[1]}`);
  $(elementHtml).find(".toast-body").html(mensaje);
};

