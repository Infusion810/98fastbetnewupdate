import React, { useState, useEffect, useRef } from 'react';
// import image from '../assets/mountains.png';
import image from '../assets/mountain1.gif';
import './Aviator.css';
import planeImg from '../assets/plane.png';
// import blastImg from "../assets/blast.png";
import blastImg from "../assets/explosion-burst-GIF-by-Zekey-unscreen.gif";
import shineImg from "../assets/shine.png";
// import shineImg from "../assets/shineImage.png";
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
import { toast, ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';
import Navbar from '../AllGamesNavbar/AllNavbar';
import styled, { css, keyframes } from 'styled-components';
// import { io } from 'socket.io-client';
import ResponsiveTable from './History';
import { FaCircle, FaClipboardCheck, FaClock, FaDotCircle, FaHistory, FaHospitalUser, FaRegClock, FaUserClock } from 'react-icons/fa';
import TermsAndConditions from './TermsAndCondition';
import UserHistoryTable from './UserGameHistory';

// Create a socket connection to the server
const socket = io(process.env.REACT_APP_BASE_URL || window.location.origin);

const Aviator = () => {
  const [startAnimation, setStartAnimation] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [multiple, setMultiple] = useState(0.5);
  const { profile, fetchNameWallet } = useProfile()
  // console.log(maxMultiple);
  const [activeTab, setActiveTab] = useState('all');
  const [isBlast, setIsBlast] = useState(false);
  const [betinput, setBetinput] = useState(0);
  // const [placeBet, setPlaceBet] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [isBetPlace, setisBetPlace] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [popup, setPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [placebetClicked, setPlacebetClicked] = useState(0);
  const [userGamehistoryData, serUserGameHistory] = useState([])
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const [isWin, setIsWin] = useState("");
  const [takeWinningsClicked, setTakeWinningsClicked] = useState(0);
  const [crashPoint, setCrashPoint] = useState("");
  const [gameId, setGameId] = useState("")
  const [isOpen, setIsOpen] = useState(false);

  const [gameData, setgameData] = useState({})

  const [refresh, setRefresh] = useState("")
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentGameState, setCurrentGameState] = useState(null);
  const [maxMultiple, setMaxMultiple] = useState(1);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // const [IsTakeWinnings, setIsTakeWinning] = useState(false);
  const [bettingData, setBettingData] = useState([
    { username: '********69', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********15', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********19', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********53', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********25', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********65', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********12', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********11', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********57', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********23', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********63', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********18', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********87', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********54', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
    { username: '********99', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
  ]);
  const [hasUpdatedBets, setHasUpdatedBets] = useState(false);
  const timeoutIds = useRef([]);
  
  // Socket connection and event handling
  useEffect(() => {
    console.log("Initializing socket connection for Aviator game...");
    
    // Socket events
    socket.on('connect', () => {
      console.log('Connected to Aviator game server');
      setSocketConnected(true);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });
    
    socket.on('aviator_game_state', (state) => {
      console.log('Received game state:', state);
      setCurrentGameState(state);
      
      // Update game state from server
      setCountdown(state.countdown);
      setMultiple(state.multiplier);
      setMaxMultiple(state.crashPoint);
      setGameId(state.roundId);
      setIsGameActive(state.isActive);
      
      if (state.phase === 'countdown') {
        setStartAnimation(false);
        setIsBlast(false);
      } else if (state.phase === 'flying') {
        setStartAnimation(true);
      } else if (state.phase === 'crashed') {
        setIsBlast(true);
        setTimeout(() => {
          setIsBlast(false);
        }, 1000);
      }
    });
    
    socket.on('aviator_bet_update', (bets) => {
      console.log('Received bet updates:', bets);
      // Update betting table with real players' bets
      const updatedBettingData = [...bettingData];
      
      bets.forEach((bet, index) => {
        if (index < updatedBettingData.length) {
          updatedBettingData[index] = {
            username: bet.username || `********${Math.floor(Math.random() * 90) + 10}`,
            odds: `x${bet.multiplier || 0}`,
            bet: `${bet.amount || 0} INR`,
            win: `${bet.winnings || 0} INR`,
            updated: true,
          };
        }
      });
      
      setBettingData(updatedBettingData);
    });
    
    socket.on('aviator_game_result', (result) => {
      console.log('Game result received:', result);
      
      // Handle game results
      if (isBetPlace && takeWinningsClicked === 0) {
        setRefresh(false);
        setIsWin("Lost");
        setPopupMessage("Better Luck next Time");
        setPopup(true);
        setTimeout(() => {
          setPopup(false);
          setPopupMessage("");
        }, 3000);
      }
    });
    
    // New event handlers for balance updates
    socket.on('balance_update', (data) => {
      console.log('Balance update received:', data);
      
      // Update profile context with new balance
      if (data.userId === profile?.userId) {
        fetchNameWallet(); // Refresh wallet from server
        
        // Show notification about balance update
        if (data.type === 'deduct') {
          toast.info(`${data.amount} INR deducted from your balance`);
        } else if (data.type === 'add' && data.reason !== 'bet_refunded') {
          toast.success(`${data.amount} INR added to your balance`);
        } else if (data.reason === 'bet_refunded') {
          toast.info(`Bet refunded: ${data.amount} INR`);
        }
      }
    });
    
    // Handle successful bet placement confirmation
    socket.on('bet_placed', (data) => {
      console.log('Bet placed confirmation:', data);
      if (data.success) {
        setisBetPlace(true);
        setBetAmount(data.amount);
        setPopup(true);
        setTimeout(() => {
          setPopup(false);
        }, 2000);
        setPopupMessage("Bet placed!");
        setPlacebetClicked(1);
      }
    });
    
    // Handle successful cashout confirmation
    socket.on('cash_out_success', (data) => {
      console.log('Cash out success:', data);
      if (data.success) {
        setWinnings(data.totalWinnings);
        setTakeWinningsClicked(1);
        setPopup(true);
        setStartAnimation(false);
        setTimeout(() => {
          setPopup(false);
        }, 2000);
        setPopupMessage(`You have won: ${data.totalWinnings.toFixed(2)}`);
        
        // Update profile balance
        fetchNameWallet();
      }
    });
    
    // Handle bet cancellation confirmation
    socket.on('bet_cancelled', (data) => {
      console.log('Bet cancelled confirmation:', data);
      if (data.success) {
        setisBetPlace(false);
        setBetAmount(0);
        setPlacebetClicked(0);
        setPopup(true);
        setTimeout(() => {
          setPopup(false);
        }, 2000);
        setPopupMessage(`Bet cancelled. ${data.refundAmount} INR refunded.`);
        
        // Update profile balance
        fetchNameWallet();
      }
    });
    
    // Handle bet result (loss)
    socket.on('bet_result', (data) => {
      console.log('Bet result received:', data);
      // Update UI for lost bet if needed
    });
    
    // Ping the server periodically to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 20000);
    
    // Authenticate with the server when connected
    if (socket.connected && profile?.userId) {
      socket.emit('authenticate', { userId: profile.userId });
    }
    
    // Cleanup on unmount
    return () => {
      clearInterval(pingInterval);
      socket.off('connect');
      socket.off('connect_error');
      socket.off('aviator_game_state');
      socket.off('aviator_bet_update');
      socket.off('aviator_game_result');
      socket.off('balance_update');
      socket.off('bet_placed');
      socket.off('cash_out_success');
      socket.off('bet_cancelled');
      socket.off('bet_result');
    };
  }, []);

  // When profile changes, authenticate with the server
  useEffect(() => {
    if (socketConnected && profile?.userId) {
      socket.emit('authenticate', { userId: profile.userId });
    }
  }, [profile, socketConnected]);

  useEffect(() => {
    // Reset local state when server indicates a new game is starting
    if (countdown === 7) {
      setMultiple(0.5);
      setBetAmount(0);
      setPopupMessage("");
      setPopup(false);
      setPlacebetClicked(0);
      setTakeWinningsClicked(0);
      setHasUpdatedBets(false);
      setStartAnimation(false);
      setisBetPlace(false);
    }
  }, [countdown]);

  useEffect(() => {
    fetchNameWallet();
  }, [takeWinningsClicked, fetchNameWallet]);

  useEffect(() => {
    checkBet(betAmount);
  }, [betAmount]);

  useEffect(() => {
    // If multiplier reaches max, handle end of game
    if (multiple >= maxMultiple && isBetPlace && takeWinningsClicked === 0) {
      setRefresh(false);
      setIsWin("Lost");
      setPopupMessage("Better Luck next Time");
      setPopup(true);
      setTimeout(() => {
        setPopup(false);
        setPopupMessage("");
      }, 3000);
    }
  }, [multiple, maxMultiple]);

  const PlaceBet = async (betinput) => {
    if (!socketConnected) {
      toast.error("Not connected to game server");
      return;
    }
    
    try {
      // Validate bet amount
      if (!betinput || betinput <= 0) {
        toast.error("Please enter a valid bet amount");
        return;
      }
      
      // Check if user has sufficient balance
      if (betinput > profile.walletBalance) {
        setPopup(true);
        setPopupMessage("Insufficient Balance");
        setTimeout(() => {
          setPopup(false);
        }, 2000);
        return;
      }
      
      // Send bet to server through socket
      socket.emit('place_bet', {
        userId: profile.userId,
        amount: betinput,
        roundId: gameId || currentGameState?.roundId
      });
      
      // The UI updates will be handled by the 'bet_placed' event listener
    } catch (error) {
      toast.error(error.response?.data?.message || "Error placing bet");
    }
  };

  const checkBet = () => {
    if (betAmount > profile.walletBalance) {
      setPopup(true);
      setPopupMessage("Insufficient Balance");
      setisBetPlace(false);
    }
  };

  const calculateWinnings = () => {
    return betAmount * multiple;
  };

  const handlePlay = async () => {
    try {
      if (!isBetPlace || takeWinningsClicked === 1) {
        return; // Don't proceed if no bet was placed or already cashed out
      }
      
      // Send cashout request through socket
      socket.emit('cash_out', {
        userId: profile.userId,
        roundId: gameId
      });
      
      // The UI updates will be handled by the 'cash_out_success' event listener
    } catch (error) {
      toast.error(error.response?.data?.message || "Error collecting winnings");
    }
  };

  // Add a function to cancel bets during the countdown phase
  // const cancelBet = () => {
  //   if (!isBetPlace || countdown === 0 || takeWinningsClicked === 1) {
  //     return; // Don't proceed if no bet was placed or countdown ended
  //   }
    
  //   // Send bet cancellation request through socket
  //   socket.emit('cancel_bet', {
  //     userId: profile.userId,
  //     roundId: gameId
  //   });
    
  //   // The UI updates will be handled by the 'bet_cancelled' event listener
  // };

  return (
    <>
      <Navbar />

      <MainContainer>
        <LeftConatainer>
          <MobileHistoryContainer>
            <ResponsiveTable bettingData={bettingData} />

            {isOpen && (
              <Overlay>
                <ModalContent>
                  <CloseButton onClick={() => setIsOpen(false)}>✖</CloseButton>
                  <UserHistoryTable userGameHistoryData={userGamehistoryData.slice(-4)} />
                </ModalContent>
              </Overlay>
            )}
          </MobileHistoryContainer>

          {window.innerWidth >= 1024 && <ResponsiveTable bettingData={bettingData} style={{}} />}
        </LeftConatainer>

        {/* Terms & Conditions Popup */}
        {isTermsOpen && (
          <TermsAndConditions setIsOpen={setIsTermsOpen} />
        )}

        <RightContainer>
          <PlaneContainer>
            <div className="crash-container1 plane">
              <div style={{ display: "flex", gap: "2px", justifyContent: "start", flexDirection: "row", width: "100%", marginLeft: "20px", maxWidth: "95%", height: "95%" }}>
                <ScrollingDotsWrapper>
                  <ScrollingDots animate={startAnimation} multiple={multiple} maxMultiple={maxMultiple} countdown={countdown}>
                    {[...Array(4)].map((_, index) => (
                      <DotIcon key={index} />
                    ))}
                  </ScrollingDots>
                </ScrollingDotsWrapper>
                <div style={{ display: "flex", gap: "0px", justifyContent: "space-between", flexDirection: "column", width: "100%", height: "95%" }}>
                  <div className='outer-crash'>
                    <div className='crash '>
                      <div className='mountains'>
                        <img
                          src={image}
                          alt="Mountains"
                          className={`mountain ${multiple >= maxMultiple || countdown > 0 ? "paused" : ""}`}
                        />
                        <img
                          src={image}
                          alt="Mountains"
                          className={`mountain ${multiple >= maxMultiple || countdown > 0 ? "paused" : ""}`}
                        />

                        <img
                          src={image}
                          alt="Mountains"
                          className={`mountain ${multiple >= maxMultiple || countdown > 0 ? "paused" : ""}`}
                        />

                        <img
                          src={image}
                          alt="Mountains"
                          className={`mountain ${multiple >= maxMultiple || countdown > 0 ? "paused" : ""}`}
                        />

                        <img
                          src={image}
                          alt="Mountains"
                          className={`mountain ${multiple >= maxMultiple || countdown > 0 ? "paused" : ""}`}
                        />

                        <img
                          src={image}
                          alt="Mountains"
                          className={`mountain ${multiple >= maxMultiple || countdown > 0 ? "paused" : ""}`}
                        />

                      </div>
                      <div id="animation-container" className="curve1 ">
                        {countdown === 0 ? (
                          <svg id="animation-svg" className='absolute ' viewBox="75 20 800 400" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="50%">
                                <stop offset="0%" style={{ stopColor: 'rgb(190, 96, 34)', stopOpacity: 0.8 }} />
                                <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
                              </linearGradient>
                            </defs>

                            <path
                              id="curve-path"
                              className={`curved-rect ${multiple >= maxMultiple ? "animation-paused" : ""}`}
                              d="M 70 350 Q 400 320 700 140 L 700 650 Q 200 400 50 550 Z"
                              fill="url(#gradient1)"
                            >
                              <animate
                                attributeName="d"
                                from="M 70 350 Q 70 305 50 298 L 50 500 Q 200 400 50 550 Z"
                                to="M 70 350 Q 400 320 700 140 L 700 650 Q 200 400 50 550 Z"
                                dur="7s"
                                repeatCount="1"
                              />
                            </path>

                            <path
                              id="plane-path"
                              className={`curved-rect ${multiple >= maxMultiple ? "animation-paused" : ""}`}
                              d="M 70 350 Q 400 320 700 140"
                              stroke="rgb(191, 68, 30)"
                              strokeWidth="4"
                              fill="transparent"
                            >
                              <animate
                                attributeName="d"
                                from="M 70 350 Q 70 300 70 300"
                                to="M 70 350 Q 400 320 700 140"
                                dur="7s"
                                repeatCount="1"
                                keyTimes="0;0.1;1"
                              />
                            </path>

                            <g id="plane">
                              <image
                                id="plane-image"
                                href={planeImg}
                                width="100"
                                height="100"
                                transform={window.innerWidth < 768 ? "translate(-100, -100)" : "translate(-47, -47)"}
                                className={`plane-animation ${multiple >= maxMultiple ? "animation-paused" : ""}`}
                                style={{ opacity: multiple >= maxMultiple ? 0 : 1 }}
                              >

                                <animateMotion dur="0.1s" repeatCount="1" fill="freeze" rotate="auto">
                                  <mpath href="#plane-path" />
                                </animateMotion>
                              </image>
                            </g>

                            <g id="blast">
                              <image
                                id="blast-image"
                                href={blastImg}
                                width="100"
                                height="100"
                                transform={window.innerWidth < 768 ? "translate(-100, -100)" : "translate(-47, -47)"}
                                className={`plane-animation ${isBlast ? "blast-animation" : ""}`}
                                style={{ opacity: isBlast ? 1 : 0 }}
                              >

                                <animateMotion dur="0.1s" repeatCount="2" fill="freeze" rotate="auto">
                                  <mpath href="#plane-path" />
                                </animateMotion>
                              </image>
                            </g>

                          </svg>
                        ) : null}
                      </div>

                    </div>
                    
                    <div className={`count-down countdown ${countdown === 0 ? 'hidden' : ''}`} id="countdown-value">
                      {countdown}
                    </div>

                    <div className={`countdown-display ${countdown === 0 ? 'hidden' : countdown}`}>
                      <div className="ticks">
                        <div className="tick tick1"></div>
                        <div className="tick tick2"></div>
                        <div className="tick tick3"></div>
                        <div className="tick tick4"></div>
                        <div className="tick tick5"></div>
                        <div className="tick tick6"></div>
                        <div className="tick tick7"></div>
                        <div className="tick tick8"></div>
                        <div className="tick tick9"></div>
                        <div className="tick tick10"></div>
                        <div className="tick tick11"></div>
                        <div className="tick tick12"></div>
                      </div>
                    </div>

                    {/* multiplier */}
                    <div className={`count-down countdown multiplier ${countdown > 0 ? 'hidden' : ''}`} id="countdown-value">
                      {multiple}x
                    </div> 

                    {/* pop-up */}

                    <div className={`popup-container ${popup ? "visible" : "hidden"}`}>
                      <div className={`popup-box ${window.innerWidth >= 1024 ? "lg" : ""}`}>
                        {popupMessage}
                      </div>
                    </div>
                  </div>
                  <MovingDotsContainer>
                    <MovingDots animate={startAnimation} multiple={multiple} maxMultiple={maxMultiple} countdown={countdown}>
                      {[1, 2, 3, 4, 5].map((_, index) => (
                        <Dot key={index} />
                      ))}
                    </MovingDots>
                  </MovingDotsContainer>
                </div>
              </div>

            </div>
          </PlaneContainer>
          <BottomContainer>
            {window.innerWidth >= 1024 && <UserHistory>
              <TableContainer>
                <HistoryHeader style={{ background: "linear-gradient(90deg, rgb(255, 87, 34), rgb(233, 30, 99));" }}>
                  <div>History</div>

                </HistoryHeader>
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>TIME</TableHeaderCell>
                        <TableHeaderCell>ROUND ID</TableHeaderCell>
                        <TableHeaderCell>BET</TableHeaderCell>
                        <TableHeaderCell>ODDS</TableHeaderCell>
                        <TableHeaderCell>WIN</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userGamehistoryData && userGamehistoryData.map((gameData, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(gameData.createdAt).toLocaleTimeString()}</TableCell>
                          <TableCell>{gameData.round_id}</TableCell>
                          <TableCell>{gameData.betAmt}</TableCell>
                          <TableCell>{gameData.multiplier}</TableCell>
                          <TableCell>{gameData.winningAmt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableWrapper>
              </TableContainer>
            </UserHistory>}


            <BettingContainer>
              <Header>
                <StackTitle style={{
                  background: "#242746", borderRadius: "5px", fontWeight: "normal",
                  padding: "10px 5px"
                }}>STAKE SELECTER</StackTitle>
                <StackTitle style={{
                  background: "#242746", borderRadius: "5px", fontWeight: "normal",
                  padding: "10px 5px"
                }}>Autobet</StackTitle>
              </Header>
              <div className="custom-div">
                <input
                  type="number"
                  id="bet-input"
                  className={`${countdown === 0 ? "disabled" : ""
                    }`}
                  placeholder="Enter your bet"
                  value={betinput}
                  onChange={(e) => setBetinput(Number(e.target.value))}
                  disabled={countdown === 0}
                />
                <div className="button-container" style={{ display: "flex", justifyContent: "start", flexWrap: "wrap", width: "100%", margin: "auto", marginTop: "10px" }}>
                  {[100, 200, 500, 1000, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBetinput(betinput + val)}
                      disabled={countdown === 0}
                      className="number-button"
                    >
                      {val}
                    </button>
                  ))}
                  <button
                    onClick={() => setBetinput(0)}
                    disabled={countdown === 0}
                    className="number-button2 number-button "
                  >
                    <span className="cross-icon" >x</span>
                  </button>
                </div>

                <div className="stake-button">
                  <button
                    id="placeBetSection"
                    onClick={() => {
                      checkBet(betinput)
                      if (betinput === "" || betinput === 0 || placebetClicked === 1) {
                        return;
                      }

                      PlaceBet(betinput);
                      setisBetPlace(true)
                      setBetAmount(betinput);

                      setPopup(true);
                      setTimeout(() => {
                        setPopup(false);
                      }, 2000);
                      setPopupMessage("Bet placed!");

                      setPlacebetClicked(1);
                    }}
                    disabled={countdown === 0}
                  >
                    <span className="block text-center" >PLACE A BET</span>
                  </button>

                  <button
                    id="takewin"
                    onClick={() => {
                      if (takeWinningsClicked === 1) {
                        return;
                      }

                      const winnings = calculateWinnings();
                      setWinnings(winnings);
                      setTakeWinningsClicked(1);
                      handlePlay();
                      setPopup(true);
                      setStartAnimation(false)
                      setTimeout(() => {
                        setPopup(false);
                      }, 2000);
                      setPopupMessage(`You have won: ${winnings.toFixed(2)}`);
                    }}
                    className=""
                    disabled={countdown > 0 || multiple === maxMultiple || takeWinningsClicked === 1 || isBetPlace === false}
                  >
                    TAKE WINNINGS
                  </button>

                  {/* <button
                    id="cancelBet"
                    onClick={cancelBet}
                    disabled={countdown === 0 || !isBetPlace || takeWinningsClicked === 1}
                    className=""
                  >
                    CANCEL BET
                  </button> */}
                </div>

              </div>
            </BettingContainer>
          </BottomContainer>
        </RightContainer>
        <ToastContainer />
      </MainContainer>
    </>
  )
}

export default Aviator

// ... existing styled components ...
// ... (rest of the code remains the same) ...

// End of file - All styled components are now correctly included to fix the
// react/jsx-no-undef error for MainContainer and other styled components

// Restore the styled components that are being used in the JSX
const verticalScroll = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(30%); } /* Moves only half to ensure smooth looping */
`;

const ScrollingDotsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 7px;
  height: 90%;
`;

const ScrollingDots = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: space-between;
  height: 85%;
   ${({ animate, multiple, maxMultiple, countdown }) =>
    animate && multiple < maxMultiple && countdown === 0 &&
    css`
      animation: ${verticalScroll} .5s linear infinite;
    `}
`;

const DotIcon = styled(FaCircle)`
  color: grey;
  font-size: 5px;
`;

const moveLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-25%); } /* Move only half, so it loops smoothly */
`;

const MovingDotsContainer = styled.div`
  display: flex;
  gap: 2px;
  overflow: hidden;
  width: 100%; /* Adjust width as needed */
`;

const MovingDots = styled.div`
  display: flex;
  width: 90%;
  margin-left: 10px;
  justify-content: space-between;
   ${({ animate, multiple, maxMultiple, countdown }) =>
    animate && multiple < maxMultiple && countdown === 0 &&
    css`
      animation: ${moveLeft} 0.8s linear infinite;
    `}
`;

const Dot = styled(FaCircle)`
  color: grey;
  font-size: 5px;
`;

const MainContainer = styled.div`
  display: flex;
  padding: 20px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: justify-between;
  background: #12142B;
  @media (max-width: 768px) {
    width: 99%;
    margin: auto;
    flex-direction: column-reverse;
    padding: 0px;
    box-sizing: border-box;
  }
`;

const LeftConatainer = styled.div`
  padding: 100px 10px;
  min-height: 88vh;
  box-sizing: border-box;
  width: 30%;
  @media (max-width: 768px) {
    width: 100%;
    padding: 5px 5px;
  }
`;

const RightContainer = styled.div` 
  padding: 100px 20px;
  box-sizing: border-box;
  width: 70%;
  @media (max-width: 768px) {
    width: 100%;
    padding: 73px 0px 5px 0px;
    box-sizing: border-box;
  }
`;

const PlaneContainer = styled.div`
  height: 49vh;
  width: 100%;
  margin-bottom: 2px;
  background-color: #181C3A;
  @media (max-width: 768px) {
    width: 100%;
    height: 26vh;
  }
  @media (min-width: 768px) and (max-width: 1024px) {
    width: 100%;
    height: 35vh;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 80%;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: end;
    margin-bottom: 3px;
    width: 80%;
    gap: 5px;
    margin-bottom: 2px;
    margin: 5px auto;
    flex-wrap: wrap;
  }
`;

const BottomContainer = styled.div`
  width: 100%;
  display: flex;
  margin-left: 0;
  justify-content: space-between;
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    flex-direction: column-reverse;
    gap: 20px;
  }
`;

const UserHistory = styled.div`
  background: #12142B;
  height: 100%;
  width: 60%;
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const BettingContainer = styled.div`
  background: #1B1D36;
  height: 100%;
  width: 36%;
  margin-left: 0;
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const MobileHistoryContainer = styled.div`
  @media (min-width: 769px) {
    display: none;
  }
  width: 100%;
`;

const Overlay = styled.div`
  position: fixed;
  top: 10%;
  left: 0;
  width: 95%;
  margin: auto;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  z-index: 2000;
`;

const ModalContent = styled.div`
  color: white;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
  z-index: 2000;
  margin: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
`;

const TableContainer = styled.div`
  width: 100%;
  margin: auto;
  background: #1B1D36;
  border-radius: 10px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 5px;
  color: white;
  font-weight: bold;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  gap: 5px;
  margin: auto;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  background: linear-gradient(90deg, rgb(255, 87, 34), rgb(233, 30, 99));
  padding: 10px;
  color: white;
  font-weight: bold;
  text-align: center;
  box-sizing: border-box;
`;

const StackTitle = styled.div`
  width: 48%;
  background: rgb(109, 74, 62);
`;

const TableWrapper = styled.div`
  max-height: 30vh;
  overflow-y: auto;
  scrollbar-width: none;
  scrollbar-color: #ff5722 #1B1D36;

  &::-webkit-scrollbar {
    display: none;
  }

  &::-webkit-scrollbar {
    width: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ff5722;
    border-radius: 10px;
  }
  @media (max-width: 768px) {
    max-height: 70vh;
    padding: 0 0px; 
  }
`;

const TableBody = styled.tbody`
  max-height: 20vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ff5722 #1B1D36;

  &::-webkit-scrollbar {
    width: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ff5722;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    max-height: 70vh;
    padding: 0 10px; 
    box-sizing: border-box;
    font-size: 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
`;

const TableHeader = styled.thead`
  text-transform: uppercase;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #444;
`;

const TableCell = styled.td`
  padding: 12px;
  text-align: center;
  box-sizing: border-box;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: center;
  font-weight: bold;
  box-sizing: border-box;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  background-color: ${(props) => (props.active ? '#ff5722' : '#3b3f51')};
  color: white;
  border: none;
  border-radius: 10px;
  margin-right: 10px;
  cursor: pointer;
  box-sizing: border-box;
`;

const HistoryButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 49%;
    background: rgb(82, 30, 15);
    color: white;
    border: 1px solid rgb(73, 25, 10);
    border-radius: 5px;
    text-transform: capitalize;
    font-family: 'Open Sans', sans-serif;
    width: 49%;
    height: 23px;
    font-size: 9px;
  }
