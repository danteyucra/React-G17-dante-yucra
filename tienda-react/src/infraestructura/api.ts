import type { Producto } from "../dominio/tipos";
import { productos as respaldo } from "./datos";
const BASE = import.meta.env.VITE_API_URL;

interface ProductoAPI {
    id : number;
    title : string;
    brand?: string;
    price : number;
    thumbnail : string;
    category?: string;
    stock?: number;
}

function mapearProducto (crudo : ProductoAPI) : Producto {
    return {
        id: crudo.id ,
        nombre : crudo.title,
        marca : crudo.brand ?? '',
        precio : crudo.price,
        imagen : crudo.thumbnail,
        categoria : crudo.category ?? 'otros',
        stock : crudo.stock ?? 0
    }
}

export const PRODUCTOS_POR_PAGINA = 12;

export interface PaginaProductos {
    productos : Producto[];
    total : number;
    esRespaldo : boolean;
}

export async function obtenerProductos(pagina : number, signal? : AbortSignal): Promise <PaginaProductos> {
    const skip = (pagina - 1) * PRODUCTOS_POR_PAGINA;
    try {
        const r = await fetch(`${BASE}/products?limit=${PRODUCTOS_POR_PAGINA}&skip=${skip}`, { signal });
        if(!r.ok) throw new Error (`HTTP ${r.status}`);
        const data = (await r.json()) as { products : ProductoAPI[]; total : number };
        return {
            productos : data.products.map(mapearProducto),
            total : data.total,
            esRespaldo : false
        }
    } catch (error) {
        if(error instanceof DOMException && error.name === 'AbortError') throw error;
        console.warn('Api no disponible, usando el catalogo semilla.', error instanceof Error ? error.message : error);
        return {
            productos : respaldo.slice(skip, skip + PRODUCTOS_POR_PAGINA),
            total : respaldo.length,
            esRespaldo : true
        };
    }
}

export async function obtenerProducto(id : number, signal? : AbortSignal) : Promise<Producto | null> {
    try {
        const r = await fetch(`${BASE}/products/${id}`, { signal });
        if(r.status === 404) return null;
        if(!r.ok) throw new Error (`HTTP ${r.status}`);
        return mapearProducto((await r.json()) as ProductoAPI);
    } catch (error) {
        if(error instanceof DOMException && error.name === 'AbortError') throw error;
        console.warn('No se pudo cargar el producto, buscando en el catalogo semilla.');
        return respaldo.find((p) => p.id === id) ?? null;
    }
}
