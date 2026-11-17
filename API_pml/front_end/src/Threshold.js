import { useState, useEffect } from "react";
import useFetch from "./useFetch";
import {
    ResponsiveContainer,LineChart,Line,XAxis,YAxis,Tooltip,Legend,ReferenceLine} from "recharts"

const num= (x,d = 2) => (typeof x=== "number" ? x.toFixed(d) : "n/a");
const pc = (x) => (typeof x=== "number" ? (x*100).toFixed(1)+"%": "n/a");

const cell = (value, rowTotal,good) => {
            const share = rowTotal >0 ? value / rowTotal: 0;
            const alpha = 0.15 +0.6 *share;
            const color =good ? "22,163,74": "220, 38, 38"; 
            return {
                background: "rgba("+color+","+alpha+")",
                padding: "16px 24px",
                textAlign: "center",
                border: "1px solid #ddd",

            };
        };

        const ConfusionMatrix = ({cm, threshold}) => {
            if(!cm) return null;
            const negTotal = cm.tn + cm.fp;
            const posTotal= cm.fn +cm.tp;
            return (
                <div>
                    <h3>Confusion matrix at threshold: {threshold} </h3>
                    <table style={{borderCollapse: "collapse"}}>
                        <thead>
                         <tr>
                         <th></th>
                         <th>Predicted: not buyer</th>
                         <th>Predicted: buyer</th>
                         </tr>
                        </thead>
                    </table>
                    <tbody>
                        <tr>
                        <th>Actual: not buyer</th>
                        <td style={cell(cm.tn, negTotal, true)}>
                            <b>{cm.fp}</b><br/>True negatives
                        </td>
                        <td style={cell(cm.fp, negTotal, false)}>
                            <b>{cm.fp}</b><br/>False positives
                        </td>

                        <th>Actual: buyer</th>
                        <td style={cell(cm.fn, negTotal, false)}>
                            <b>{cm.fn}</b><br/>False negatives
                        </td>
                        <td style={cell(cm.tp, negTotal, true)}>
                            <b>{cm.tp}</b><br/>True positives
                        </td>
                        </tr>
                    </tbody>
                </div>
                 );
        };

const Threshold = () => {
    const current = useFetch("http://localhost:8000/threshold");
    const sweep = useFetch("http://localhost:8000/plots/threshold-sweep");
    const metrics = useFetch("http://localhost:8000/metrics");
    const [value, setValue] = useState(0.5);
    const [saved, setSaved] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const shown= saved || metrics.data

    useEffect(() => {
        if(current.data) setValue(current.data.threshold);
    }, [current.data]);

    const send = (url, body) => {
        setSaving(true);
        setMessage(null);
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: body ? JSON.stringify(body): undefined,
        })
        .then((res) => {
            if(!res.ok) throw  Error("Threshold could not be updated");
            return res.json();
        })
        .then((m) => {
            setSaved(m);
            setValue(m.threshold);
            setMessage("Threshold has been set to"+num(m.threshold));
        })
        .catch((e) => setMessage(e.message))
        .finally(() => setSaving(false));
    };

    const save = () => send("http://localhost:8000/threshold", {threshold: value});
    const reset = () => send("http://localhost:8000/threshold/reset");

    const tickT = (t) => Number(t).toFixed(1);
    const labelT = (t) => 'Threshold' + Number(t).toFixed(2);

    return (
        <div className="threshold"> 
         <h2> Threshold </h2>

         {current.error && <div>{current.error}</div>}
         {current.isPending && <h3>Loading...</h3>}

          {current.data && (
            <div>
             <p> A shopper is predicted to <b>buy</b> when the model's odss are at or above the threshold. We can lower it to catch more buyers but the false negatives will improve. And we can raise it to get less false positives but we will miss out in some real buyers.</p>
             <label>
             Threshold: <b>{num(value)}</b>
             <input
                type="range"
                min="0.01"
                max="0.99"
                step=".01"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
                style={{width: "100%"}}
                />
             </label>
             <p>Tuned default: {num(current.data.default)}</p>

             <button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Saved Threshold"}
             </button> {" "}
             <button onClick={reset} disabled={saving}>Reset to default</button>
             {message && <p>{message}</p>}

             {saved && (
                <div>

                <table className="metrics-table">
                    <thead>
                        <tr><th>At saved threshold</th><th>Value</th></tr>
                        <tbody>
                        <tr><td>Acurracy</td><td>{pc(saved.accuracy)}</td></tr>
                        <tr><td>Precision</td><td>{pc(saved.precision)}</td></tr>
                        <tr><td>Recall</td><td>{pc(saved.recall)}</td></tr>
                        <tr><td>F1</td><td>{pc(saved.f1)}</td></tr>
                        <tr><td>Missed buyers/False Negatives</td><td>{saved.confusion_matrix?.fn}</td></tr>
                        <tr><td>Wrong alarms/False Positives</td><td>{saved.confusion_matrix?.fp}</td></tr>
                        </tbody>
                    </thead>
                </table>
                </div>
             )}
            </div>
          )}

         <h3> Precision, recall and f1 by threshold</h3>
         {sweep.error && <div>{sweep.error}</div>}
         {sweep.isPending && <h3> Loading...</h3>}
         {sweep.data && (
            <ResponsiveContainer width="100%" height={350}>
             <LineChart data={sweep.data}>
              <XAxis dataKey="threshold" type="number" domain={[0,1]} tickFormatter={tickT} />
              <YAxis domain={[0,1]}/>
              <Tooltip formatter={(v) => Number(v).toFixed(3)} labelFormatter={labelT}/>
                <Legend/>
                <ReferenceLine x={value} stroke="#888" strokeDasharray= "4 4"/>
                <Line type="monotone" dataKey="precision" stroke="#4f46e5" dot={false} />
                <Line type="monotone" dataKey="recall" stroke="#16a34a" dot={false} />
                <Line type="monotone" dataKey="f1" stroke="#f59e0b" dot={false} />
             </LineChart>
            </ResponsiveContainer>
         )}

         <h3>False negatives and positives cause by threshold</h3>
         {sweep.data && (
            <ResponsiveContainer width="100%" height={350}>
             <LineChart data={sweep.data}>
              <XAxis dataKey="threshold" type="number" domain={[0,1]} tickFormatter={tickT} />
              <YAxis/>
              <Tooltip labelFormatter={labelT}/>
                <Legend/>
                <ReferenceLine x={value} stroke="#888" strokeDasharray= "4 4"/>
                <Line type="monotone" dataKey="missed_buyers" name="False negatives" stroke="#dc2626" dot={false} />
                <Line type="monotone" dataKey="wrong_alarms" name="False positives" stroke="#0891b2" dot={false} />
             </LineChart>
            </ResponsiveContainer>
         )}
        

         {shown && (
            <ConfusionMatrix cm={shown.confusion_matrix} threshold={shown.threshold}/>
         )}

         </div>
        
           

    );
};

export default Threshold;