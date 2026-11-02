import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

interface Mensaje {
    nombre : string;
    email : string;
    texto : string;
}

type Errores = Partial<Record<keyof Mensaje, string>>;

function validar (form : Mensaje) : Errores {
    const errores : Errores = {};
    if(form.nombre.trim().length < 3) errores.nombre = 'Escribe al menos 3 caracteres';
    if(!/^\S+@\S+\.\S+$/.test(form.email)) errores.email = 'Escribe un correo electronico valido';
    if(form.texto.trim().length < 10) errores.texto = 'Cuentanos un poco mas (minimo 10 caracteres)';
    return errores;
}

export default function Contacto() {
    const [form, setForm] = useState<Mensaje>({ nombre: '', email: '', texto: '' });
    const [tocados, setTocados] = useState<Partial<Record<keyof Mensaje, boolean>>>({});
    const [enviado, setEnviado] = useState(false);
    const errores = validar(form);
    const hayErrores = Object.keys(errores).length > 0;

    useEffect(() => {
        document.title = 'Tienda Tech - Contacto';
    }, []);

    const cambiar = (campo : keyof Mensaje) => (e : ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [campo]: e.target.value }));
    const marcar = (campo : keyof Mensaje) => () =>
        setTocados((t) => ({ ...t, [campo]: true }));

    function enviar(e : FormEvent) {
        e.preventDefault();
        setTocados({ nombre: true, email: true, texto: true });
        if(hayErrores) return;
        setEnviado(true);
    }

    return (
        <section className="mx-auto max-w-md">
            <h1 className="text-2xl font-bold">Acerca de nosotros</h1>
            <p className="mt-2 text-sm text-gray-500">
                Somos una tienda de tecnologia. Escribenos y te respondemos en menos de 24 horas.
            </p>
            {enviado ? (
                <p className="mt-6">Gracias {form.nombre}, recibimos tu mensaje.</p>
            ) : (
                <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
                    <label className="flex flex-col text-sm">
                        Nombre
                        <input type="text" className="rounded border px-3 py-2" value={form.nombre}
                            onChange={cambiar('nombre')} onBlur={marcar('nombre')} />
                        {tocados.nombre && errores.nombre && <span className="text-xs text-red-600">{errores.nombre}</span>}
                    </label>
                    <label className="flex flex-col text-sm">
                        Correo electronico
                        <input type="email" className="rounded border px-3 py-2" value={form.email}
                            onChange={cambiar('email')} onBlur={marcar('email')} />
                        {tocados.email && errores.email && <span className="text-xs text-red-600">{errores.email}</span>}
                    </label>
                    <label className="flex flex-col text-sm">
                        Mensaje
                        <textarea rows={4} className="rounded border px-3 py-2" value={form.texto}
                            onChange={cambiar('texto')} onBlur={marcar('texto')} />
                        {tocados.texto && errores.texto && <span className="text-xs text-red-600">{errores.texto}</span>}
                    </label>
                    <button type="submit" className="rounded-full border px-4 py-2">Enviar</button>
                </form>
            )}
        </section>
    )
}