`;

const TermsAndConditionButton = styled.button`
  width: 49%;
  background: #12142B;
  color: #ff3d00;
  margin-top: 20px;
  height: 22px;
  border: 1px solid #ff3d00;
  border-radius: 5px;
  font-size: 9px;
  margin-left: 40px;
  @media (min-width: 768px) {
    width: 20%;
  }
`;

///////////////////////////////////////////////////////////////////////////////////////////new//////////////////////
// import React, { useState, useEffect, useRef } from 'react';
// // import image from '../assets/mountains.png';
// import image from '../assets/mountain1.gif';

// import './Aviator.css';
// import planeImg from '../assets/plane.png';
// // import blastImg from "../assets/blast.png";
// import blastImg from "../assets/explosion-burst-GIF-by-Zekey-unscreen.gif";
// import shineImg from "../assets/shine.png";
// // import shineImg from "../assets/shineImage.png";
// import axios from 'axios';
// import { useProfile } from '../context/ProfileContext';
// import { toast, ToastContainer } from 'react-toastify';
// import Navbar from '../AllGamesNavbar/AllNavbar';
// import styled, { css, keyframes } from 'styled-components';
// // import { io } from 'socket.io-client';
// import ResponsiveTable from './History';
// import { FaCircle, FaClipboardCheck, FaClock, FaDotCircle, FaHistory, FaHospitalUser, FaRegClock, FaUserClock } from 'react-icons/fa';
// import TermsAndConditions from './TermsAndCondition';
// import UserHistoryTable from './UserGameHistory';
// // const socket = io(process.env.REACT_APP_BASE_URL); // Change this URL if needed

// const Aviator = () => {
//   const [startAnimation, setStartAnimation] = useState(false);
//   const [countdown, setCountdown] = useState(7);
//   const [multiple, setMultiple] = useState(0.5);
//   const { profile, fetchNameWallet } = useProfile()
//   // console.log(maxMultiple);
//   const [activeTab, setActiveTab] = useState('all');
//   const [isBlast, setIsBlast] = useState(false);
//   const [betinput, setBetinput] = useState(0);
//   // const [placeBet, setPlaceBet] = useState(false);
//   const [betAmount, setBetAmount] = useState(0);
//   const [isBetPlace, setisBetPlace] = useState(false);
//   const [winnings, setWinnings] = useState(0);
//   const [popup, setPopup] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");
//   const [placebetClicked, setPlacebetClicked] = useState(0);
//   const [userGamehistoryData, serUserGameHistory] = useState([])
//   const [isTermsOpen, setIsTermsOpen] = useState(false);

//   const [isWin, setIsWin] = useState("");
//   const [takeWinningsClicked, setTakeWinningsClicked] = useState(0);
//   const [crashPoint, setCrashPoint] = useState("");
//   const [gameId, setGameId] = useState("")
//   const [isOpen, setIsOpen] = useState(false);

//   const [gameData, setgameData] = useState({})

//   const [refresh, setRefresh] = useState("")

//   // const [IsTakeWinnings, setIsTakeWinning] = useState(false);
//   const [bettingData, setBettingData] = useState([
//     { username: '**69', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**15', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**19', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**53', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**25', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**65', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**12', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**11', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**57', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**23', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**63', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**18', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**87', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**54', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//     { username: '**99', odds: 'x0', bet: '0 INR', win: '0 INR', updated: null },
//   ]);
//   const [hasUpdatedBets, setHasUpdatedBets] = useState(false);
//   const timeoutIds = useRef([]);
//   const videoRef = useRef(null);

//   useEffect(() => {
//     // fetchData();
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("refresh", refresh)
//   }, [])

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/avaitor/gat-by-last-round-id`);
//       localStorage.setItem("prevRoundId", response.data.round_id)
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };


