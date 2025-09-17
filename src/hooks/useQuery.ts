import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
    const { search, pathname } = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);

    const handleChange = (event: any, query: string) => {
        if (event) {
            queryParams.set(query, String(event));
        } else {
            queryParams.delete(query);
        }
        navigate(`${pathname}?${queryParams.toString()}`);
    };

    return { query: queryParams, handleChangeQuery: handleChange };
}

export default useQuery;