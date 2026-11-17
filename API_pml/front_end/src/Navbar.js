const Navbar = () =>{

    return(
        <nav className="navbar">
            <h1>ML Shopper Intention</h1>
            <div className="Menus">
                <a href="/" style= {{
                    
                    borderRadius:'8px'
                }}>Home</a>
                <a href="/data_processing" style= {{
                    
                    borderRadius:'8px'
                }}>Data Processing</a>
                <a href="/threshold" style= {{
                    borderRadius: '8px'
                }}>Threshold</a>
                <a href="/features_importance" style= {{
                    borderRadius:'10px'
                }}>Features Importance</a>

            </div>
        </nav>
    )

}
export default Navbar;