//   const fetchCrashPoint = async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/avaitor/get/latest/crashpoint`);
//       // console.log(response.data.data.crashMultiplier)
//       localStorage.setItem("fetchLastMultiplierValue", response.data.data.crashMultiplier)
//       setCrashPoint(response.data.data.crashMultiplier)
//       // setPrevRoundId(response.data.roundId);
//       // console.log(response.data.crashMultiplier)
//     } catch (error) {
//       console.error("Error fetching data", error);
//     }
//   };

//   useEffect(() => {
//     fetchCrashPoint();
//   })

//   useEffect(() => {
//     fetchNameWallet();
//   }, [takeWinningsClicked, fetchNameWallet]);
//   const [maxMultiple, setMaxMultiple] = useState(crashPoint || parseFloat((Math.random() * (5.00 - 0.01) + 0.01).toFixed(2)));

//   useEffect(() => {
//     if (countdown > 0) {
//       const interval = setInterval(() => {
//         setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
//       }, 1000);

//       return () => clearInterval(interval);

//     }
//     if (countdown === 0) {
//       setStartAnimation(true);
//     }
//   }, [countdown]);
//   // console.log(startAnimation, "startAnimation")
//   // Multiplier Increaser (Only when countdown hits 0)
//   // console.log(isTermsOpen, "t")
//   useEffect(() => {
//     if (countdown === 0 && multiple < maxMultiple) {
//       const startTime = Date.now();
//       const multiplierInterval = setInterval(() => {
//         setMultiple((prev) => {
//           const elapsedTime = (Date.now() - startTime) / 1000; // Calculate time elapsed
//           let newMultiplier = prev + elapsedTime * 0.5; // Adjust speed dynamically

