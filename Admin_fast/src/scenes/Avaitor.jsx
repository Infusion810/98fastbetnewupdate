// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import styled from 'styled-components';

// const Prediction = () => {
//   const [prediction, setPrediction] = useState(localStorage.getItem("fetchLastMultiplierValue") || "3");
//   const [manualPrediction, setManualPrediction] = useState("");

//   const fetchCrashPoint = async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/avaitor/get/latest/crashpoint`);
//       console.log(response.data.data.crashMultiplier)
//       localStorage.setItem("fetchLastMultiplierValue", response.data.data.crashMultiplier)
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };
//   useEffect(()=>{
//     fetchCrashPoint()
//   },[])

//   const createCrashPoint = async (prediction) => {
//     try {
//       await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/avaitor/update/crashpoint`, {
//         crashPoint: prediction
//       });
//     } catch (error) {
//       console.error("Error updating crash point:", error);
//     }
//   };

//   const predictOutcome = () => {
//     const targetMultiplier = parseFloat((Math.random() * 30 + 1).toFixed(2));
//     localStorage.setItem("fetchLastMultiplierValue", targetMultiplier);
//     setPrediction(targetMultiplier);
//     createCrashPoint(targetMultiplier);
//   };

//   const handleManualPrediction = () => {
//     if (manualPrediction && !isNaN(manualPrediction)) {
//       const value = parseFloat(manualPrediction);
//       localStorage.setItem("fetchLastMultiplierValue", value);
//       setPrediction(value);
//       createCrashPoint(value);
//       setManualPrediction("");
//     }
//   };

//   return (
//     <Container>
//       <h2>Admin Crash Control</h2>
//       <p>Next Multiplier:</p>
//       <PredictionBox>{prediction}</PredictionBox>
//       <Button onClick={predictOutcome}>Set Random Multiplier</Button>
//       <InputContainer>
//         <NumberInput
//           type="number"
//           value={manualPrediction}
//           onChange={(e) => setManualPrediction(e.target.value)}
//           placeholder="Enter multiplier value"
//           min="1"
//           step="0.01"
//         />
//         <Button onClick={handleManualPrediction}>Set Manual Multiplier</Button>
//       </InputContainer>
      
//     </Container>
//   );
// };

// export default Prediction;

// // Styled Components (Minimal Design)
// const Container = styled.div`
//     background: #222;
//     color: white;
//     min-height: 100vh;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     padding: 20px;
// `;

// const PredictionBox = styled.div`
//     font-size: 2rem;
//     font-weight: bold;
//     color: #ffcc00;
//     background: #333;
//     padding: 15px 30px;
//     border-radius: 8px;
//     margin: 15px 0;
// `;

// const InputContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 10px;
//     margin-top: 15px;
// `;

// const NumberInput = styled.input`
//     padding: 10px;
//     border-radius: 5px;
//     border: 1px solid #444;
//     background: #333;
//     color: white;
//     font-size: 1rem;
//     width: 200px;
//     height: 40px;

//     &:focus {
//         outline: none;
//         border-color: #ffcc00;
//     }
// `;

// const Button = styled.button`
//     background: #ffcc00;
//     color: black;
//     font-weight: bold;
//     padding: 10px 20px;
//     border-radius: 5px;
//     border: none;
//     cursor: pointer;
//     transition: 0.3s ease;
    
//     &:hover {
//         background: #e6b800;
//     }
// `;





////////////shryank change 
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import planeImg from '../assets/plane.png';
import blastImg from '../assets/explosion.gif';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../theme';

