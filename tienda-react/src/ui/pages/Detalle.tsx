import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { EstadoCarga, Producto } from "../../dominio/tipos";
import EtiquetaStock from "../components/EtiquetaStock";
import formatearPrecio from "../formato";
import { useCart } from "../../aplicacion/useCart";
import { obtenerProducto } from "../../infraestructura/api";

export default function Detalle () {
    const {id} = useParams();
    const {agregar} = useCart();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [estado, setEstado] = useState<EstadoCarga>('cargando');
    useEffect(() => {
        const controlador = new AbortController();
        setEstado('cargando');
        obtenerProducto(Number(id), controlador.signal)
            .then((p) => { setProducto(p); setEstado('listo'); })
            .catch((error : unknown) => {
                if(error instanceof DOMException && error.name === 'AbortError') return;
                setEstado('error');
            });
        return () => controlador.abort();
    }, [id]);
    if(estado === 'cargando') {
        return <p className="p-6 text-gray-500">Cargando producto...</p>;
    }
    if(estado === 'error' || !producto) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Producto no encontrado</p>
                <Link to="/">Volver al catalogo</Link>
            </div>
        )
    }
    return (
        <article className="flex flex-wrap gap-8 p-6">
            <Link to="/" className="w-full text-sm underline">Volver al catalogo</Link>
            <img src={producto.imagen} alt={producto.nombre} className="w-72 rounded-xl object-contain" />
            <div>
                <p className="text-sm text-gray-500">{producto.marca} · {producto.categoria}</p>
                <h1 className="text-2xl font-bold">{producto.nombre}</h1>
                <EtiquetaStock stock={producto.stock}></EtiquetaStock>
                <p className="mt-2 text-xl">{formatearPrecio(producto.precio * 1.18)} con IGV</p>
                <button className="mt-4 rounded-full border px-4 py-1"
                onClick={() => agregar(producto)}
                >
                    {
                        producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'
                    }
                </button>
            </div>
        </article>
    )
}