import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const trucks = [
    { id: "1", image: "/images/truck1.jpg", name: "Truck 1" },
    { id: "2", image: "/images/truck2.jpg", name: "Truck 2" },
    { id: "3", image: "/images/truck3.jpg", name: "Truck 3" },
  ];

  const filteredTrucks = trucks.filter((truck) =>
    truck.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home">
      <h1>Tyre Manager</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a truck..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>
      <div className="tabs">
        {filteredTrucks.length > 0 ? (
          filteredTrucks.map((truck) => (
            <div
              key={truck.id}
              onClick={() =>
                navigate(`/truck/${truck.id}`, {
                  state: { image: truck.image },
                })
              }
              className="tab"
            >
              <img src={truck.image} alt={truck.name} />
              <span>{truck.name}</span>
            </div>
          ))
        ) : (
          <p className="no-results">No trucks found</p>
        )}
      </div>
    </div>
  );
}

export default Home;
