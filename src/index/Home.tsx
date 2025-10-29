import { useEffect, useState } from "react";
import backend from "../app/backend";
import config from "../app/config";

import './Home.scss';

function Home() {
    return (
        <div className="home-page">
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card recipe-card h-100">
                            <img src="https://source.unsplash.com/600x400/?pasta" className="card-img-top" alt="Recipe" />
                            <div className="card-body">
                                <h5 className="card-title">Creamy Garlic Pasta</h5>
                                <p className="card-text">A creamy pasta with garlic, parmesan, and herbs.</p>
                                <a href="#" className="btn btn-primary">View Recipe</a>
                            </div>
                        </div>
                    </div>
                    {/* Repeat cards here */}
                </div>
            </div>
        </div>
    );
}

export default Home;
