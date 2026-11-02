import type { Usuario } from "../dominio/tipos";

const BASE = import.meta.env.VITE_API_URL;
const MINUTOS_SESION = 30;
interface RespuestaLogin {
    id: number;
    username: string;
    firstName?: string;
    email : string;
    accessToken : string;
}
export async function iniciarSesion(usuario : string, clave: string) : Promise<Usuario>{
    const r = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({username: usuario, password: clave, expiresInMins: MINUTOS_SESION})
    });
    if(!r.ok) throw new Error ('Usuario o contrasenia incorrecta');
    const data = (await r.json()) as RespuestaLogin;

    return {
        id: data.id,
        nombre: data.firstName || data.username,
        email: data.email,
        token : data.accessToken,
        expiraEn: Date.now() + MINUTOS_SESION * 60 * 1000 
        // 9:11 + 30 min
    }
}

export async function obtenerPerfil (token : string, signal? : AbortSignal) : Promise<void> {
    const r = await fetch(`${BASE}/auth/me`, {
        headers : {
            'Authorization' : `Bearer ${token}`
        },
        signal
    });
    if(!r.ok) throw new Error (`Sesion rechazada por el servidor (HTTP ${r.status})`);
}

export interface DatosRegistro {
    nombre : string;
    usuario : string;
    email : string;
    clave : string;
}

export async function registrarUsuario (datos : DatosRegistro, signal? : AbortSignal) : Promise<void> {
    const r = await fetch(`${BASE}/users/add`, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify({
            firstName: datos.nombre,
            username: datos.usuario,
            email: datos.email,
            password: datos.clave
        }),
        signal
    });
    if(!r.ok) throw new Error (`No se pudo crear la cuenta (HTTP ${r.status})`);
}