//           return newMultiplier < maxMultiple ? parseFloat(newMultiplier.toFixed(2)) : (maxMultiple);

//         });
//       }, 20);

//       return () => clearInterval(multiplierInterval);
//     }

//   }, [countdown, multiple, maxMultiple]);

//   window.addEventListener("beforeunload", (event) => {
//     event.preventDefault();
//     event.returnValue = "Reloading in 5 seconds...";

//     let countdown = 10;
//     const interval = setInterval(() => {
//       // console.log(Reloading in ${countdown} seconds...);
//       countdown--;

//       if (countdown === 0) {
//         clearInterval(interval);
//         window.location.reload();
//       }
//     }, 10000);
//   });
//   // console.log(refresh)

//   useEffect(() => {
//     if (refresh) {
//       const gameState = {
//         countdown,
//         multiple: multiple,
//         maxMultiple,
//         betAmount,
//         gameId,
//         isBetPlace,
//         placebetClicked,
//         takeWinningsClicked,
//         lastUpdateTime: Date.now(), // Store timestamp
//       };
//       localStorage.setItem("gameState", JSON.stringify(gameState));
//     }

//   }, [countdown, multiple, maxMultiple, betAmount, gameId, isBetPlace, placebetClicked, takeWinningsClicked,]);


//   useEffect(() => {
//     const savedState = JSON.parse(localStorage.getItem("gameState"));
//     if (savedState) {
//       /*************  ✨ Codeium Command 🌟  *************/
//       const elapsedTime = Math.round((Date.now() - savedState.lastUpdateTime) / 1000);
//       let resumedMultiplier = savedState.multiple + elapsedTime * 0.5; // Adjust based on time
//       /******  c84fc74e-7274-41be-8e75-408823199d96  *******/
//       if (resumedMultiplier > savedState.maxMultiple) {
//         resumedMultiplier = (savedState.maxMultiple); // Prevent exceeding max
//       }
//       setCountdown(savedState.countdown);
//       // const newMultiple = resumedMultiplier.toFixed(2);
//       setMultiple(parseFloat(resumedMultiplier)); // Resume from correct position, ensure 2 
//       setMaxMultiple(localStorage.getItem("fetchLastMultiplierValue") || parseFloat((Math.random() * (7.00 - 0.01) + 0.01).toFixed(2)))// Math.random() * (10.00 - 0.01) + 0.01);
//       setBetAmount(savedState.betAmount);
//       setGameId(savedState.gameId);
//       setisBetPlace(savedState.isBetPlace);
//       setPlacebetClicked(savedState.placebetClicked);
//       setTakeWinningsClicked(savedState.takeWinningsClicked);
//     }
//   }, []);
//   window.addEventListener("beforeunload", (event) => {
//     setRefresh(true);
//     event.preventDefault();
//     event.returnValue = "Reloading in 5 seconds...";

