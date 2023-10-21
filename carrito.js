
// Clase "molde" para los productos de nuestra aplicación
class Producto {
    constructor(id, nombre, precio, categoria, imagen) {
      this.id = id;
      this.nombre = nombre;
      this.precio = precio;
      this.categoria = categoria;
      this.imagen = imagen;
      this.stock = stock;
    }
  }
  
  // Clase para que simula la base de datos del e-commerce, acá van a estar
  // todos los productos de nuestro catálogo
  class BaseDeDatos {
    constructor() {
      // Array para el catálogo
      this.productos = [];
      this.cargarRegistros();

    }
  
    //Funcion asincronica para traer productos desde archivo JSON
    async cargarRegistros(){
      const resultado = await fetch("productos.json");
      this.productos = await resultado.json();
      cargarProductos(this.productos);
    }
  
    // Nos devuelve todo el catálogo de productos
    traerRegistros() {
      return this.productos;
    }
      
    // Nos devuelve un producto según el ID
    registroPorId(id) {
      return this.productos.find((producto) => producto.id === id);
    }
  
    // Nos devuelve un array con todas las coincidencias que encuentre según el
    // nombre del producto con la palabra que el pasemos como parámetro
    registrosPorNombre(palabra) {
      return this.productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(palabra.toLowerCase())
      );
    }

    registrosPorCategoria(categoria) {
      return this.productos.filter((producto) => producto.categoria == categoria);
    }
  }
  
  // Clase carrito que nos sirve para manipular los productos de nuestro carrito
  class Carrito {
    constructor() {
      // Storage
      const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
      // Array donde van a estar almacenados todos los productos del carrito
      this.carrito = carritoStorage || [];
      this.total = 0; // Total de pesos en el carrito,sumando todos los productos
      this.cantidadProductos = 0; // Unidades que tenemos en el carrito
      // Llamo a listar apenas se instancia el carrito para aplicar lo que
      // hay en el storage (en caso de que haya algo)
      this.listar();
    }
  
    // Método para saber si el producto ya se encuentra en el carrito
    estaEnCarrito({ id }) {
      return this.carrito.find((producto) => producto.id === id);
    }
  
    // Agregar al carrito
    agregar(producto) {
      const productoEnCarrito = this.estaEnCarrito(producto);
      // Si no está en el carrito, le mando con push y le agrego la propiedad "cantidad"
      if (!productoEnCarrito) {
        //Con spread le agrego la propiedad cantidad
        this.carrito.push({ ...producto, cantidad: 1 });
      } else {
        // De lo contrario, si ya está en el carrito, le sumo en 1 la cantidad
        if(productoEnCarrito.cantidad < Producto.stock)
          Producto.stock --;
          productoEnCarrito.cantidad++;
      }
      // Actualizo el storage
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
      // Actualizo y muestro como queda el carrito en el HTML
      this.listar();
    }
  
    // QUITAR
    quitar(id) {
      //Consigo el indice del producto a quitar
      const indice = this.carrito.findIndex((producto) => producto.id === id);
      // Si la cantidad es mayor a 1, le resto la cantidad en 1
      if (this.carrito[indice].cantidad > 1) {
        this.carrito[indice].cantidad--;
      } else {
        // Y sino, borramos del carrito el producto a quitar
        this.carrito.splice(indice, 1);
      }
      // Actualizo el storage
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
      // Actualizo y muestro como queda el carrito en el HTML
      this.listar();
    }

    vaciarCarrito(){
      this.total = 0;
      this.cantidadProductos = 0;
      this.carrito = [];
      localStorage.setItem("carrito", JSON.stringify(this.carrito));
      this.listar()
    }
  
    // Renderiza todos los productos en el HTML
    listar() {
      // Reiniciamos variables
      this.total = 0;
      this.cantidadProductos = 0;
      divCarrito.innerHTML = "";
      // Recorro producto por producto del carrito, y los dibujo en el HTML
      for (const producto of this.carrito) {
        divCarrito.innerHTML += `
          <div class="productoCarrito">
            <h2>${producto.nombre}</h2>
            <p>Precio: $${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <span class="subtotal">Subtotal: $${producto.precio * producto.cantidad} </span>
            <a href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</a>
          </div>
        `;
        // Actualizamos los totales
        this.total += producto.precio * producto.cantidad;
        this.cantidadProductos += producto.cantidad;
      }
      //Si no hya productos en el carrito hago desaparecer el boton Comprar
      if (this.cantidadProductos > 0) {
        // Botón comprar visible
        botonComprar.style.display = "block";
      } else {
        // Botón comprar invisible
        botonComprar.style.display = "none";
      }
      
    // Como no se cuantos productos tengo en el carrito, debo
    // asignarle los eventos de forma dinámica a cada uno
    // Primero hago una lista de todos los botones con .querySelectorAll
    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    // Después los recorro uno por uno y les asigno el evento a cada uno
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        // Obtengo el id por el dataset (está asignado en this.listar())
        const idProducto = Number(boton.dataset.id);
        // Llamo al método quitar pasándole el ID del producto
        this.quitar(idProducto);
      });
    }

    // Actualizo los contadores del HTML
    spanCantidadProductos.innerText = this.cantidadProductos;
    spanTotalCarrito.innerText = this.total;
    }
    
  }
     
  // Elementos
  const spanCantidadProductos = document.querySelector("#cantidadProductos");
  const spanTotalCarrito = document.querySelector("#totalCarrito");
  const divProductos = document.querySelector("#productos");
  const divCarrito = document.querySelector("#carrito");
  const inputBuscar = document.querySelector("#inputBuscar");
  const botonCarrito = document.querySelector("section h1");
  const botonComprar = document.querySelector("#botonComprar");
  const botonesCategorias = document.querySelectorAll(".categorias");
  
  // Instanciamos la base de datos
  const bd = new BaseDeDatos();

  // Instaciamos la clase Carrito
  const carrito = new Carrito();

  //Filtro por categorias
  botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", () => {
      const categoria = boton.dataset.categoria;
      // Quitar seleccionado anterior
      const botonSeleccionado = document.querySelector(".seleccionado");
      botonSeleccionado.classList.remove("seleccionado");
      // Se lo agrego a este botón
      boton.classList.add("seleccionado");
      if (categoria == "Todos") {
        cargarProductos(bd.traerRegistros());
      } else {
        cargarProductos(bd.registrosPorCategoria(categoria));
      }
    });
  });
  
  // Mostramos el catálogo de la base de datos apenas carga la página
  cargarProductos(bd.traerRegistros());
  
  // Función para mostrar para renderizar productos del catálogo o buscador
  function cargarProductos(productos) {
    // Vacíamos el div
    divProductos.innerHTML = "";
    // Recorremos producto por producto y lo dibujamos en el HTML
    for (const producto of productos) {
      divProductos.innerHTML += `
        <div class="producto">
          <h2 class="nombreProducto">${producto.nombre}</h2>
          <div class="imagen">
            <img src="img/${producto.imagen}" />
          </div>
          <p class="precio">-$${producto.precio},00-</p>
          <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
        </div>
      `;
    }
  
    // Lista dinámica con todos los botones que haya en nuestro catálogo
    const botonesAgregar = document.querySelectorAll(".btnAgregar");
  
    // Recorremos botón por botón de cada producto en el catálogo y le agregamos
    // el evento click a cada uno
    for (const boton of botonesAgregar) {
      boton.addEventListener("click", (event) => {
        // Evita el comportamiento default de HTML
        event.preventDefault();
        // Guardo el dataset ID que está en el HTML del botón Agregar al carrito
        const idProducto = Number(boton.dataset.id);
        // Uso el método de la base de datos para ubicar el producto según el ID
        const producto = bd.registroPorId(idProducto);
        // Llama al método agregar del carrito
        carrito.agregar(producto);
      });
    }
  }
  
  // Buscador
  inputBuscar.addEventListener("input", (event) => {
    event.preventDefault();
    const palabra = inputBuscar.value;
    const productos = bd.registrosPorNombre(palabra);
    cargarProductos(productos);
  });
  
  // Toggle para ocultar/mostrar el carrito
  botonCarrito.addEventListener("click", (event) => {
    document.querySelector("section").classList.toggle("ocultar");
  });

  //Libreria aplicada al boton Comprar
  botonComprar.addEventListener("click", (event)=>{
    event.preventDefault();
    //Primer alert para confirmar compra
        
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: '¿Desea confirmar la compra?',
      text: "Mira que no hay vuelta atras!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'No confirmar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire(
          'Confirmada!',
          'Su compra esta en camino!.',
          'success'
        )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })

    // Swal.fire({
    //   position: 'center',
    //   icon: 'success',
    //   title: 'Su compra ha sido realizada exitosamente!',
    //   showConfirmButton: "true",
            
    // })
    carrito.vaciarCarrito();
  })