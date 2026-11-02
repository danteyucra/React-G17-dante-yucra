import { useState, useEffect } from "react"
import type {EstadoCarga, Producto} from "./dominio/tipos"
import { obtenerProductos } from "./infraestructura/api"
import Detalle from './ui/pages/Detalle';
import { Route, Routes } from "react-router-dom"
import { Home } from "./ui/pages/Home"
import Layout from "./ui/layout/Layout"
import NoEncontrada from "./ui/pages/NoEncontrada"
import Checkout from "./ui/pages/Checkout"
import Login from "./ui/pages/Login";
import RutaProtegida from "./ui/components/RutaProtegida";

export default function App() {

  const [productos, setProductos] = useState<Producto[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [esRespaldo, setEsRespaldo] = useState(false);
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controlador = new AbortController();
    async function cargar () {
      try {
        const resultado = await obtenerProductos(controlador.signal);
        setProductos(resultado.productos);
        setEsRespaldo(resultado.esRespaldo);
        setEstado('listo');
      } catch (error) {
        if(error instanceof DOMException && error.name === 'AbortError') return;
        console.warn('Fallo imprevisto al cargar');
        setEstado('error');
      }
    }
    cargar();
    return () => controlador.abort();
  },[intento])
  
  return (
    <Routes>
      <Route element = {
        <Layout/>
      }>
        <Route path="/" element = {
          <Home esRespaldo={esRespaldo} OnReintentar={() => {setIntento(intento + 1); setEstado('cargando')}}
          productos={productos} estado={estado}/>
        }
        />
        <Route  path="/producto/:id" element = {
          <Detalle productos={productos} estado={estado}/>
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
      </Route>
      <Route path="*" element ={
          <NoEncontrada/>
      }/>
    </Routes>
  )
}