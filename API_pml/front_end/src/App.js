import Navbar from './Navbar.js'
import Home from './Home.js'
import  {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import DataProcessing from './DataProcessing.js'
import Threshold from './Threshold.js'
import FeaturesImportance from './FeaturesImportance.js'
console.log({Navbar,Home,DataProcessing,Threshold,FeaturesImportance});

function App(){

  return(
    <Router>
    <div className="App">
      <Navbar/>
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Home/>}> </Route>
            <Route path="/data_processing" element={<DataProcessing/>}> </Route>
            <Route path="/threshold" element={<Threshold/>}></Route>
            <Route path="/features_importance" element={<FeaturesImportance/>}> </Route>
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App;
