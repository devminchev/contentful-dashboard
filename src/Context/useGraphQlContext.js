import { useContext } from "react";
import { GraphQlContext } from "./GraphQlProvider";

function useGraphQlContext() {
    return useContext(GraphQlContext);
};

export default useGraphQlContext;
