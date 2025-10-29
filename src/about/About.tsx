/**
 * Prints some information about the app. React component.
 * @returns Component HTML.
 */

import { Link } from "react-router-dom";
import "./About.scss";


function About() {
	//render component html
	let html =
        <div className="d-flex flex-column h-100 overflow-auto">
            {/* 🔹 About Us Section */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <h2 className="mb-4 text-primary">About Us</h2>

                        <p className="lead text-muted">
                            Sito teksto niekas neskaitys, bet sveiki atvyke i{" "}
                            <strong>MyRecipes</strong> Niekam neidomu siaip bet svetaine iseis
                            visai nieko sakyciau tai va. Sekmes ir tegul derlius buna gausus.
                        </p>

                        <p>
                            Kepsim virsim ir visko pridarysimm. Prisijunkite prie musu. Ir
                            siaip tingiu kazka rasyti daugiau xd.
                        </p>

                        {/* Use React Router for navigation instead of plain <a href> */}
                        <Link to="/" className="btn btn-primary mt-3">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>

	//
	return html;
}

//
export default About;