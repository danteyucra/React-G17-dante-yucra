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

export async function obtenerProductos(signal? : AbortSignal): Promise <{ productos : Producto[] ; esRespaldo: boolean}> {
    try {
        const r = await fetch(`${BASE}/products?limit=24`, { signal });
        if(!r.ok) throw new Error (`HTTP ${r.status}`);
        const data = (await r.json()) as { products : ProductoAPI[]};
        return {
            productos : data.products.map(mapearProducto),
            esRespaldo : false
        }
    } catch (error) {
        if(error instanceof DOMException && error.name === 'AbortError') throw error;
        console.warn('Api no disponible, usando el catalogo semilla.', error instanceof Error ? error.message : error);
        return {
            productos : respaldo,
            esRespaldo : true
        };
    }
}