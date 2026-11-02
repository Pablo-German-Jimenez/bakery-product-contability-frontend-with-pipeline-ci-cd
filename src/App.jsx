import { useState, useEffect } from "react";
import ModalNuevoProducto from "./components/ModalNuevoProducto.jsx";
import ModalConfirmacion from "./components/ModalConfirmacion.jsx";
import HistorialVentas from "./components/HistorialVentas.jsx";
import IAgente from "./components/IAgente.jsx";
import "./components/styles/PanelStyles.css";

const PRODUCTOS_INICIALES = [
  {
    nombre: "Facturas",
    precio: 400,
    tipo: "unidad",
    variedades: [
      {
        nombre: "Factura con crema",
        precio: 450,
        img: "/facturaConCrema.png",
      },
      {
        nombre: "Medialuna",
        precio: 400,
        img: "/mediaLuna.png",
      },
      {
        nombre: "Con Dulce de Leche",
        precio: 450,
        img: "/conDulceDeLeche.png",
      },
      {
        nombre: "Sacramento",
        precio: 450,
        img: "/sacramentos.png",
      },
    ],
  },
  {
    nombre: "Tortillas",
    precio: 150,
    tipo: "unidad",
    variedades: [
      {
        nombre: "Tortilla Finita",
        precio: 150,
        img: "tortillasFinitas.png",
      },
      {
        nombre: "Tortilla Gruesa",
        precio: 200,
        img: "tortillasGruesas.png",
      },
      {
        nombre: "Bollitos",
        precio: 120,
        img: "bollitos.png",
      },
      {
        nombre: "Cremonas",
        precio: 120,
        img: "cremonas.png",
      },
      {
        nombre: "Cuernitos",
        precio: 120,
        img: "cuernitos.png",
      },
    ],
  },
  {
    nombre: "Pan",
    precio: 3000,
    tipo: "dinero",
    variedades: [
      {
        nombre: "Pan Francés",
        precio: 3000,
        img: "panFrances.png",
      },
      {
        nombre: "Pan Mignon",
        precio: 3200,
        img: "panMignon.png",
      },
      {
        nombre: "Pan Sanguchero",
        precio: 3000,
        img: "panFrances.png",
      },
    ],
  },
  {
    nombre: "Chipá",
    precio: 250,
    tipo: "unidad",
    variedades: [],
  },
];

//Recorremos y agregamos tempId automáticamente a todo
const productosConId=PRODUCTOS_INICIALES.map(producto=>({
  ...producto,
 
  tempId: crypto.randomUUID(),
  variedades: (producto.variedades||[]).map(variedad=>({
    ...variedad,
    tempId:crypto.randomUUID()
  }))
})

)

console.log(productosConId)