//     // let countdown = 5;
//     // const interval = setInterval(() => {
//     //   console.log(Reloading in ${countdown} seconds...);
//     //   countdown--;

//     //   if (countdown === 0) {
//     //     clearInterval(interval);
//     //     window.location.reload();
//     //   }
//     // }, 1000);
//   });


//   const resetGame = () => {
//     localStorage.removeItem("gameState");
//     setCountdown(7);
//     setMultiple(0.5);
//     setBetAmount(0);
//     setGameId("");
//   };

//   // Reset when multiplier reaches maxMultiple
//   useEffect(() => {
//     if (multiple >= maxMultiple) {
//       // If user placed a bet but didn't take winnings, show loss popup
//       setIsBlast(true);
//       setTimeout(() => {
//         setIsBlast(false);
//       }, 1000);

//       // Clear all pending timeouts
//       timeoutIds.current.forEach((id) => clearTimeout(id));
//       timeoutIds.current = [];


//       setTimeout(() => {

//         localStorage.removeItem("gameState"); // CLEAR STORED GAME DATA
//         setMultiple(0.5);
//         setBetAmount(0);
//         setCountdown(7);
//         setPopupMessage("");
//         setPopup(false);
//         setPlacebetClicked(0);
//         setTakeWinningsClicked(0);
//         setHasUpdatedBets(false);
//         setStartAnimation(false)
//         setMaxMultiple(crashPoint || parseFloat((Math.random() * (10.00 - 0.01) + 0.01).toFixed(2)));
//         // setMaxMultiple(localStorage.getItem("fetchLastMultiplierValue") || parseFloat((Math.random() * (10.00 - 0.01) + 0.01).toFixed(2)));
//       }, 5000)
//     }
//   }, [multiple, maxMultiple]);

//   useEffect(() => {
//     if (multiple >= maxMultiple && placebetClicked > 0 && takeWinningsClicked === 0) {
//       setRefresh(false)
//       setIsWin("Lost")

//       setPopupMessage("Better Luck next Time");
//       if (isBetPlace) {
//         handlePlay(false, 0);

//       }
//       setPopup(true);
//       setTimeout(() => {
//         setPopup(false);
//         setPopupMessage("");
//       }, 3000);

//     }
//   }, [multiple, placebetClicked, takeWinningsClicked]);
//   useEffect(() => {
//     checkBet(betAmount)
//   }, [betAmount])
//   // Update betting data only once when countdown ends
//   useEffect(() => {
//     if (countdown === 0 && !hasUpdatedBets) {
//       updateBettingData();
//       setHasUpdatedBets(true); // Mark that bets have been updated
//     }
//   }, [countdown, hasUpdatedBets]);

//   // Reset betting data when countdown resets
//   useEffect(() => {
//     if (countdown === 7) {
//       const resetData = bettingData.map((entry) => ({
//         ...entry,
//         bet: '0 INR',
//         odds: 'x0',
//         win: '0 INR',
//         updated: null, // Reset updated flag
//       }));
//       setBettingData(resetData);
//       // fetchData()
//       setRefresh(true)
//       // localStorage.removeItem("prevRoundId")
//     }
//   }, [countdown]);


//   const PlaceBet = async (betinput) => {
//     // console.log(betAmount)
//     // const prevRoundId = ; // Set a default if null
//     // const slicePrevId = prevRoundId.slice(2); // Extract numeric part

//     // Ensure slicePrevId is a valid number
//     const uniquePart = Date.now().toString().slice(-4); // Get last 4 digits of timestamp
//     const NewRoundId = `AV${uniquePart}`;
//     // localStorage.setItem("prevRoundId", NewRoundId)
//     setGameId(NewRoundId);
//     // console.log("New Round ID:", NewRoundId);


//     try {
//       const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/avaitor/create`, {
//         user: profile.userId,
//         round_id: NewRoundId,
//         betAmt: betinput,
//       })
//       if (response.status === 200) {
//         // console.log(response.data)
//       }
//     } catch (error) {
//       alert(error.response.data.message)
//     }
//   }

//   const checkBet = () => {
//     if (betAmount > profile.walletBalance) {
//       // console.log("ok")
//       setPopup(true);
//       setPopupMessage("Insufficient Balance");
//       setisBetPlace(false)
//     }

//   }
//   // const crashPoint = localStorage.getItem("fetchLastMultiplierValue")
//   // console.log(crashPoint)
//   const calculateWinnings = () => {
//     return betAmount * multiple; // Calculate winnings
//     // fetchNameWallet()

//   };

//   const updateBettingData = () => {
//     const updatedData = bettingData.map((entry) => {
//       const randomNumber = Math.floor(Math.random() * (8000 - 1000 + 1)) + 1000; // Random bet amount
//       const randomMultiplier = parseFloat((Math.random() * (20.00 - 1.01) + 1.01).toFixed(2)); // Random decimal between 1.01 and 20.00, fixed to 2 decimal places
//       const winAmount = (randomNumber * randomMultiplier).toFixed(2); // Calculate winnings

//       // Random delay between 5s and 20s for each row
//       const randomDelay = Math.floor(Math.random() * (50000 - 2000 + 1)) + 2000;

//       // Store the timeout ID
//       const timeoutId = setTimeout(() => {
//         setBettingData((prevData) => {
//           return prevData.map((prevEntry) => {
//             if (prevEntry.username === entry.username && multiple < maxMultiple) {
//               return {
//                 ...prevEntry,
//                 odds: `x${randomMultiplier}`,
//                 win: `${winAmount} INR`,
//                 updated: true, // Mark as updated
//               };
//             }
//             return prevEntry;
//           });
//         });
//       }, randomDelay);

//       // Add the timeout ID to the list
//       timeoutIds.current.push(timeoutId);

//       // Return the initial entry with updated bet amount
//       return {
//         ...entry,
//         bet: `${randomNumber} INR`,
//       };
//     });

//     // Update the betting data with the new bet amounts
//     setBettingData(updatedData);
//   };

//   // console.log(maxMultiple)
//   const handlePlay = async (isWin, winnings) => {
//     try {
//       if (isBetPlace) {
//         const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/avaitor/update`, {
//           user: profile.userId,
//           round_id: gameId,
//           // betAmt: betAmount,
//           multiplier: multiple,
//           isWin: isWin ? "Won" : "Lost",
//           winningAmt: winnings,
//           crash: maxMultiple
//         })
//         if (response.status === 200) {
//           // console.log(response.data)
//         }
//       }

