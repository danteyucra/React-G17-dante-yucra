import { useEffect, useState, type DependencyList } from "react";

export function useApi<T>(peticion : (signal : AbortSignal) => Promise<T>, dependencias : DependencyList) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controlador = new AbortController();
        setIsLoading(true);
        setError(null);
        peticion(controlador.signal)
            .then((resultado) => {
                setData(resultado);
                setIsLoading(false);
            })
            .catch((e : unknown) => {
                if(e instanceof DOMException && e.name === 'AbortError') return;
                setError(e instanceof Error ? e : new Error('Error desconocido'));
                setIsLoading(false);
            });
        return () => controlador.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencias, intento]);

    return { data, error, isLoading, refetch : () => setIntento((i) => i + 1) };
}