export default function App() {
  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem("catalogo_panaderia");
    return guardados ? JSON.parse(guardados) : PRODUCTOS_INICIALES;
  });

  // Ventas del día en localStorage
  const [ventasDia, setVentasDia] = useState(() => {
    const ventasGuardadas = localStorage.getItem("ventas_panaderia_dia");
    return ventasGuardadas ? JSON.parse(ventasGuardadas) : [];
  });

  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    localStorage.setItem("catalogo_panaderia", JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem("ventas_panaderia_dia", JSON.stringify(ventasDia));
  }, [ventasDia]);

  // Estados de la app
  const [carrito, setCarrito] = useState({});
  const [categoriaAbierta, setCategoriaAbierta] = useState(null);
  const [variedadSeleccionada, setVariedadSeleccionada] = useState(null);
  const [nuevaVariedadNombre, setNuevaVariedadNombre] = useState("");

  // Modales
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [confirmarVaciarCarrito, setConfirmarVaciarCarrito] = useState(false);
  const [confirmarCompra, setConfirmarCompra] = useState(false);

  const handleAgregarProducto = (nuevoProducto) => {
    setProductos([...productos, nuevoProducto]);
  };

  const confirmarEliminacionProducto = () => {
    if (!productoAEliminar) return;

    setProductos(productos.filter((p) => p.id !== productoAEliminar.id));
    if (categoriaAbierta === productoAEliminar.id) setCategoriaAbierta(null);
    if (variedadSeleccionada?.producto?.id === productoAEliminar.id) {
      setVariedadSeleccionada(null);
    }
    setProductoAEliminar(null);
  };

  const cambiarPrecioProducto = (id, nuevoPrecio) => {
    setProductos(
      productos.map((p) => (p.id === id ? { ...p, precio: nuevoPrecio } : p)),
    );
  };

  const cambiarPrecioVariedad = (productoId, variedadId, nuevoPrecio) => {
    setProductos((prev) =>
      prev.map((prod) => {
        if (prod.id === productoId) {
          return {
            ...prod,
            variedades: prod.variedades.map((v) =>
              v.id === variedadId ? { ...v, precio: nuevoPrecio } : v,
            ),
          };
        }
        return prod;
      }),
    );

    if (variedadSeleccionada && variedadSeleccionada.id === variedadId) {
      setVariedadSeleccionada((prev) => ({
        ...prev,
        precio: nuevoPrecio,
      }));
    }
  };

  const agregarNuevaVariedad = (productoId) => {
    if (!nuevaVariedadNombre.trim()) return;

    const prodActual = productos.find((p) => p.id === productoId);
    const nueva = {
      id: Date.now().toString(),
      nombre: nuevaVariedadNombre.trim(),
      precio: prodActual ? prodActual.precio : 100,
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=60",
    };

    setProductos(
      productos.map((prod) => {
        if (prod.id === productoId) {
          return { ...prod, variedades: [...(prod.variedades || []), nueva] };
        }
        return prod;
      }),
    );

    setNuevaVariedadNombre("");
  };

  const agregarAlCarrito = (producto, montoEnPesos, nombreDetalle = null) => {
    const key = nombreDetalle ? `${producto.id}_${nombreDetalle}` : producto.id;
    const itemLabel = nombreDetalle
      ? `${producto.nombre} (${nombreDetalle})`
      : producto.nombre;

    setCarrito((prev) => {
      const itemExistente = prev[key] || {
        nombre: itemLabel,
        totalItem: 0,
        cantidad: 0,
      };
      return {
        ...prev,
        [key]: {
          nombre: itemLabel,
          totalItem: itemExistente.totalItem + montoEnPesos,
          cantidad: producto.tipo === "unidad" ? itemExistente.cantidad + 1 : 0,
        },
      };
    });
  };

  const totalGeneral = Object.values(carrito).reduce(
    (acc, item) => acc + item.totalItem,
    0,
  );

  const ejecutarVaciarCarrito = () => {
    setCarrito({});
    setConfirmarVaciarCarrito(false);
  };

  // Registrar cobro y persistir en el historial
  const registrarCobro = async () => {
    const payloadVenta = {
      
      items: Object.values(carrito),
      total: totalGeneral,
    };

    const res = await fetch("http://localhost:4000/api/ventas",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payloadVenta)
    });

    if(!res.ok)throw new Error("Error al procesar la venta");
