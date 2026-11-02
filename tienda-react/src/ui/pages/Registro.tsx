import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { registrarUsuario, type DatosRegistro } from "../../infraestructura/auth";

type Errores = Partial<Record<keyof DatosRegistro, string>>;

function validar (form : DatosRegistro) : Errores {
    const errores : Errores = {};
    if(form.nombre.trim().length < 2) errores.nombre = 'Escribe tu nombre';
    if(form.usuario.trim().length < 4) errores.usuario = 'El usuario necesita al menos 4 caracteres';
    if(!/^\S+@\S+\.\S+$/.test(form.email)) errores.email = 'Escribe un correo electronico valido';
    if(form.clave.length < 6) errores.clave = 'La contrasenia necesita al menos 6 caracteres';
    return errores;
}

export default function Registro() {
    const [form, setForm] = useState<DatosRegistro>({ nombre: '', usuario: '', email: '', clave: '' });
    const [tocados, setTocados] = useState<Partial<Record<keyof DatosRegistro, boolean>>>({});
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [creada, setCreada] = useState(false);
    const errores = validar(form);
    const hayErrores = Object.keys(errores).length > 0;

    const cambiar = (campo : keyof DatosRegistro) => (e : ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [campo]: e.target.value }));
    const marcar = (campo : keyof DatosRegistro) => () =>
        setTocados((t) => ({ ...t, [campo]: true }));

    async function enviar(e : FormEvent) {
        e.preventDefault();
        setTocados({ nombre: true, usuario: true, email: true, clave: true });
        if(hayErrores) return;
        setError('');
        setEnviando(true);
        try {
            await registrarUsuario(form);
            setCreada(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
        } finally {
            setEnviando(false);
        }
    }

    if(creada) {
        return (
            <div className="mx-auto max-w-sm">
                <h1 className="text-2xl font-bold">Cuenta creada</h1>
                <p className="mt-2 text-sm">Bienvenido, {form.nombre}. Ya puedes iniciar sesion.</p>
                <Link to="/login" className="underline">Ir a iniciar sesion</Link>
            </div>
        )
    }

    const campos : { campo : keyof DatosRegistro; etiqueta : string; tipo : string }[] = [
        { campo: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
        { campo: 'usuario', etiqueta: 'Usuario', tipo: 'text' },
        { campo: 'email', etiqueta: 'Correo electronico', tipo: 'email' },
        { campo: 'clave', etiqueta: 'Contrasenia', tipo: 'password' }
    ];

    return (
        <form onSubmit={enviar} className="mx-auto flex max-w-sm flex-col gap-3">
            <h1 className="text-2xl font-bold">Crear cuenta</h1>
            {campos.map(({ campo, etiqueta, tipo }) => (
                <label key={campo} className="flex flex-col text-sm">
                    {etiqueta}
                    <input type={tipo} className="rounded border px-3 py-2" value={form[campo]}
                        onChange={cambiar(campo)} onBlur={marcar(campo)} />
                    {tocados[campo] && errores[campo] && (
                        <span className="text-xs text-red-600">{errores[campo]}</span>
                    )}
                </label>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="rounded-full border px-4 py-2" disabled={enviando}>
                {enviando ? 'Creando...' : 'Registrarme'}
            </button>
            <p className="text-sm">Ya tienes cuenta? <Link to="/login" className="underline">Inicia sesion</Link></p>
        </form>
    )
}