//     } catch (error) {
//       toast.error(error.response.data.message)
//     }
//   }
//   useEffect(() => {
//     // const fetchHistoryAsync = async () => {
//     //   try {
//     //     if (!profile) {
//     //       toast.error("Login to play the game")
//     //     } else {
//     //       // console.log(profile, "profiel")
//     //       const response = await axios.get(${process.env.REACT_APP_BASE_URL}/api/avaitor/gamehistory/${profile.userId});
//     //       if (response.data) {
//     //         serUserGameHistory(response.data)
//     //       }
//     //     }
//     //   } catch (error) {
//     //     toast.error(error.response.data.message)
//     //     console.log(error)
//     //   }
//     // }
//     // fetchHistoryAsync();
//   }, [])

//   useEffect(() => {
//     if (videoRef.current) {
//       if (countdown > 0 || multiple >= maxMultiple) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//     }
//   }, [countdown, multiple, maxMultiple]);

//   return (
//     <>
//       <Navbar />

//       <MainContainer>

//         <LeftConatainer>
//           <MobileHistoryContainer>
//             {/* <TabContainer>
//               <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All Bets</Tab>
//               <Tab active={activeTab === 'my'} onClick={() => setActiveTab('my')}>My Bets</Tab>
//             </TabContainer> 
//             {/* {activeTab /=== 'all' && ( */}
//             <ResponsiveTable bettingData={bettingData} />

//             {/* // )} */}
//             {isOpen && (
//               <Overlay>
//                 <ModalContent>
//                   <CloseButton onClick={() => setIsOpen(false)}>✖</CloseButton>
//                   {/* <TableContainer>
//                     <Header
//                       style={{
//                         background: "linear-gradient(90deg, rgb(255, 87, 34), rgb(233, 30, 99))",
//                       }}
//                     >
//                       <div>History</div>
//                     </Header>
//                     <TableWrapper>
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHeaderCell>TIME</TableHeaderCell>
//                             <TableHeaderCell>ROUND ID</TableHeaderCell>
//                             <TableHeaderCell>BET</TableHeaderCell>
//                             <TableHeaderCell>ODDS</TableHeaderCell>
//                             <TableHeaderCell>WIN</TableHeaderCell>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {userGamehistoryData &&
//                             userGamehistoryData.map((gameData, index) => (
//                               <TableRow key={index}>
//                                 <TableCell>{new Date(gameData.createdAt).toLocaleTimeString()}</TableCell>
//                                 <TableCell>{gameData.round_id}</TableCell>
//                                 <TableCell>{gameData.betAmt}</TableCell>
//                                 <TableCell>{gameData.multiplier}</TableCell>
//                                 <TableCell>{parseFloat(gameData.winningAmt).toFixed(2)}</TableCell>
//                               </TableRow>
//                             ))}
//                         </TableBody>
//                       </Table>
//                     </TableWrapper>
//                   </TableContainer> */}
//                   <UserHistoryTable userGameHistoryData={userGamehistoryData.slice(-4)} />
//                 </ModalContent>
//               </Overlay>
//             )}



//           </MobileHistoryContainer>




//           {window.innerWidth >= 1024 && <ResponsiveTable bettingData={bettingData} style={{}} />}
//         </LeftConatainer>

//         {/* Terms & Conditions Popup */}
//         {isTermsOpen && (
//           <TermsAndConditions setIsOpen={setIsTermsOpen} />
//         )}

//         <RightContainer>

//           <PlaneContainer>
//             <div className="crash-container1 plane">
//                {/* <ButtonContainer>
                
//                 <HistoryButton onClick={() => setIsTermsOpen(true)}> T & C</HistoryButton>
//               </ButtonContainer>  */}
//               <div style={{ display: "flex", gap: "2px", justifyContent: "start", flexDirection: "row", width: "100%", marginLeft: "20px", maxWidth: "95%", height: "95%" }}>
//                 <ScrollingDotsWrapper>
//                   <ScrollingDots animate={startAnimation} multiple={multiple} maxMultiple={maxMultiple} countdown={countdown}>
//                     {[...Array(4)].map((_, index) => (
//                       <DotIcon key={index} />
//                     ))}
//                   </ScrollingDots>
//                 </ScrollingDotsWrapper>
//                 <div style={{ display: "flex", gap: "0px", justifyContent: "space-between", flexDirection: "column", width: "100%", height: "95%" }}>
//                   <div className='outer-crash'>
//                     <div className='crash '>
//                       <div className='mountains'>
//                         <video
//                           ref={videoRef}
//                           autoPlay
//                           loop
//                           muted
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         >
//                           <source src={require('../assets/Aviato_BG.mp4')} type="video/mp4" />
//                         </video>
//                       </div>
//                       <div id="animation-container" className="curve1 ">
//                         {countdown === 0 ? (
//                           <svg id="animation-svg" className='absolute ' viewBox="75 20 800 400" xmlns="http://www.w3.org/2000/svg">
//                             <defs>
//                               <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="50%">
//                                 <stop offset="0%" style={{ stopColor: 'rgb(190, 96, 34)', stopOpacity: 0.8 }} />
//                                 <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
//                               </linearGradient>
//                             </defs>

//                             <path
//                               id="curve-path"
//                               className={`curved-rect ${multiple >= maxMultiple ? "animation-paused" : ""}`}
//                               d="M 70 350 Q 400 320 700 140 L 700 650 Q 200 400 50 550 Z"
//                               fill="url(#gradient1)"
//                             >
//                               <animate
//                                 attributeName="d"
//                                 from="M 70 350 Q 70 305 50 298 L 50 500 Q 200 400 50 550 Z"
//                                 to="M 70 350 Q 400 320 700 140 L 700 650 Q 200 400 50 550 Z"
//                                 dur="7s"
//                                 repeatCount="1"
//                               />
//                             </path>

//                             <path
//                               id="plane-path"
//                               className={`curved-rect ${multiple >= maxMultiple ? "animation-paused" : ""}`}
//                               d="M 70 350 Q 400 320 700 140"
//                               stroke="rgb(191, 68, 30)"
//                               strokeWidth="4"
//                               fill="transparent"
//                             >
//                               <animate
//                                 attributeName="d"
//                                 from="M 70 350 Q 70 300 70 300"
//                                 to="M 70 350 Q 400 320 700 140"
//                                 dur="7s"
//                                 repeatCount="1"
//                                 keyTimes="0;0.1;1"
//                               />
//                             </path>


//                             {/* <g id="shine">
//                               <image
//                                 id="shine-image"
//                                 href={shineImg}
//                                 width={window.innerWidth >= 1024 ? "200" : "400"}
//                                 height={window.innerWidth >= 1024 ? "200" : "400"}
//                                 transform={window.innerWidth >= 1024 ? "translate(-130, -80)" : "translate(-200, -200)"}
//                                 //   className={shine-animation ${multiple === maxMultiple ? "animation-paused" : ""}}
//                                 // >
//                                 className={shine-animation ${multiple >= maxMultiple ? "animation-paused" : ""}}>

//                                 <animateMotion dur="0.1s" repeatCount="1" keyTimes="0;1" fill="freeze">
//                                   <mpath href="#plane-path" />
//                                 </animateMotion>
//                               </image>
//                             </g> */}
//                             {/* 
//                         <g id="plane">
//                           <image
//                             id="plane-image"
//                             href={planeImg}
//                             width="100"
//                             height="100"
//                             transform={window.innerWidth < 768 ? "translate(-100, -100)" : "translate(-49, -49)"}
//                             className={`plane-animation ${multiple === maxMultiple ? "animation-paused" : ""} `}
//                             style={{ opacity: 1 }}
//                           > */}

//                             <g id="plane">
//                               <image
//                                 id="plane-image"
//                                 href={planeImg}
//                                 width="100"
//                                 height="100"
//                                 transform={window.innerWidth < 768 ? "translate(-100, -100)" : "translate(-47, -47)"}
//                                 className={`plane-animation ${multiple >= maxMultiple ? "animation-paused" : ""}`}
//                                 style={{ opacity: multiple >= maxMultiple ? 0 : 1 }}
//                               >


//                                 <animateMotion dur="0.1s" repeatCount="1" fill="freeze" rotate="auto">
//                                   <mpath href="#plane-path" />
//                                 </animateMotion>
//                               </image>
//                             </g>