//3 el backend devuelve la venta guardada (incluyendo el _id y createdAt de Mongoose)
    const ventaGuardada = await res.json();


    setVentasDia((prev) => [payloadVenta, ...prev]);
    setCarrito({});
    setConfirmarCompra(false);
  };

  const limpiarHistorialDia = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el total del día a 0?")) {
      setVentasDia([]);
    }
  };

  const tomarFotoParaVariedad = (e) => {
    const file = e.target.files[0];
    if (!file || !variedadSeleccionada) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const nuevaImagenUrl = reader.result;

      setVariedadSeleccionada((prev) => ({
        ...prev,
        img: nuevaImagenUrl,
      }));

      setProductos((prevProductos) =>
        prevProductos.map((prod) => {
          if (prod.id === variedadSeleccionada.producto.id) {
            return {
              ...prod,
              variedades: prod.variedades.map((v) =>
                v.id === variedadSeleccionada.id
                  ? { ...v, img: nuevaImagenUrl }
                  : v,
              ),
            };
          }
          return prod;
        }),
      );
    };

    reader.readAsDataURL(file);
  };

  const carritoVacio = Object.keys(carrito).length === 0;

  return (
    <div className="container-fluid py-3">
      <div className="pantalla-principal row g-3">
        {/* SECCIÓN IZQUIERDA: PRODUCTOS */}
        <div className="seccion-productos">
          <h2 className="titulo-seccion">Productos</h2>

          {/* Botonera Superior */}
          <div className="gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMostrarModalNuevo(true)}
              className="btn btn-info flex-grow-1 fw-bold text-white"
            >
              ➕ Agregar Producto
            </button>
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className={`btn fw-bold ${mostrarHistorial ? "btn-secondary" : "btn-outline-success"}`}
            >
              {mostrarHistorial ? "Ocultar Caja" : "📊 Consultar total del día"}
            </button>
          </div>

          {/* Card de Historial Renderizada */}
          {mostrarHistorial && (
            <HistorialVentas
              ventas={ventasDia}
              onCerrar={() => setMostrarHistorial(false)}
              onLimpiarHistorial={limpiarHistorialDia}
            />
          )}

          {/* Grilla de Cards */}
          <div className="grilla">
            {productos.map((producto) => {
              const estaAbierta = categoriaAbierta === producto.id;

              return (
                <div key={producto._id||producto.nombre} className="card">
                  <div className="encabezado-card">
                    <span
                      onClick={() => {
                        setCategoriaAbierta(estaAbierta ? null : producto.id);
                        setVariedadSeleccionada(null);
                      }}
                      className="nombre-producto-clickable"
                    >
                      {producto.nombre} {estaAbierta ? "▲" : "▼"}
                    </span>

                    <div className="d-flex align-items-center gap-1">
                      <span style={{ fontSize: "12px", color: "#666" }}>$</span>
                      <input
                        type="number"
                        value={producto.precio}
                        onChange={(e) =>
                          cambiarPrecioProducto(
                            producto.id,
                            Number(e.target.value),
                          )
                        }
                        className="input-precio"
                        title="Editar precio base"
                      />
                      <button
                        onClick={() =>
                          setProductoAEliminar({
                            id: producto.id,
                            nombre: producto.nombre,
                          })
                        }
                        className="btn btn-outline-danger btn-sm p-0 px-2 ms-1"
                        title="Eliminar producto"
                        style={{ fontSize: "12px", lineHeight: "1.5" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Subvariedades desplegables */}
                  {estaAbierta && (
                    <div className="desglose-variedades">
                      <div className="lista-variedades">
                        {producto.variedades &&
                          producto.variedades.map((v) => {
                            const precioVariedad = v.precio ?? producto.precio;
                            const esSeleccionada =
                              variedadSeleccionada?.id === v.id;

                            return (
                              <div
                                key={v.id}
                                onClick={() =>
                                  setVariedadSeleccionada({
                                    ...v,
                                    precio: precioVariedad,
                                    producto,
                                  })
                                }
                                className="item-variedad"
                                style={{
                                  backgroundColor: esSeleccionada
                                    ? "#e0f2fe"
                                    : "#fff",
                                  border: esSeleccionada
                                    ? "1px solid #0288d1"
                                    : "1px solid #e0e0e0",
                                }}
                              >
                                <img
                                  src={v.img}
                                  alt={v.nombre}
                                  className="mini-img"
                                />
                                <span className="texto-variedad">
                                  {v.nombre}
                                </span>

                                <div
                                  className="ms-auto d-flex align-items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span
                                    style={{ fontSize: "11px", color: "#666" }}
                                  >
                                    $
                                  </span>
                                  <input
                                    type="number"
                                    value={precioVariedad}
                                    onChange={(e) =>
                                      cambiarPrecioVariedad(
                                        producto.id,
                                        v.id,
                                        Number(e.target.value),
                                      )
                                    }
                                    className="input-precio-variedad"
                                    title="Editar precio variedad"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      <div className="form-nueva-variedad">
                        <input
                          type="text"
                          placeholder="Nueva variedad..."
                          value={nuevaVariedadNombre}
                          onChange={(e) =>
                            setNuevaVariedadNombre(e.target.value)
                          }
                          className="input-nueva-variedad"
                        />
                        <button
                          onClick={() => agregarNuevaVariedad(producto.id)}
                          className="btn-agregar-variedad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botonera de compra rápida */}
                  {producto.tipo === "dinero" ? (
                    <div className="contenedor-multiplos">
                      <button
                        onClick={() => agregarAlCarrito(producto, 50)}
                        className="btn-multiplo"
                      >
                        +$50
                      </button>
                      <button
                        onClick={() => agregarAlCarrito(producto, 100)}
                        className="btn-multiplo"
                      >
                        +$100
                      </button>
                      <button
                        onClick={() => agregarAlCarrito(producto, 500)}
                        className="btn-multiplo"
                      >
                        +$500
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        agregarAlCarrito(producto, producto.precio)
                      }
                      className="btn-agregar-unidad"
                    >
                      +1 {producto.nombre} (${producto.precio})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN CENTRAL: VISTA PREVIA Y FOTO */}
        <div className="seccion-accion-rapida">
          <input
            id="input-camara"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={tomarFotoParaVariedad}
          />

          <label htmlFor="input-camara" className="btn-camara">
            📷 Tomar nueva foto
          </label>
          <h2 className="titulo-seccion">Variedad Seleccionada</h2>
          {variedadSeleccionada ? (
            <div className="contenedor-target">
              <p className="subtitulo-click">
                ¡Hacé clic en la foto para sumar 1 unidad!
              </p>
              <div
                onClick={() =>
                  agregarAlCarrito(
                    variedadSeleccionada.producto,
                    variedadSeleccionada.precio,
                    variedadSeleccionada.nombre,
                  )
                }
                className="card-imagen-grande"
              >
                <img
                  src={variedadSeleccionada.img}
                  alt={variedadSeleccionada.nombre}
                  className="imagen-grande"
                />
                <span className="badge-precio">
                  +1 (${variedadSeleccionada.precio})
                </span>
              </div>
              <h3 className="nombre-seleccionado">
                {variedadSeleccionada.nombre}
              </h3>
              <span className="tag-categoria">
                {variedadSeleccionada.producto.nombre}
              </span>
            </div>
          ) : (
            <p className="texto-vacio">
              Seleccioná una variedad de la lista para sumar por foto.
            </p>
          )}
        </div>

        {/* SECCIÓN DERECHA: RESUMEN DE COMPRA */}
        <div className="seccion-resumen">
          <h2 className="titulo-seccion">Venta Actual</h2>
          <div className="lista-carrito">
            {carritoVacio ? (
              <p className="texto-vacio">No hay productos seleccionados</p>
            ) : (
              Object.entries(carrito).map(([id, item]) => (
                <div key={id} className="item-carrito">
                  <span>
                    {item.nombre} {item.cantidad > 0 && `(x${item.cantidad})`}
                  </span>
                  <strong>${item.totalItem}</strong>
                </div>
              ))
            )}
          </div>

          <div className="pie-resumen">
            <div className="contenedor-total">
              <span>TOTAL:</span>
              <span className="monto-total">${totalGeneral}</span>
            </div>

            <div className="contenedor-botones">
              <button
                onClick={() => {
                  if (!carritoVacio) setConfirmarVaciarCarrito(true);
                }}
                className="btn-accion btn-borrar"
                style={{
                  opacity: carritoVacio ? 0.5 : 1,
                  cursor: carritoVacio ? "not-allowed" : "pointer",
                }}
                disabled={carritoVacio}
              >
                BORRAR
              </button>

              <button
                onClick={() => setConfirmarCompra(true)}
                className="btn-accion btn-cobrar"
                style={{
                  opacity: carritoVacio ? 0.5 : 1,
                  cursor: carritoVacio ? "not-allowed" : "pointer",
                }}
                disabled={carritoVacio}
              >
                COBRAR
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: Crear Nuevo Producto */}
        <ModalNuevoProducto
          isOpen={mostrarModalNuevo}
          onClose={() => setMostrarModalNuevo(false)}
          onAgregarProducto={handleAgregarProducto}
        />

        {/* MODAL 2: Confirmar Eliminación */}
        <ModalConfirmacion
          isOpen={!!productoAEliminar}
          titulo="Eliminar Producto"
          mensaje={`¿Estás seguro de que querés eliminar "${productoAEliminar?.nombre}" del catálogo?`}
          textoConfirmar="Eliminar"
          colorBoton="btn-danger"
          onConfirmar={confirmarEliminacionProducto}
          onCancelar={() => setProductoAEliminar(null)}
        />

        {/* MODAL 3: Confirmar Borrado de Carrito */}
        <ModalConfirmacion
          isOpen={confirmarVaciarCarrito}
          titulo="Vaciar Carrito"
          mensaje="¿Estás seguro de que querés borrar todo el pedido actual?"
          textoConfirmar="Vaciar"
          colorBoton="btn-danger"
          onConfirmar={ejecutarVaciarCarrito}
          onCancelar={() => setConfirmarVaciarCarrito(false)}
        />

        {/* MODAL 4: Confirmar Cobro y Registro en Caja */}
        <ModalConfirmacion
          isOpen={confirmarCompra}
          titulo="Confirmar Venta"
          mensaje={`¿Deseas registrar el cobro por un total de $${totalGeneral}?`}
          textoConfirmar="Cobrar"
          colorBoton="btn-success"
          onConfirmar={registrarCobro}
          onCancelar={() => setConfirmarCompra(false)}
        />
      </div>
      <IAgente />
    </div>
  );
}
