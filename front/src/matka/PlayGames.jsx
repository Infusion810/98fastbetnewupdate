import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../AllGamesNavbar/AllNavbar";

const Container = styled.div`
  margin-top: -20px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
`;

const Wrapper = styled.div`
  background-color: white;
  width: 100%;
  padding: 20px;
  margin-top: 4rem;
  border-radius: 10px;
  box-sizing: border-box;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const GameCard = styled.div`
  background-color: #0b3c68;
  color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const GameHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // margin-bottom: 10px;
`;

const PlayButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  text-align: center;
  margin: 5px 0;

  svg {
    font-size: 16px;
    background-color: #d4f4a6;
    padding: 12px;
    border-radius: 50%;
    color: red;
     width: 40px;
     height:40px;
    margin-bottom: 3px;
  }

  p {
    font-size: 15px;
    font-weight: bold;
    margin-top: 2px;
  }
`;

const GameDetails = styled.div`
  text-align: center;
  margin-top: 5px;

  h4 {
    color: red;
    font-size: 16px;
    font-weight: bold;
    margin: 3px 0;
  }

  h3 {
    font-size: 14px;
    font-weight: bold;
    margin: 3px 0;
  }

  p {
    font-size: 11px;
    margin: 3px 0;
  }
`;

const TimeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  background-color: ${props => props.status === "Closed" ? "#ff4444" : "#00C851"};
`;

const PlayGames = () => {
  const [gamesData, setGamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGameData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/admin/getMatkas`);
      setGamesData(response.data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
    const intervalId = setInterval(fetchGameData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Container>
      <Navbar />
      <Wrapper>
        {loading ? (
          <p style={{ textAlign: "center", fontWeight: "bold" }}>Loading...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>{error}</p>
        ) : (
          <GridContainer>
            {gamesData.map((game, index) => (
              <GameCard key={index}>
                <GameHeader>
                  <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>{game.marketName}</h3>
                  <Link
                    to={game.closeStatus === "Closed" ? "#" : `/casino/play/${game.marketName}/${game.closeStatus}`}
                    style={{ textDecoration: "none", color: "white" }}
                    onClick={game.closeStatus === "Closed" ? (e) => e.preventDefault() : undefined}
                  >
                    <PlayButton>
                      <FaPlay style={{ 
                        color: game.closeStatus === "Closed" ? "gray" : "red",
                     
                        padding: "10px"
                      }} />
                      <p style={{ 
                        color: game.closeStatus === "Closed" ? "gray" : "white",
                        fontSize: "15px"
                      }}>
                        {game.closeStatus === "Closed" ? "Closed" : "Play Now"}
                      </p>
                    </PlayButton>
                  </Link>
                </GameHeader>

                <GameDetails>
                  <h4>{game.openNumber}-{game.jodiDigit}-{game.closeNumber}</h4>
                  <StatusBadge status={game.closeStatus}>
                    {game.closeStatus === "Closed" ? "Closed" : ` ${game.closeStatus}`}
                  </StatusBadge>
                </GameDetails>

                <TimeInfo>
                  <p>⏱️ {game.openTime}</p>
                  <p>⏳ {game.closeTime}</p>
                </TimeInfo>
              </GameCard>
            ))}
          </GridContainer>
        )}
      </Wrapper>
    </Container>
  );
};

export default PlayGames;