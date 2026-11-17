import { Link } from "react-router-dom";
import useFetch from "./useFetch";

const pc = (x) => (typeof x === "number" ? (x * 100).toFixed(1) + "%" : "n/a");
const num = (x, d = 2) => (typeof x === "number" ? x.toFixed(d) : "n/a");

const Home = () => {
  const health = useFetch("http://localhost:8000/health");
  const metrics = useFetch("http://localhost:8000/metrics");

  return (
    <div className="home">
      <h2>Online Shopper Purchase Intention</h2>
      <p>
        This app uses a machine learning model to estimate whether a visitor to
        an online shop will make a purchase, based on how they behave during
        their session (pages visited, time spent, bounce rate and so on).
      </p>

      <p>
        Backend status:{" "}
        {health.isPending && <b>checking...</b>}
        {health.error && <b style={{ color: "#dc2626" }}>Not connected</b>}
        {health.data && <b style={{ color: "#16a34a" }}>Connected</b>}
      </p>

      {health.error && (
        <p>
          The backend isn't reachable. Start it with{" "}
          <code>python -m uvicorn main:app --reload --port 8000</code>.
        </p>
      )}

      {metrics.data && (
        <div>
          <h3>Model at a glance</h3>
          <table className="metrics-table">
            <tbody>
              <tr><td>Current threshold</td><td>{num(metrics.data.threshold)}</td></tr>
              <tr><td>Recall (buyers found)</td><td>{pc(metrics.data.recall)}</td></tr>
              <tr><td>Precision (correct buyer predictions)</td><td>{pc(metrics.data.precision)}</td></tr>
              <tr><td>Test samples</td><td>{metrics.data.n_test}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <h3>What can I see here</h3>

      <ul>
        <li>
          <Link to="/data_processing">Test results</Link>: accuracy, precision,
          recall, F1, ROC-AUC and the confusion matrix on data the model has
          never seen.
        </li>
        <li>
          <Link to="/threshold">Threshold</Link>: choose how sure the model
          must be before it predicts a buyer, and see the trade-off.
        </li>
        <li>
          <Link to="/features_importance">Feature importance</Link>: see which
          features the model relies on most.
        </li>
      </ul>

      <h3>Disclaimer</h3>
      <p>
        The predictions are estimates, not facts. The model was trained on
        past sessions from one dataset, so it may not behave the same for
        different shops or visitors.
      </p>
    </div>
  );
};

export default Home;