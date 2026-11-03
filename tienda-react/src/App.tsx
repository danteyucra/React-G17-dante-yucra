import { useState, useEffect } from "react"
import type {EstadoCarga, Producto} from "./dominio/tipos"
import { obtenerProductos, PRODUCTOS_POR_PAGINA } from "./infraestructura/api"
import Detalle from './ui/pages/Detalle';
import { Route, Routes, useSearchParams } from "react-router-dom"
import { Home } from "./ui/pages/Home"
import Layout from "./ui/layout/Layout"
import NoEncontrada from "./ui/pages/NoEncontrada"
import Checkout from "./ui/pages/Checkout"
import Login from "./ui/pages/Login";
import Registro from "./ui/pages/Registro";
import Contacto from "./ui/pages/Contacto";
import RutaProtegida from "./ui/components/RutaProtegida";

export default function App() {

  const [productos, setProductos] = useState<Producto[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [esRespaldo, setEsRespaldo] = useState(false);
  const [intento, setIntento] = useState(0);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useSearchParams();
  const totalPaginas = Math.max(1, Math.ceil(total / PRODUCTOS_POR_PAGINA));
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);
  function irAPagina(n : number) {
    setParams(n <= 1 ? {} : { pagina: String(n) });
    window.scrollTo({ top: 0 });
  }
  useEffect(() => {
    const controlador = new AbortController();
    async function cargar () {
      try {
        const resultado = await obtenerProductos(pagina, controlador.signal);
        setProductos(resultado.productos);
        setTotal(resultado.total);
        setEsRespaldo(resultado.esRespaldo);
        setEstado('listo');
      } catch (error) {
        if(error instanceof DOMException && error.name === 'AbortError') return;
        console.warn('Fallo imprevisto al cargar');
        setEstado('error');
      }
    }
    setEstado('cargando');
    cargar();
    return () => controlador.abort();
  },[intento, pagina])
  
  return (
    <Routes>
      <Route element = {
        <Layout/>
      }>
        <Route path="/" element = {
          <Home esRespaldo={esRespaldo} OnReintentar={() => {setIntento(intento + 1); setEstado('cargando')}}
          productos={productos} estado={estado}
          pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={irAPagina}/>
        }
        />
        <Route  path="/producto/:id" element = {
          <Detalle/>
        }
        />
        <Route element={<RutaProtegida/>}>
          <Route  path="/checkout" element = {
            <Checkout/>
          }
          />
        </Route>
        <Route path="/login" element = {
          <Login/>
        }/>
        <Route path="/registro" element = {
          <Registro/>
        }/>
        <Route path="/contacto" element = {
          <Contacto/>
        }/>
      </Route>
      <Route path="*" element ={
          <NoEncontrada/>
      }/>
    </Routes>
  )
}