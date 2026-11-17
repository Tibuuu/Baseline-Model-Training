import useFetch from "./useFetch";
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip} from "recharts";

const FeatureImportance = () => {

    const {data, isPending, error} = useFetch("http://localhost:8000/feature-importance")

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
                    <p>Como podemos ver bla bla bla bla /terminar/</p>

            </div>

        )
}

export default FeatureImportance;