import type { EstadoCarga } from "./dominio/tipos"
import { useApi } from "./aplicacion/useApi"
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
  const [params, setParams] = useSearchParams();
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);
  const consulta = params.get('q') ?? '';
  const { data, error, isLoading, refetch } = useApi(
    (signal) => obtenerProductos(pagina, consulta, signal),
    [pagina, consulta]
  );
  const productos = data?.productos ?? [];
  const esRespaldo = data?.esRespaldo ?? false;
  const totalPaginas = Math.max(1, Math.ceil((data?.total ?? 0) / PRODUCTOS_POR_PAGINA));
  const estado : EstadoCarga = isLoading ? 'cargando' : error ? 'error' : 'listo';

  function irAPagina(n : number) {
    if(n === pagina) return;
    setParams((p) => {
      const siguiente = new URLSearchParams(p);
      if(n <= 1) siguiente.delete('pagina'); else siguiente.set('pagina', String(n));
      return siguiente;
    });
    window.scrollTo({ top: 0 });
  }
  function buscar(texto : string) {
    setParams(texto ? { q: texto } : {}, { replace: true });
  }

  return (
    <Routes>
      <Route element = {
        <Layout/>
      }>
        <Route path="/" element = {
          <Home esRespaldo={esRespaldo} OnReintentar={refetch}
          productos={productos} estado={estado}
          pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={irAPagina}
          consulta={consulta} onBuscar={buscar}/>
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