//                             <g id="blast">
//                               <image
//                                 id="blast-image"
//                                 href={blastImg}
//                                 width="100"
//                                 height="100"
//                                 transform={window.innerWidth < 768 ? "translate(-100, -100)" : "translate(-47, -47)"}
//                                 className={`plane-animation ${isBlast ? "blast-animation" : ""}`}
//                                 style={{ opacity: isBlast ? 1 : 0 }}
//                               >

//                                 <animateMotion dur="0.1s" repeatCount="2" fill="freeze" rotate="auto">
//                                   <mpath href="#plane-path" />
//                                 </animateMotion>
//                               </image>
//                             </g>


//                           </svg>
//                         ) : null}
//                       </div>




//                     </div>
                    
//                     <div className={`count-down countdown ${countdown === 0 ? 'hidden' : ''}`} id="countdown-value">
//                       {countdown}
//                     </div>

//                     <div className={`countdown-display ${countdown === 0 ? 'hidden' : countdown}`}>
//                       <div className="ticks">
//                         <div className="tick tick1"></div>
//                         <div className="tick tick2"></div>
//                         <div className="tick tick3"></div>
//                         <div className="tick tick4"></div>
//                         <div className="tick tick5"></div>
//                         <div className="tick tick6"></div>
//                         <div className="tick tick7"></div>
//                         <div className="tick tick8"></div>
//                         <div className="tick tick9"></div>
//                         <div className="tick tick10"></div>
//                         <div className="tick tick11"></div>
//                         <div className="tick tick12"></div>
//                       </div>
//                     </div>



//                     {/* multiplier */}
//                     <div className={`count-down countdown multiplier ${countdown > 0 ? 'hidden' : ''}`} id="countdown-value">
//                       {multiple}x
//                     </div> 

//                     {/* pop-up */}

//                       <div className={`popup-container ${popup ? "visible" : "hidden"}`}>
//                       <div className={`popup-box ${window.innerWidth >= 1024 ? "lg" : ""}`}>
//                         {popupMessage}
//                       </div>
//                     </div>
//                   </div>
//                   <MovingDotsContainer>
//                     <MovingDots animate={startAnimation} multiple={multiple} maxMultiple={maxMultiple} countdown={countdown}>
//                       {[1, 2, 3, 4, 5].map((_, index) => (
//                         <Dot key={index} />
//                       ))}
//                     </MovingDots>
//                   </MovingDotsContainer>
//                 </div>
//               </div>

//             </div>
//           </PlaneContainer>
//           <BottomContainer>
//             {window.innerWidth >= 1024 && <UserHistory>
//               <TableContainer>
//                 <HistoryHeader style={{ background: "linear-gradient(90deg, rgb(255, 87, 34), rgb(233, 30, 99));" }}>
//                   <div>History</div>

//                 </HistoryHeader>
//                 <TableWrapper>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHeaderCell>TIME</TableHeaderCell>
//                         <TableHeaderCell>ROUND ID</TableHeaderCell>
//                         <TableHeaderCell>BET</TableHeaderCell>
//                         <TableHeaderCell>ODDS</TableHeaderCell>
//                         <TableHeaderCell>WIN</TableHeaderCell>
//                         {/* <TableHeaderCell>CRASH</TableHeaderCell> */}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {userGamehistoryData && userGamehistoryData.map((gameData, index) => (
//                         <TableRow key={index}>
//                           <TableCell>{new Date(gameData.createdAt).toLocaleTimeString()}</TableCell>
//                           <TableCell>{gameData.round_id}</TableCell>
//                           <TableCell>{gameData.betAmt}</TableCell>
//                           <TableCell>{gameData.multiplier}</TableCell>
//                           <TableCell>{gameData.winningAmt}</TableCell>
//                           {/* <TableCell>{gameData.crash ? gameData.crash : '-'}</TableCell> */}
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableWrapper>
//               </TableContainer>
//             </UserHistory>}


//             <BettingContainer>
//               <Header>
//                 <StackTitle style={{
//                   background: "#242746", borderRadius: "5px", fontWeight: "normal",
//                   padding: "10px 5px"
//                 }}>STAKE SELECTER</StackTitle>
//                 <StackTitle style={{
//                   background: "#242746", borderRadius: "5px", fontWeight: "normal",
//                   padding: "10px 5px"
//                 }}>Autobet</StackTitle>
//                 {/* <div>AutoBet</div> */}
//               </Header>
//               <div className="custom-div">
//                 <input
//                   type="number"
//                   id="bet-input"
//                   className={`${countdown === 0 ? "disabled" : ""
//                     }`}
//                   placeholder="Enter your bet"
//                   value={betinput}
//                   onChange={(e) => setBetinput(Number(e.target.value))}  // Handle input changes
//                   disabled={countdown === 0}  // Disable input when countdown is 0
//                 />
//                 <div className="button-container" style={{ display: "flex", justifyContent: "start", flexWrap: "wrap", width: "100%", margin: "auto", marginTop: "10px" }}>
//                   {[100, 200, 500, 1000, 2000, 5000].map((val) => (
//                     <button
//                       key={val}
//                       onClick={() => setBetinput(betinput + val)}
//                       disabled={countdown === 0}
//                       className="number-button"
//                     >
//                       {val}
//                     </button>
//                   ))}
//                   <button
//                     onClick={() => setBetinput(0)}
//                     disabled={countdown === 0}
//                     className="number-button2 number-button "
//                   >
//                     <span class="cross-icon " >x</span>
//                   </button>
//                 </div>

//                 <div className="stake-button">
//                   <button
//                     id="placeBetSection"
//                     onClick={() => {
//                       checkBet(betinput)
//                       if (betinput === "" || betinput === 0 || placebetClicked === 1) {

//                         return; // Exit the function if betinput is empty, zero, or the button has already been clicked
//                       }

//                       PlaceBet(betinput);
//                       setisBetPlace(true)
//                       setBetAmount(betinput);

//                       setPopup(true);
//                       setTimeout(() => {
//                         setPopup(false);
//                       }, 2000);
//                       setPopupMessage("Bet placed!");

//                       setPlacebetClicked(1); // Mark the button as clicked
//                     }}
//                     disabled={countdown === 0} // Disable button when countdown is 0
//                   // className="bg-orange-500 hover:bg-[#ff3d00] h-10 text-white font-semibold py-1 px-8 rounded-md text-[12px] mt-2 disabled:opacity-50"
//                   >
//                     <span className="block text-center" >PLACE A BET</span>
//                   </button>

//                   <button
//                     id="takewin"
//                     onClick={() => {
//                       if (takeWinningsClicked === 1) {
//                         return; // Exit if the button has already been clicked
//                       }

//                       const winnings = calculateWinnings(); // Calculate winnings
//                       setWinnings(winnings); // Update winnings state (if you have one)
//                       setTakeWinningsClicked(1); //
//                       //  Mark the button as clicked
//                       // setIsWin("Won")
//                       handlePlay(true, winnings);
//                       setPopup(true);
//                       setStartAnimation(false)
//                       setTimeout(() => {
//                         setPopup(false);
//                       }, 2000);
//                       setPopupMessage(`You have won: ${winnings.toFixed(2)}`); // Display winnings in the popup
//                     }}
//                     className=""
//                     disabled={countdown > 0 || multiple === maxMultiple || takeWinningsClicked === 1 || isBetPlace === false} // Disable button when countdown is active, multiplier is max, or button is clicked
//                   >
//                     TAKE WINNINGS
//                   </button>
//                 </div>


//               </div>

//               {/* <div></div> */}
//             </BettingContainer>
//           </BottomContainer>
//         </RightContainer>
//         <ToastContainer />
//       </MainContainer>

//     </>
//   )
// }

// export default Aviator

// const verticalScroll = keyframes`
//   0% { transform: translateY(0); }
//   100% { transform: translateY(30%); } * Moves only half to ensure smooth looping */
// `;

// const ScrollingDotsWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   overflow: hidden;
//   margin-right: 7px;
//   height: 90%;
// `;

// const ScrollingDots = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 2px;
//   justify-content: space-between;
//   height: 85%;
//    ${({ animate, multiple, maxMultiple, countdown }) =>
//     animate && multiple < maxMultiple && countdown === 0 &&
//     css`
//       animation: ${verticalScroll} .5s linear infinite;
//     `}
// `;

