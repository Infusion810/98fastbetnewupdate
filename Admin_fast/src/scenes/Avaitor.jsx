import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Prediction = () => {
  const [prediction, setPrediction] = useState(localStorage.getItem("fetchLastMultiplierValue") || "3");

  const fetchCrashPoint = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/avaitor/get/latest/crashpoint`);
      console.log(response.data.data.crashMultiplier)
      localStorage.setItem("fetchLastMultiplierValue", response.data.data.crashMultiplier)
      // setCrashPoint(response.data.data.crashMultiplier)
      // setPrevRoundId(response.data.roundId);
      // console.log(response.data.crashMultiplier)
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  useEffect(()=>{
fetchCrashPoint()
  },[])

  const createCrashPoint = async (prediction) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/avaitor/update/crashpoint`, {
        crashPoint: prediction
      });
    } catch (error) {
      console.error("Error updating crash point:", error);
    }
  };

  const predictOutcome = () => {
    const targetMultiplier = parseFloat((Math.random() * 30 + 1).toFixed(2));
    localStorage.setItem("fetchLastMultiplierValue", targetMultiplier);
    setPrediction(targetMultiplier);
    createCrashPoint(targetMultiplier);
  };

  return (
    <Container>
      <h2>Admin Crash Control</h2>
      <p>Next Multiplier:</p>
      <PredictionBox>{prediction}</PredictionBox>
      <Button onClick={predictOutcome}>Set Next Multiplier</Button>
    </Container>
  );
};

export default Prediction;

// Styled Components (Minimal Design)
const Container = styled.div`
    background: #222;
    color: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
`;

const PredictionBox = styled.div`
    font-size: 2rem;
    font-weight: bold;
    color: #ffcc00;
    background: #333;
    padding: 15px 30px;
    border-radius: 8px;
    margin: 15px 0;
`;

const Button = styled.button`
    background: #ffcc00;
    color: black;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: 0.3s ease;
    
    &:hover {
        background: #e6b800;
    }
`;