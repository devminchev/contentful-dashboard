import { useContext } from "react";
import { OpenSearchContext } from "./OpenSearchProvider";

function useOpenSearchContext() {
    return useContext(OpenSearchContext);
};

export default useOpenSearchContext;
