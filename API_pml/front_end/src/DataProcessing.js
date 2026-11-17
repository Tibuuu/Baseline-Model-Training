import useFetch from "./useFetch";

const pc = (x) => (x*100).toFixed(1)+ "%";

const DataProcessing= () => {
     const {data, isPending, error} = useFetch("http://localhost:8000/metrics")

     return(
        <div className="datap">
            <h2>Test results</h2>
            {error && <div>{error}</div>}
            {isPending && <h3>Loading...</h3>}
            {data && (
                <div>
                 <p>Threshold: {data.threshold.toFixed(3)}</p>
                 <table className="metrics-table">
                    <thead>
                        <tr><th>Metri</th><th>Values</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Acurracy</td><td>{pc(data.acurracy)}</td></tr>
                        <tr><td>Precision</td><td>{pc(data.precision)}</td></tr>
                        <tr><td>Recall</td><td>{pc(data.recall)}</td></tr>
                        <tr><td>F1</td><td>{pc(data.f1)}</td></tr>
                        <tr><td>RON-AUC</td><td>{pc(data.roc_aux.toFixed(3))}</td></tr>
                    </tbody>
                 </table>

                 <h3>COnfusion matrix</h3>

                </div>
            )


            }
        </div>
     )
}
