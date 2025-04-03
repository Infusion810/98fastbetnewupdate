import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Card from "./Card";
import AllImages from "./AllImages";
import Swal from "sweetalert2";
import "./Papu.css";
import styled from "styled-components";
// import { toast } from "react-toastify";
import { useProfile, fetchNameWallet } from "../context/ProfileContext";
import { toast, ToastContainer } from "react-toastify";
// import History from "./History";
// import DashboardNavbar from "../Pages/Dashboard/Components/Navbar";
import Navbar from '../AllGamesNavbar/AllNavbar'
import BettingTable from "./bettingTable";

const allWinningImages = [
  { image: "butterfly.jpg", winningPoints: 10 },
  { image: "cow.jpg", winningPoints: 10 },
  { image: "football.jpg", winningPoints: 10 },
  { image: "spin.jpg", winningPoints: 10 },
  { image: "kite.webp", winningPoints: 10 },
  { image: "rat.webp", winningPoints: 10 },
  { image: "umberlla.jpg", winningPoints: 10 },
  { image: "diya.webp", winningPoints: 10 },
  { image: "flower.webp", winningPoints: 10 },
  { image: "bucket.jpg", winningPoints: 10 },
  { image: "parrot.webp", winningPoints: 10 },
  { image: "sun.webp", winningPoints: 10 },
  // { image: coin, winningPoints: 10 }
];

const Papu = () => {
  const { profile, fetchNameWallet } = useProfile();
  const [winningPointOfUser, setWinningPointOfUser] = useState([]);
  const [highlightedImages, setHighlightedImages] = useState([]);
  const [cards, setCards] = useState([]);
  const [balance, setBalance] = useState(profile.walletBalance);
  const [selectedImages, setSelectedImages] = useState([]);
  const [betPlaced, setBetPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [betCooldown, setBetCooldown] = useState(1);
  const [selectedCard, setSelectedCard] = useState([]);
  const [totalBetAmt, setTotalBetAmt] = useState(0)
  const [gameId, setGameId] = useState("")
  const [randomImage, setRandomImage] = useState(null);
  const [countDown, setCountDown] = useState(30)
  const [result, setResult] = useState(false)
  const betPlaceAmt = [
    { bet: 10, profit: 100 },
    { bet: 20, profit: 200 },
    { bet: 50, profit: 500 },
    { bet: 100, profit: 1000 },
    { bet: 500, profit: 5000 },
    { bet: 1000, profit: 10000 },
    { bet: 2000, profit: 20000 },
    { bet: 5000, profit: 50000 }
  ];

  useEffect(() => {
    fetchNameWallet();
  }, [fetchNameWallet]);

  const [betAmount, setBetAmount] = useState(10);
  const [expectedProfit, setExpectedProfit] = useState(100);
  const [titlibets, setTitlibets] = useState([])
  const [userData, setUserData] = useState(null);
  const [exposure, setExposure] = useState(0);
  const [isUpdateResult, setIsUpdateResult] = useState(false);
  // const [randomImage, setRandomImage] = useState(null);
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    } else {
      alert("User is not logged in. Please log in to view your bets.");
    }
  }, []);


  useEffect(() => {
    if (countDown > 0) return;

    const revealNextImage = async (index) => {
      setIsProcessing(true)
      setIsUpdateResult(true)
      setResult(true)
      setCards((prevCards) => {
        if (prevCards[index]?.revealedImage) return prevCards;

        return prevCards.map((card, i) =>
          i === index ? { ...card, loading: true } : card
        );
      });

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/titli/get-random-image`
        );
        const newRandomImage = response.data.randomImage;
        localStorage.setItem("randomImage", newRandomImage);
        setRandomImage(newRandomImage);

        setCards((prevCards) =>
          prevCards.map((card, i) =>
            i === index
              ? { ...card, revealedImage: newRandomImage, loading: false }
              : card
          )
        );

        // Check result after image is revealed
        const isMatch = selectedCard.some((card) => card.image === newRandomImage);
        const allBet = selectedCard.reduce((total, card) => total + card.betAmount, 0);

        if (isMatch) {
          setBalance((prev) => prev + expectedProfit);
          setHighlightedImages((prev) => [...new Set([...prev, newRandomImage])]);
          setWinningPointOfUser((prev) => [...prev, 10]);
          setTotalBetAmt(allBet);

          try {
            const response = await axios.put(
              `${process.env.REACT_APP_BASE_URL}/api/titli/updatebets`,
              {
                gameId: localStorage.getItem('titligameId'),
                user: profile.userId,
                betAmount,
                profit: expectedProfit,
                totalBets: allBet,
                isWin: true
              }
            );
            if (response.data.newBalance) {
              setBalance(response.data.newBalance);
            }
            if (response.status === 200) {
              fetchNameWallet()
            }
          } catch (error) {
            console.error("Error updating bet (win):", error);
          }
        } else {
          try {
            const response = await axios.put(
              `${process.env.REACT_APP_BASE_URL}/api/titli/updatebets`,
              {
                gameId: localStorage.getItem('titligameId'),
                user: profile.userId,
                profit: 0,
                totalBets: allBet,
                isWin: false
              }
            );
            if (response.data.newBalance) {
              setBalance(response.data.newBalance);
            }
            if (response.status === 200) {
              fetchNameWallet()
            }
          } catch (error) {
            console.error("Error updating bet (loss):", error);
          }
        }

        await showPremiumPopup({
          html: `
            <div style="position: absolute; top: 120px; left: 50%; transform: translate(-50%, 0); background: black; opacity: 0.8; padding: 1rem 1rem; border-radius:0.2rem; text-align: center;">
              <div style="font-size: 1.25rem; font-weight: bold;">${isMatch ? "You Won!" : "Try Again!"}</div>
              <div style="font-size: 0.875rem;">${isMatch ? `₹${expectedProfit} Added!` : "Better luck next time!"}</div>
            </div>
          `,
          gradient: isMatch
            ? "bg-gradient-to-br from-green-600 via-emerald-500 to-cyan-500"
            : "bg-gradient-to-br from-red-600 via-rose-500 to-pink-500",
          timer: 3000,
          position: "top-start",
        });

        setTimeout(() => {
          setCountDown(30);
          setIsProcessing(false);
          setResult(false);
          setBetPlaced(false);
          setSelectedImages([]);
          setSelectedCard([]);
        }, 4000);

      } catch (error) {
        console.error("Error fetching random image:", error);
      }
    };

    let currentIndex = cards.findIndex((card) => !card.revealedImage);
    if (currentIndex !== -1) {
      revealNextImage(currentIndex);
    }
  }, [countDown]);

  // useEffect(() => {
  //   if (countDown > 0) {
  //     const timer = setTimeout(() => setCountDown((prev) => prev - 1), 1000);

  //     return () => clearTimeout(timer);

  //   }

  // }, [countDown]); // Countdown logic


  // console.log(cards)

  // Fetch user's bets from the backend based on userId
  const fetchBets = async () => {
    if (userData) {
      try {
        const userId = userData.id;
        const pappuBetsResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pappu/bets/${userId}`);
        if (pappuBetsResponse.data.success) {
          // console.log(pappuBetsResponse.data)
          setTitlibets(pappuBetsResponse.data.bets);
        } else {
          alert("Failed to fetch user bets");
        }

      } catch (err) {
        console.error('Error fetching bets:', err);
        // alert("There was an error fetching bets.");
      }
    }
  };
  useEffect(() => {
    if (userData) {
      fetchBets();
    }
  }, [userData]);

  const [bettingDisabled, setBettingDisabled] = useState(false);
