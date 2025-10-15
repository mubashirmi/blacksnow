import { useCallback, useMemo, useState } from 'react';

const useBoolean = (startingValue = false) => {
    const [value, setValue] = useState(startingValue);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    const toggle = useCallback(() => setValue((value) => !value), []);
    const handlers = useMemo(() => ({ setTrue, setFalse, toggle }), [setFalse, setTrue, toggle]);
    return [value, handlers] as const;
};

export { useBoolean };
