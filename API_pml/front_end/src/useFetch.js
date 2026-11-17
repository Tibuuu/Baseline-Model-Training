import { useState, useEffect } from "react";


function useFetch(url) {
  const [isPending, setIsPending] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

    useEffect( () => {
      fetch(url)
        .then(res => {
            if(!res.ok){
              throw Error('Fetch failed, try connecting to the url');
            }
            return res.json();
        })
        .then((data) =>{
          setIsPending(false);
          setData(data);
        })
        .catch( error => {
          setIsPending(false);
          setError(error.message);
        })
    }, [url]);
    return {data, isPending, error}
}
export default useFetch;