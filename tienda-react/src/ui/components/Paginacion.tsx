interface Props {
    pagina : number;
    totalPaginas : number;
    onCambiar : (n : number) => void;
}

export default function Paginacion ({pagina, totalPaginas, onCambiar} : Props) {
    const paginas = Array.from({length : totalPaginas}, (_, i) => i + 1);
    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacion">
            <button className="rounded-full border px-3 py-1 text-sm" disabled={pagina === 1}
                onClick={() => onCambiar(pagina - 1)}>Anterior</button>
            {paginas.map((n) => (
                <button key={n} onClick={() => onCambiar(n)} aria-current={n === pagina ? 'page' : undefined}
                    className={`rounded-full border px-3 py-1 text-sm ${n === pagina ? 'bg-black text-white' : ''}`}>
                    {n}
                </button>
            ))}
            <button className="rounded-full border px-3 py-1 text-sm" disabled={pagina === totalPaginas}
                onClick={() => onCambiar(pagina + 1)}>Siguiente</button>
        </nav>
    )
}
