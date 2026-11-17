import useFetch from "./useFetch";
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip} from "recharts";

const FeatureImportance = () => {

    const {data, isPending, error} = useFetch("http://localhost:8000/feature-importance")

    const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => b.importance - a.importance)
        : null;
    const total = sorted ? sorted.reduce((s, r) => s + Math.max(0, r.importance), 0) : 0;
    const share = (x) => (total > 0 ? (Math.max(0, x) / total) * 100 : 0);
    const top3 = sorted ? sorted.slice(0, 3) : [];
    const top3Share = top3.reduce((s, r) => s + share(r.importance), 0);
    const unused = sorted ? sorted.filter((r) => r.importance <= 0) : [];


        return(
            <div className="feats">
                <h2>Features Importance</h2>
                    {error && <div>{error}</div>}
                    {isPending && <h3>Loading...</h3>}
                    {data && <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={data} layout= "vertical">
                             <XAxis type="number" />
                             <YAxis type="category" dataKey="feature" width={180} />
                             <Tooltip />
                             <Bar dataKey="importance" fill="#f1356d"/>
                            </BarChart>
                    </ResponsiveContainer>
                    }
                   
                    {sorted && (
                        <div>
                            <h3>Summary</h3>
                            <p>
                                The most important feature is <b>{top3[0]?.feature}</b>, followed by{" "}
                                <b>{top3[1]?.feature}</b> and <b>{top3[2]?.feature}</b>. Together these
                                three account for about <b>{top3Share.toFixed(0)}%</b> of the total
                                importance, so the model relies heavily on a small number of features.
                            </p>
                            {unused.length > 0 && (
                                <p>
                                    {unused.length} feature(s) add little or nothing to the predictions:{" "}
                                    {unused.map((r) => r.feature).join(", ")}.
                                </p>
                            )}

                            <h3>Ranking</h3>
                            <table className="metrics-table">
                                <thead>
                                    <tr>
                                        <th>#</th><th>Feature</th><th>Importance</th><th>Share of total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map((r, i) => (
                                        <tr key={r.feature}>
                                            <td>{i + 1}</td>
                                            <td>{r.feature}</td>
                                            <td>{Number(r.importance).toFixed(4)}</td>
                                            <td>
                                                <div style={{ background: "#e5e7eb", width: 120, borderRadius: 4 }}>
                                                    <div style={{
                                                        background: "#f1356d", height: 10, borderRadius: 4,
                                                        width: share(r.importance) + "%",
                                                    }} />
                                                </div>
                                                {share(r.importance).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h3>How to read this</h3>
                            <ul>
                                <li>Importance shows what the model relies on, not what causes a purchase.</li>
                                <li>Correlated features share importance, so each one can look less important than it is.</li>
                                <li>Importance is global. It doesn't explain why one specific shopper got their prediction.</li>
                                <li>If a sensitive or proxy feature ranks high, it should be questioned.</li>
                            </ul>
                        </div>
                    )}
            </div>

        )
}

export default FeatureImportance;