// const DotIcon = styled(FaCircle)`
//   color: grey;
//   font-size: 5px;
// `;


// const moveLeft = keyframes`
//   0% { transform: translateX(0); }
//   100% { transform: translateX(-25%); } /* Move only half, so it loops smoothly */
// `;

// const MovingDotsContainer = styled.div`
//   display: flex;
//   gap: 2px;
//   overflow: hidden;
//   width: 100%; /* Adjust width as needed */
// `;

// const MovingDots = styled.div`
//   display: flex;
//   width:90%;
//   margin-left: 10px;
//   justify-content: space-between;
//    ${({ animate, multiple, maxMultiple, countdown }) =>
//     animate && multiple < maxMultiple && countdown === 0 &&
//     css`
//       animation: ${moveLeft} 0.8s linear infinite;
//     `}
// `;

// const Dot = styled(FaCircle)`
//   color: grey;
//   font-size: 5px;
// `;


// const MainContainer = styled.div`
//   display: flex;
//   padding:20px;
//   flex-direction: row;
//   flex-wrap: wrap;
//   justify-content: justify-between;
//   // align-items: start;
//   // height: 100vh;
//   background:#12142B;
//   @media (max-width: 768px) {
//     width: 99%;
//     margin:auto;
//     flex-direction:column-reverse;
//      padding:0px;
//      box-sizing:border-box;
//   }
// `;

// const LeftConatainer = styled.div`
//   padding: 100px 10px;
//   min-height: 88vh;
//   box-sizing:border-box;
//   width: 30%;
//   // background:red;
//   @media (max-width: 768px) {
//     width: 100%;
//       padding: 5px 5px;
//   }
//     `;

// const RightContainer = styled.div` 
//   padding: 100px 20px;
//   box-sizing:border-box;
//   width: 70%;

//   @media (max-width: 768px) {
//     width: 100%;
//      padding: 73px 0px 5px 0px;
//     box-sizing:border-box;
//   }
// `;

// const PlaneContainer = styled.div`
//   height: 49vh;
//   width: 100%;
//   margin-bottom:2px;
//     background-color: #181C3A;
//    @media (max-width: 768px) {
//     width: 100%;
//     height: 26vh;
    
//   }
//   @media (min-width: 768px) and (max-width: 1024px) {
//     width: 100%;
//     height: 35vh;  }
// `;

// const ButtonContainer = styled.div`
// display:flex;
// flex-direction:row;
//     justify-content:space-between;
// width:80%;
// @media (max-width: 768px) {
// display:flex;
// flex-direction:row;
// justify-content:end;
// margin-bottom:3px;
// width:80%;
// gap:5px;
// margin-bottom:2px;
// margin:5px auto;
// flex-wrap:wrap;
// // background:red;
//   // dispaly:none;
// }
// `

// const TermsAndConditionButton = styled.button`
//   width: 49%;
//   background: #12142B;
//   color: #ff3d00;
//   margin-top: 20px;
//   height: 22px;
//   border: 1px solid #ff3d00;
//   border-radius: 5px;
//   font-size: 9px;
//   margin-left: 40px;
//   @media (min-width:768px){
//     width:20%;
//   }
// `;

// const HistoryButton = styled.button`
// display:none;

// @media (max-width: 768px) {
//   display:block;
//   width:49%;
// background:rgb(82, 30, 15);
// color:white;
// // height: 25px;
// // font-size:12px;
// border:1px solid rgb(73, 25, 10);
// border-radius:5px;
// text-transform: capitalize;
// font-family: 'Open Sans', sans-serif;
// width: 49%;
  
//         height: 23px;
//         font-size: 9px;
// }


// `


// const BottomContainer = styled.div`
//   // height: 35vh;
//   width: 100%;
//   // overflow: hidden;
//   // gap:20px;
//   display:flex;
//     margin-left: 0;
//   justify-content:space-between;

//   @media (max-width: 768px) {
//     margin-left: 0;
//     width: 100%;
//     flex-direction:column-reverse;
//     gap:20px;
//   }
// `;

// const UserHistory = styled.div`
//   background: #12142B;
//   height: 100%;
//   width: 60%;
//   @media (max-width: 768px) {
//     margin-left: 0;
//     width: 100%;
//   }
// `;

// const BettingContainer = styled.div`
//   background: #1B1D36;
//   height: 100%;
//   width: 36%;
//     margin-left: 0;
//   @media (max-width: 768px) {
//     margin-left: 0;
//     width: 100%;
//   }
// `;


// const TableContainer = styled.div`
//   width: 100%;
//   margin: auto;
//   background: #1B1D36;
//   border-radius: 10px;
//   overflow: hidden;
// `;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   // padding: 12px;
//   padding:10px 5px;
//   color: white;
//   font-weight: bold;
//   text-align: center;
//   box-sizing:border-box;
//   width:100%;
//   gap:5px;
//   margin:auto;

//   }



// `;

// const HistoryHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   background:linear-gradient(90deg, rgb(255, 87, 34), rgb(233, 30, 99));
//   padding: 10px;
  
//   color:white;
//   font-weight: bold;
//   text-align: center;
//   box-sizing:border-box;
//   `
// const StackTitle = styled.div`
//     width: 48%;
// backgrond:rgb(109, 74, 62);
// `

// const TableWrapper = styled.div`
//   max-height: 30vh;
//   overflow-y: auto;
//   scrollbar-width: none;
//   scrollbar-color: #ff5722 #1B1D36;

//   &::-webkit-scrollbar {
//     display: none;
//   }

//   &::-webkit-scrollbar {
//     width: 2px;
//   }

//   &::-webkit-scrollbar-thumb {
//     background-color: #ff5722;
//     border-radius: 10px;
//   }
//     @media (max-width: 768px) {
//     max-height: 70vh;
//     padding:0 0px; 
//   }
// `;

// const TableBody = styled.tbody`
//  max-height: 20vh;
//   overflow-y: auto;
//   scrollbar-width: thin;
  
//   scrollbar-color: #ff5722 #1B1D36;

//   &::-webkit-scrollbar {
//     width: 2px;
//   }
//   &::-webkit-scrollbar-thumb {
//     background-color: #ff5722;
//     border-radius: 10px;
//   }

//   @media (max-width: 768px) {
//     max-height: 70vh;
//     padding:0 10px; 
//     box-sizing:border-box;
//     font-size:12px;
//   }
// `;
// const Table = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   color: white;
// `;

// const TableHeader = styled.thead`
//   // background: #222;
//   text-transform: uppercase;
// `;

// const TableRow = styled.tr`
//   border-bottom: 1px solid #444;
// `;

// const TableCell = styled.td`
//   padding: 12px;
//   text-align: center;
//   box-sizing:border-box;
// `;

// const TableHeaderCell = styled.th`
//   padding: 12px;
//   text-align: center;
//   font-weight: bold;
//     box-sizing:border-box;

// `;

// const MobileHistoryContainer = styled.div`
//   @media (min-width: 769px) {
//     display: none;
//   }
//   width:100%;
// `
// const TabContainer = styled.div`
//   display: flex;
//   margin-bottom: 20px;
// `;

// const Tab = styled.button`
//   flex: 1;
//   padding: 10px;
//   background-color: ${(props) => (props.active ? '#ff5722' : '#3b3f51')};
//   color: white;
//   border: none;
//   border-radius: 10px;
//   margin-right: 10px;
//   cursor: pointer;
//   box-sizing:border-box;
// `;

// const Overlay = styled.div`
//   position: fixed;
//   top: 10%;
//   left: 0;
//   width: 95%;
//   margin:auto;
//   // height: 100%;
//   // margin-left: 2.5%;
//     box-sizing:border-box;
//   background: rgba(0, 0, 0, 0.6);
//   display: flex;
//   // justify-content: center;
//   // align-items: center;
//     z-index:2000;
// `;

// const ModalContent = styled.div`
//   // background: rgba(0, 0, 0, 0.6);
//   color:white;
//   padding: 10px;
//   border-radius: 8px;
//   width: 100%;
//   // max-height: 80vh;
//   height:auto;
//   box-sizing:border-box;
//   overflow-y: auto;
//   position: relative;
//   z-index:2000;
//   margin:auto;
// `;



// const CloseButton = styled.button`
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   background: red;
//   color: white;
//   border: none;
//   cursor: pointer;
//   padding: 5px 10px;
//   border-radius: 5px;
// `;