const AviatorAdmin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [prediction, setPrediction] = useState(localStorage.getItem("fetchLastMultiplierValue") || "3");
  const [manualPrediction, setManualPrediction] = useState("");
  const [gameState, setGameState] = useState({
    phase: 'loading',
    countdown: 0,
    multiplier: 0,
    roundId: '',
    isActive: false
  });
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [crashHistory, setCrashHistory] = useState([]);
  
  const socketRef = useRef(null);

  // Connect to socket server on component mount
  useEffect(() => {
    // Connect to the socket server
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || window.location.origin);
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Aviator game server');
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    newSocket.on('aviator_game_state', (state) => {
      console.log('Received game state:', state);
      setGameState(state);
      
      // Update crash history if available
      if (state.crashHistory && state.crashHistory.length > 0) {
        setCrashHistory(state.crashHistory);
      }
    });

    // Clean up on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchCrashPoint = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/avaitor/get/latest/crashpoint`);
      console.log(response.data.data.crashMultiplier);
      localStorage.setItem("fetchLastMultiplierValue", response.data.data.crashMultiplier);
      setPrediction(response.data.data.crashMultiplier);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  
  useEffect(() => {
    fetchCrashPoint();
    
    // Set up a polling interval to keep data fresh
    const intervalId = setInterval(fetchCrashPoint, 15000); // every 15 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const updateCrashPoint = async (prediction) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/avaitor/update/crashpoint`, {
        crashPoint: prediction
      });
      
      if (response.data.success) {
        console.log("Crash point updated successfully");
      }
    } catch (error) {
      console.error("Error updating crash point:", error);
    }
  };

  const predictOutcome = () => {
    const targetMultiplier = parseFloat((Math.random() * 5 + 1.1).toFixed(2));
    localStorage.setItem("fetchLastMultiplierValue", targetMultiplier);
    setPrediction(targetMultiplier);
    updateCrashPoint(targetMultiplier);
  };

  const handleManualPrediction = () => {
    if (manualPrediction && !isNaN(manualPrediction)) {
      const value = parseFloat(manualPrediction);
      localStorage.setItem("fetchLastMultiplierValue", value);
      setPrediction(value);
      updateCrashPoint(value);
      setManualPrediction("");
    }
  };

  return (
    <Box m="20px">
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* HEADER */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            color={colors.grey[100]}
          >
            Aviator Game Admin Control
          </Typography>
        </Box>
        
        {/* Game State Display */}
        <Box
          gridColumn="span 8"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          overflow="hidden"
        >
          <GameStateDisplay>
            {gameState.phase === 'loading' ? (
              <LoadingText>Connecting to game...</LoadingText>
            ) : (
              <>
                <GameStateHeader>
                  <RoundInfo>Round ID: {gameState.roundId || 'N/A'}</RoundInfo>
                  <RoundInfo>
                    Status: <StatusIndicator status={gameState.phase}>
                      {gameState.phase === 'countdown' ? 'Countdown' : 
                       gameState.phase === 'flying' ? 'In Flight' : 
                       gameState.phase === 'crashed' ? 'Crashed' : 'Unknown'}
                    </StatusIndicator>
                  </RoundInfo>
                </GameStateHeader>
                
                <GameAnimation>
                  {gameState.phase === 'countdown' && (
                    <CountdownDisplay>{gameState.countdown}</CountdownDisplay>
                  )}
                  
                  {gameState.phase === 'flying' && (
                    <FlyingDisplay>
                      <PlaneImage src={planeImg} alt="Plane" />
                      <MultiplierDisplay>{gameState.multiplier.toFixed(2)}x</MultiplierDisplay>
                    </FlyingDisplay>
                  )}
                  
                  {gameState.phase === 'crashed' && (
                    <CrashedDisplay>
                      <BlastImage src={blastImg} alt="Crash" />
                      <CrashMultiplier>{gameState.multiplier.toFixed(2)}x</CrashMultiplier>
                    </CrashedDisplay>
                  )}
                </GameAnimation>
              </>
            )}
          </GameStateDisplay>
        </Box>
        
        {/* Crash History */}
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Crash Points
            </Typography>
          </Box>
          <Box p="15px">
            <HistoryList>
              {crashHistory.map((point, index) => (
                <HistoryItem key={index}>
                  <HistoryText>
                    #{crashHistory.length - index}: <HistoryValue>{point}x</HistoryValue>
                  </HistoryText>
                </HistoryItem>
              ))}
            </HistoryList>
          </Box>
        </Box>
        
        {/* Control Panel */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mb="20px"
          >
            <Typography 
              variant="h4" 
              color={colors.greenAccent[500]} 
              fontWeight="bold" 
              mb="10px"
            >
              Next Round Multiplier Control
            </Typography>
            
            <PredictionBox>{prediction}x</PredictionBox>
            
            <Box display="flex" width="100%" justifyContent="center" mt="20px">
              <Button onClick={predictOutcome}>
                Set Random Multiplier
              </Button>
            </Box>
            
            <Box 
              display="flex" 
              width="100%" 
              maxWidth="600px" 
              gap="20px" 
              mt="20px"
              justifyContent="center"
              flexWrap="wrap"
            >
              <NumberInput
                type="number"
                value={manualPrediction}
                onChange={(e) => setManualPrediction(e.target.value)}
                placeholder="Enter multiplier value"
                min="1.1"
                step="0.1"
              />
              <Button onClick={handleManualPrediction}>
                Set Manual Multiplier
              </Button>
            </Box>
            
            <Box mt="20px">
              <ConnectionStatus connected={connected}>
                {connected ? 'Connected to game server' : 'Disconnected from game server'}
              </ConnectionStatus>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AviatorAdmin;

// Styled Components
const GameStateDisplay = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #111;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
`;

const LoadingText = styled.div`
  color: white;
  font-size: 1.5rem;
`;

const GameStateHeader = styled.div`
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
`;

const RoundInfo = styled.div`
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  margin-left: 5px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${({ status }) => 
    status === 'countdown' ? '#3498db' : 
    status === 'flying' ? '#2ecc71' : 
    status === 'crashed' ? '#e74c3c' : '#7f8c8d'};
`;

const GameAnimation = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CountdownDisplay = styled.div`
  font-size: 5rem;
  font-weight: bold;
  color: white;
`;

const FlyingDisplay = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlaneImage = styled.img`
  width: 60px;
  height: 60px;
`;

const MultiplierDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #2ecc71;
  margin-top: 10px;
`;

const CrashedDisplay = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BlastImage = styled.img`
  width: 80px;
  height: 80px;
`;

const CrashMultiplier = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #e74c3c;
  margin-top: 10px;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 90px;
  overflow-y: auto;
`;

const HistoryItem = styled.li`
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryText = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
`;

const HistoryValue = styled.span`
  font-weight: bold;
  color: #f39c12;
`;

const PredictionBox = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #ffcc00;
  background: #333;
  padding: 15px 30px;
  border-radius: 8px;
  margin: 15px 0;
`;

const NumberInput = styled.input`
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #444;
  background: #333;
  color: white;
  font-size: 1rem;
  width: 200px;
  height: 50px;

  &:focus {
    outline: none;
    border-color: #ffcc00;
  }
`;

const Button = styled.button`
  background: #ffcc00;
  color: black;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: 0.3s ease;
  height: 50px;
  
  &:hover {
    background: #e6b800;
  }
`;

const ConnectionStatus = styled.div`
  padding: 5px 10px;
  border-radius: 5px;
  background-color: ${({ connected }) => connected ? '#2ecc71' : '#e74c3c'};
  color: white;
  font-size: 0.9rem;
`;

