import { Link } from "react-router-dom";
import formatearPrecio from "../formato";
import type { DatosEnvio, Pedido } from "../../dominio/tipos";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { guardarPedido } from "../../infraestructura/pedidos";
import { useCart } from "../../aplicacion/useCart";

type Errores = Partial<Record<keyof DatosEnvio, string>>
function validar (form : DatosEnvio) : Errores {
    const errores : Errores = {}
    if(form.nombre.trim().length < 3) errores.nombre = 'Escribe al menos 3 caracteres';
    if(!/^\S+@\S+\.\S+$/.test(form.email)) errores.email = 'Escribe un correo electronico valido';
    if(form.direccion.trim().length < 5) errores.direccion = 'Escribe una direccion mas completa';
    if(!/^[0-9\s+-]{7,}$/.test(form.telefono)) errores.telefono = 'Escriba almenos 7 digitos';
    return errores;
}
export default function Checkout () {
    const {total, items, vaciar } = useCart();
    const [form, setForm] = useState<DatosEnvio>({ nombre : '', email: '', direccion: '', telefono:'' });
    type tocadoType = Partial<Record<keyof DatosEnvio, boolean>>;
    const [tocados, setTocados] = useState<tocadoType>({}); 
    const [numeroPedido, setNumeroPedido] = useState(0);
    const errores = validar(form);
    const hayErrores = Object.keys(errores).length > 0;
    const cambiar = (campo : keyof DatosEnvio) => (e : ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({...f, [campo] : e.target.value})); // abcvdffe
    const marcar = (campo : keyof DatosEnvio ) => () => 
        setTocados((tocados) => ({...tocados , [campo] : true}));
    function enviar(e : FormEvent) {
        e.preventDefault();
        setTocados({nombre: true, email:true, direccion: true, telefono:true});
        if(hayErrores) return;
        const pedido : Pedido = {
            id : Date.now(),
            fecha : new Date().toISOString(),
            cliente: form,
            items : items,
            total : total
        };
        guardarPedido(pedido);
        setNumeroPedido(pedido.id);
        vaciar();
    }
    if(numeroPedido !== 0){
        return( 
            <div className="p-6">
                <h1 className="text-2xl font-bold">Gracias por tu compra</h1>
                <p className="mt-2 text-sm text-gray-200">Tu pedido Nro. {numeroPedido} quedo registrado</p>
                <Link to="/" className="underline">Volver al catalogo</Link>
            </div>
        )
    }
    if(items.length === 0) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Tu carrito esta vacio: no hay nada que pagar</p>
                <Link to="/" className="underline">Volver al catalogo</Link>
            </div>
        )
    }
    return(
        <form className="flex max-w-md flex-col gap-3" onSubmit={enviar}>
            <h1 className="text-2xl font-bold">Datos de envio</h1>
            <label className="flex flex-col text-sm">
                Nombre completo
                <input type="text" className="rounded border px-3 py-2" value={form.nombre} 
                    onChange={cambiar('nombre')} onBlur={marcar('nombre')}/>
                {
                    tocados.nombre && errores.nombre &&(
                        <span className="text-xs text-red-600">{errores.nombre}</span>
                    )
                }
            </label>
            <label className="flex flex-col text-sm">
                Correo electronico
                <input type="email" className="rounded border px-3 py-2" value={form.email} 
                    onChange={cambiar('email')} onBlur={marcar('email')}/>
                {
                    tocados.email && errores.email &&(
                        <span className="text-xs text-red-600">{errores.email}</span>
                    )
                }
            </label>
            <label className="flex flex-col text-sm">
                Direccion
                <input type="text" className="rounded border px-3 py-2" value={form.direccion} 
                    onChange={cambiar('direccion')} onBlur={marcar('direccion')}/>
                {
                    tocados.direccion && errores.direccion &&(
                        <span className="text-xs text-red-600">{errores.direccion}</span>
                    )
                }
            </label>
            <label className="flex flex-col text-sm">
                Telefono
                <input type="text" className="rounded border px-3 py-2" value={form.telefono} 
                    onChange={cambiar("telefono")} onBlur={marcar('telefono')}/>
                {
                    tocados.telefono && errores.telefono &&(
                        <span className="text-xs text-red-600">{errores.telefono}</span>
                    )
                }
            </label>
            <p className="text-sm">Total a pagar : <b>{formatearPrecio(total)}</b></p>
            <button type="submit" className="mt-2 rounded-full border px-4 py-2">Confirmar pedido</button>
        </form>
    )
}