console.log(isUpdateResult, "updateResult")
  // Update your countdown useEffect to set bettingDisabled
  useEffect(() => {
    if (countDown > 0) {
      const timer = setTimeout(() => {
        setCountDown((prev) => prev - 1);
        // Disable betting when 10 seconds or less remain
        if (countDown <= 10) {
          setBettingDisabled(true);
        } else {
          setBettingDisabled(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countDown]);

  const handleBetChange = (bet, profit) => {
    const selectedBet = parseInt(bet);
    setBetAmount(selectedBet);
    const selectedBetData = betPlaceAmt.find((item) => item.bet === selectedBet);
    // console.log(selectedBetData)
    if (selectedBetData) {
      setExpectedProfit(selectedBetData.profit);
      // setTotalProfit(selectedBetData.profit + (userData?.wallet?.balance || 0));
    }
  };
  // console.log(expectedProfit, "expectedProfit")

  useEffect(() => {
    if (betCooldown > 0) {
      const timer = setInterval(() => {
        setBetCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup timer
    }
  }, [betCooldown]);


  // const [isWin, setIsWin] = useState(false);
  useEffect(() => {
    if (profile && profile.walletBalance !== undefined) {
      setBalance(profile.walletBalance);
    }
  }, [profile]);
  const initializeGame = useCallback(() => {
    setCards(
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        scratched: false,
        revealedImage: null
      }))
    );
    setSelectedImages([]);
    setBetPlaced(false);
    setHighlightedImages([]);
    setWinningPointOfUser([]);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const showPremiumPopup = (config) => {
    return Swal.fire({
      ...config,
      customClass: {
        popup: `${config.gradient} p-1 rounded-2xl shadow-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`,
        container: "backdrop-blur-sm",
        title: "text-white",
        htmlContainer: "text-white"
      },
      background: "transparent",
      showConfirmButton: false,
      timer: config.timer
    });
  };


  const handlePlay = useCallback(async () => {
    const date = new Date();
    const newgameId = `T${date.getTime().toString().padStart(3, '0')}`;
    localStorage.setItem('titligameId', newgameId)
    setGameId(newgameId)

    if (isProcessing) return;
    setIsProcessing(true);

    const totalBet = selectedCard.reduce((total, card) => total + card.betAmount, 0);

    if (!betAmount) {
      toast.error("⚠️ Select Bet Amount!");
      setIsProcessing(false);
      return;
    }
    if (totalBet <= 0) {
      toast.error("Total bet must be greater than 0.");
      setIsProcessing(false);
      return;
    }

    if (!betPlaced) {
      if (selectedImages.length > 0 && balance < totalBet) {
        await showPremiumPopup({
          title: '<div class="text-4xl">⚠️</div>',
          html: `<div class="space-y-2 text-center text-white">
            <div class="text-xl font-bold">Insufficient Balance!</div>
            <div class="text-sm opacity-75">Need ₹${totalBet - balance} more</div>
          </div>`,
          gradient: "bg-gradient-to-br from-red-600 via-rose-500 to-pink-600",
          timer: 3000
        });
        setIsProcessing(false);
        return;
      }
      await showPremiumPopup({
        html: `
         <div style="position: absolute; top: 120px; left: 50%; transform: translate(-50%, 0); background: black; opacity: 0.8; padding: 1rem 1rem; border-radius:0.2rem; text-align: center;">
            <div style="font-size: 1rem; color:green;">₹${totalBet} Bet Placed!</div>
          </div>
        `,
        background: "black",
        opacity: 0.8,
        position: "top-start",
        timer: 2000
      });
      if (selectedImages.length > 0) {
        setBalance((prev) => prev - totalBet);
        const allBet = selectedCard.reduce((total, card) => total + card.betAmount, 0);
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/titli/new/bets`,
            {
              user: profile.userId,
              betAmount,
              selectedCard: selectedCard,
              totalBets: allBet,
              gameId: localStorage.getItem('titligameId'),
            }
          );

          if (response.data.newBalance) {
            setBalance(response.data.newBalance);
          }
          if (response.status === 200) {
            fetchNameWallet()
          }
        } catch (error) {
          console.error("Error creating bet:", error);
        }
      }
      setBetPlaced(true);
    }

    const nextCard = cards.find((card) => !card.scratched);
    if (!nextCard) {
      await showPremiumPopup({
        html: `
            <div style="position: absolute; top: 120px; left: 50%; transform: translate(-50%, 0); background: black; opacity: 0.8; padding: 1rem 1rem; border-radius:0.2rem; text-align: center;">
            <div style="font-size: 1.25rem; font-weight: bold;">Game Over!</div>
            <div style="font-size: 0.875rem; opacity: 0.75;">Final Balance: ₹${balance}</div>
          </div>
        `,
        gradient: "bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500",
        position: "top-start",
      });
      initializeGame();
      setIsProcessing(false);
      return;
    }
}, [isProcessing, selectedImages, betPlaced, balance, betAmount, cards, initializeGame, profile.id]);

  const toggleImageSelection = (image, betAmount, profit) => {
    // console.log(image, betAmount, profit)
    if (isProcessing) return;
    setSelectedImages((prev) => {
      if (prev.includes(image)) {
        return prev.filter((img) => img !== image);
      } else {
        return [...prev, image];
      }
    });

    setSelectedCard((prev) => {
      const newSelectedCard = [...prev];
      const index = newSelectedCard.findIndex((card) => card.image === image);
      if (index === -1) {
        newSelectedCard.push({ image, betAmount, profit });
      } else {
        newSelectedCard.splice(index, 1);
      }
      return newSelectedCard;
    });
  };
  // console.log(cards)

  return (
    <MainContainer>
      <Navbar />

      <FlexContainer>
        <BettingTable titlibets={titlibets} />
        {/* </HistoryContainer> */}
        <GameSection>
          <Timer>{countDown}:00</Timer>
          <Title>Titli Par</Title>
          <GameBoardContainer>
            <GameBoardWrapper>
              <GridContainer>
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    isScratched={card.scratched}
                    revealedImage={card.revealedImage}
                  />
                ))}
              </GridContainer>
            </GameBoardWrapper>
          </GameBoardContainer>
          {/* Images Selection */}
          <AllImages
            allWinningImages={allWinningImages}
            highlightedImages={highlightedImages}
            selectedImages={selectedImages}
            betAmount={betAmount}
            onImageClick={toggleImageSelection}
            isTimerActive={!isProcessing && !bettingDisabled} // Add bettingDisabled check
            disabled={isProcessing || bettingDisabled}
            selectedCard={selectedCard}
            profit={expectedProfit}
          />
          <InnerContainer>
            <BalanceSection>
              <BetAmountSection>
                {betPlaceAmt.map(({ bet, profit }) => (
                  <button
                    key={bet}
                    onClick={() => handleBetChange(bet, profit)}
                    disabled={isProcessing || bettingDisabled || betCooldown > 10}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      margin: '0.1rem',
                      background: '#141a24',
                      width: "21%",
                      color: "white",
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {bet}
                  </button>
                ))}
              </BetAmountSection>
            </BalanceSection>

            {/* Status Indicator */}
            <StatusText>{isProcessing ? "Processing..." : "Select Images!"}</StatusText>
            <PlaceBetButton onClick={handlePlay} disabled={isProcessing || bettingDisabled}>
              {countDown == 0 ? `Wait ${betCooldown}s` : "Place Bet"}
              {/* "Place Bet */}
            </PlaceBetButton>
          </InnerContainer>
        </GameSection>
      </FlexContainer>
      <ToastContainer position="top-right" autoClose={2000} />
    </MainContainer>


  );
};

export default Papu;
const Timer = styled.div`
background: linear-gradient(to right, #68d391, #00bcd4);
-webkit-background-clip: text;
// color: transparent;
color:white;
font-weight: bold;
font-size: 1.5rem;
`
// Styled Components
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  // align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #1a202c, #141a24);
  // padding:  0.5rem 1rem;
  box-sizing:border-box;

`;


const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: bold;
  color: transparent;
  background-clip: text;
  background-image: linear-gradient(to right, #fbbf24, #f59e0b);
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
  @media (max-width: 768px) {
    display: none;
  }
`;

const GameBoardContainer = styled.div`
  width: 100%;
  max-width: 32rem;
  // background:red;
  background: linear-gradient(to bottom right, #2d3748, #1a202c);
  padding: 0.25rem;
  box-sizing:border-box;
  border-radius: 1rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 0rem;
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

`;

const GameBoardWrapper = styled.div`
  background: rgba(26, 32, 44, 0.5);
  backdrop-filter: blur(5px);
  border-radius: 1rem;
  padding: 1rem;
    box-sizing:border-box;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
`;

const InnerContainer = styled.div`
  background: linear-gradient(to bottom right, #2d3748, #1a202c);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 2rem;
  max-width: 32rem;
  margin: 0 auto;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  justify-content: space-around;
  box-sizing:border-box;
`;

const BalanceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  padding: 0;
`;

const BalanceText = styled.div`
  background: linear-gradient(to right, #68d391, #00bcd4);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
  h4 {
    margin: 0;
  }
`;

const BetAmountSection = styled.div`
  display: flex;
  // flex-direction: column;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;

  h5 {
    margin: 0;
    color: #00bcd4;
    font-weight: 600;
  }
`;

const BetAmountSelect = styled.select`
  background: linear-gradient(to bottom right, #4a5568, #2d3748);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  color: #00bcd4;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #00bcd4;
  }
`;

const StatusText = styled.div`
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #48bb78;
  // animation: pulse 1s infinite;
`;

const PlaceBetButton = styled.button`
  background: #fbbf24;
  color: black;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
  &:hover {
    background: #f59e0b;
  }
  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: end;
  align-items: flex-start;
  width: 100%;
  // max-width: 1200px;
  margin: auto;
  flex-wrap:wrap;
  // background:red;
  box-sizing:border-box;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    padding:20% 10px 10px 10px;

  }
`;

const GameSection = styled.div`
  width: 80%; /* Takes up 2 parts of the space */
  display: flex;
  flex-direction: column;
  align-items: center;
  // background:red;
   @media (max-width: 768px) {
   width:100%;
  }

`;

const HistoryContainer = styled.div`
  flex: 1; /* Takes up 1 part of the space */
backeground:white;
  padding: 1rem;
  border-radius: 1rem;
  min-height: 300px;
  width: 30%;
  box-sizing:border-box;
  // margin-top:60px;
  // position:fixed;
  // top:10px;
  // right:0;
  @media (max-width: 768px) {
    position: unset;
    width:100%;
    margin-top:2px;
    width:100%;
    padding:0
  }
`;
