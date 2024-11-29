import { get, ref, update, onValue } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { BeatLoader } from "react-spinners";

function TruckDetails() {
  const { id } = useParams();
  const backgroundImage = `/images/truck${id}.jpg`;
  const [truckData, setTruckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [qLoad, setQLoad] = useState(""); // Load input field (kg)
  const [qLoaded, setQLoaded] = useState(0); // Confirmed load value (kg)
  const intervalRef = useRef(null);
  const [tkphThreshold, setTkphThreshold] = useState(50);
  const [previousTkphThreshold, setPreviousTkphThreshold] = useState(50);
  const Q_empty = 9000; // Fixed empty load (kg)

  useEffect(() => {
    const truckRef = ref(db, `Truck ${id}`);

    // Listen for truck data changes
    const unsubscribe = onValue(truckRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTruckData(data);

        // Automatically start the timer if the truck is running
        if (data.startKey && !intervalRef.current) {
          setElapsedTime(0);
          startTimer();
        }
      } else {
        console.log("No data available");
      }
    });

    // Cleanup listener on component unmount
    return () => {
      unsubscribe();
      stopTimer();
    };
  }, [id]);

  useEffect(() => {
    if (truckData) {
      const calculateTkphThreshold = () => {
        let newThreshold = 50; // Base threshold
        const temperature = truckData.Temperature;

        if (temperature > 38) {
          const tempDifference = temperature - 38;
          newThreshold -= tempDifference * 0.02 * newThreshold; // Decrease by 2% per degree above 38
        } else if (temperature < 38) {
          const tempDifference = 38 - temperature;
          newThreshold += tempDifference * 0.01 * newThreshold; // Increase by 1% per degree below 38
        }

        return newThreshold;
      };

      const newTkphThreshold = calculateTkphThreshold();

      // Update only if there's a meaningful change
      if (newTkphThreshold !== previousTkphThreshold) {
        setPreviousTkphThreshold(newTkphThreshold);
        setTkphThreshold(newTkphThreshold);
        alert(`TKPH Threshold updated to: ${newTkphThreshold.toFixed(2)}`);
      }
    }
  }, [truckData?.Temperature, previousTkphThreshold]); // Runs only when Temperature or previous threshold changes

  const startTimer = () => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleStartKey = async () => {
    if (!truckData) return;

    const newStartKeyValue = !truckData.startKey;
    const truckRef = ref(db, `Truck ${id}`);
    setLoading(true);

    try {
      if (newStartKeyValue) {
        setElapsedTime(0);
        startTimer();
      } else {
        stopTimer();
      }

      await update(truckRef, { startKey: newStartKeyValue });

      if (!newStartKeyValue) {
        await update(truckRef, { time: formatTime(elapsedTime) });
      }

      setTruckData((prevData) => ({
        ...prevData,
        startKey: newStartKeyValue,
        time: !newStartKeyValue ? formatTime(elapsedTime) : prevData.time,
      }));

      setLoading(false);
    } catch (error) {
      console.error("Error updating data: ", error);
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const parseTimeToHours = (time) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
  };

  const calculateTkph = () => {
    const distance = truckData?.distance || 0;
    const timeInHours = parseTimeToHours(truckData?.time || "00:00:00");
    const averageSpeed = timeInHours > 0 ? distance / timeInHours : 0;

    const Q_loaded = Number(qLoaded);
    const averageLoad = (Q_loaded + Q_empty) / 2000;

    return averageSpeed * averageLoad; // TKPH calculation
  };

  const handleLoadSubmit = () => {
    const loadValue = Number(qLoad);
    if (loadValue > 0) {
      setQLoaded(loadValue); // Set the submitted load
      setQLoad(""); // Clear the input field
    } else {
      alert("Please enter a valid load greater than 0.");
    }
  };

  const tkph = calculateTkph();
  const displayTime = formatTime(elapsedTime);

  if (!truckData) {
    return <BeatLoader className="loader" />;
  }

  return (
    <div
      className="main"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        height: "100vh",
      }}
    >
      <div className="truck-details">
        <div className="content">
          <h1>{`Truck ${id}`}</h1>
          <p>Distance: {truckData.distance?.toFixed(2)} km</p>
          <p>Pressure: {truckData.Pressure}</p>
          <p>Temperature: {truckData.Temperature}</p>
          <p>Start Key: {truckData.startKey ? "True" : "False"}</p>
          <p>Run Time: {truckData.time || "00:00:00"}</p>
          {truckData.startKey && <p>Elapsed Time: {displayTime}</p>}
          <button
            className="modern-btn"
            onClick={toggleStartKey}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : truckData.startKey
              ? "Stop Run Time"
              : "Start Run Time"}
          </button>
          <div className="tkph-calculation">
            <h2>Calculate TKPH</h2>
            <input
              className="modern-input"
              type="number"
              value={qLoad}
              onChange={(e) => setQLoad(e.target.value)}
              placeholder="Enter load (kg)"
            />
            <button onClick={handleLoadSubmit} className="modern-btn">
              Submit Load
            </button>
            <p>
              Entered Load:{" "}
              {qLoaded > 0 ? `${qLoaded} kg` : "Not submitted yet"}
            </p>
            {!truckData.startKey && (
              <p style={{ fontSize: "18px", fontWeight: 700 }}>
                TKPH: {tkph.toFixed(2)}
              </p>
            )}
            <p style={{ fontSize: "18px", fontWeight: 700 }}>
              TKPH Threshold: {tkphThreshold.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TruckDetails;
