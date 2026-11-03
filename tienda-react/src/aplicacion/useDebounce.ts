import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";

export function useDebounce<T>(valor : T, ms = 400) : T {
    const [debounced, setDebounced] = useState(valor);
    const actualizar = useMemo(() => debounce((v : T) => setDebounced(v), ms), [ms]);
    useEffect(() => {
        actualizar(valor);
        return () => actualizar.cancel();
    }, [valor, actualizar]);
    return debounced;
}
