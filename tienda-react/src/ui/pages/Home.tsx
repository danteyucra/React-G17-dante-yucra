import { useEffect, useMemo, useState } from "react";
import type { EstadoCarga, Producto } from "../../dominio/tipos";
import SkeletonCard from "../components/SkeletonCard";
import ProductCard from "../components/ProductCard";
import Paginacion from "../components/Paginacion";
import { useCart } from "../../aplicacion/useCart";

interface Props {
    esRespaldo : boolean ;
    OnReintentar : () => void;
    productos : Producto[];
    estado : EstadoCarga;
    pagina : number;
    totalPaginas : number;
    onCambiarPagina : (n : number) => void;
}   
const nombreTienda = 'Tienda Tech';

export function Home ( {esRespaldo, OnReintentar, productos, estado, pagina, totalPaginas, onCambiarPagina} : Props) {
    const {agregar} = useCart();
    const categorias = ['todas', ...new Set(productos.map(p => p.categoria))];
    const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
    const [termino, setTermino] = useState('');
    const busqueda = termino.trim().toLowerCase();  
    const visibles = useMemo( () => productos.filter( (p) => (
        (categoriaActiva === 'todas' || p.categoria === categoriaActiva) && 
        (busqueda === '' || p.nombre.toLowerCase().includes(busqueda) || 
        p.marca.toLowerCase().includes(busqueda))
    )), [productos, categoriaActiva, busqueda]);
    useEffect(() => {
        document.title = `${nombreTienda} - ${visibles.length} resultados`;
    },[visibles.length]);
    
    return (
        <>
            {
                esRespaldo && (
                    <p className="mb-4 rounded-lg border border-orange-300 bg-orange-500 p-2 text-sm">
                        Mostrando el catalogo Local, no pudimos conectar con la tienda.
                        {/* () => {setIntento(intento + 1); setEstado('cargando')} OnReintentar*/} 
                    <button className="ml-2 underline" onClick={OnReintentar}>Reintentar</button>
                    </p>
                )
            }
            <nav className="mb-4 flex gap-2" aria-label="Filtrar por categoria">
                {
                categorias.map((c) => (
                    <button key={c} onClick={() => setCategoriaActiva(c)} 
                    className={`rounded-full border px-3 py-1 text-sm ${ c === categoriaActiva ? 'bg-black text-white' : ''}`}>{c}
                    </button>
                ))
                }
            </nav>
            <input type="search" placeholder="Buscar por nombre o marca..." 
                className="mb-4 w-64 rounded-lg border px-3 py-2 text-sm"
                value={termino} aria-label="Buscar productos"
                onChange={(e) => setTermino(e.target.value)}
            />
            {estado === 'cargando' && (
                <section className="flex flex-wrap gap-4">
                    {Array.from({length : 8}).map((_, indice) => (
                        <SkeletonCard key={indice}/>
                    ))}
                </section>
            )}
            {estado === 'error' && <p className="text-red-600">No pudimos cargar los productos</p>}
            <p className="mb-4 text-sm text-gray-500">{visibles.length} productos</p>
            {estado === 'listo' && visibles.length === 0 && (
                <p className="text-gray-500">{
                    busqueda !== '' ? `No encontramos productos para "${termino.trim()}"` : 'No hay productos en esta categoria'
                }</p>
            )}
            {estado === 'listo' && (
                <section>
                {
                    visibles.map((p) => <ProductCard producto={p} key={p.id} onAgregar={agregar}/>)
                }
                </section>
                )
            }
            {estado === 'listo' && totalPaginas > 1 && (
                <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={onCambiarPagina}/>
            )}
        </>
    )
}