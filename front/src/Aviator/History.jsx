import React, { useEffect, useState } from "react";
import { FaCoins, FaMoneyBillWaveAlt, FaUser } from "react-icons/fa";
import styled from "styled-components";

// const TableContainer = styled.div`
//   width: 95%;
//   // max-width: 900px;
//   margin: auto;
//   // background: #1B1D36;
//   border-radius: 10px;
//   overflow: hidden;
//   @media (max-width: 768px) {
//     width: 100%;
//     margin-top:5px;
//   }
// `;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   // background: linear-gradient(90deg, #ff5722, #e91e63);
//   background:#360000;
//   padding: 15px;
//   box-sizing:border-box;
//   color: white;
//   // font-weight: bold;
//   text-align: center;
//   @media (max-width: 768px) {
//     font-size: 14px;
//   }
// `;

// const TableWrapper = styled.div`
//   max-height: 70vh;
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
// `;

// const Table = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   color: white;
// `;

// const TableHeader = styled.thead`
// //   background: #222;
//   text-transform: uppercase;
//   postion:sticky;
//   top:0;
// `;

// const TableRow = styled.tr`
//   border-bottom: 1px solid #444;
// `;

// const TableCell = styled.td`
//   padding: 12px;
//   text-align: center;
//   box-sizing:border-box;
//   font-size:12px;
// `;

// const TableHeaderCell = styled.th`
//   padding: 12px;
//   text-align: center;
//   font-weight: bold;
//    box-sizing:border-box;
// `;


const ResponsiveTable = ({ bettingData }) => {
  const bets = [
    { username: "*******69", odds: "x0", bet: "1296 INR", win: "0 INR" },
    { username: "*******15", odds: "x0", bet: "1530 INR", win: "0 INR" },
    { username: "*******19", odds: "x0", bet: "6849 INR", win: "0 INR" },
    { username: "*******53", odds: "x0", bet: "4325 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
    { username: "*******25", odds: "x0", bet: "2884 INR", win: "0 INR" },
  ];
  const [totalBet, setTotalBets] = useState(0)
  const [totalWinnings, setWinnings] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(0)
  useEffect(() => {
    setTotalBets(Math.floor(Math.random() * 10000) + 1)

    setWinnings(Math.floor(Math.random() * 100000) + 1)
    setTotalPlayers(Math.floor(Math.random() * 1000) + 1)
  }, [])

  //   console.log(bettingData, "b")
  // const betAmt = Math.floor(Math.random() * (bets.length - 1)) + 1;
  return (
    <TableContainer>
      <Header>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>  Number of players
          <span><FaUser /> {totalPlayers} </span>  </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}> <span> Total bets </span><span> <FaCoins /> {totalBet}   </span>   </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}> <span> Total winnings </span> <span> <FaMoneyBillWaveAlt /> {totalWinnings} INR </span>  </div>
        {/* <div>Total bets:3000</div>
        <div>Total winnings: 0 INR</div> */}
      </Header>
      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Username</TableHeaderCell>
              <TableHeaderCell>Odds</TableHeaderCell>
              <TableHeaderCell>Bet</TableHeaderCell>
              <TableHeaderCell>Win</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {bettingData.map((bet, index) => (
              <TableRow key={index}>
                <TableCell style={{ color: bet.updated === true ? '#10b981' : bet.updated === false ? '#ef4444' : '#ffffff' }}>{bet.username}</TableCell>
                <TableCell style={{ color: bet.updated === true ? '#10b981' : bet.updated === false ? '#ef4444' : '#ffffff' }}>{bet.odds}</TableCell>
                <TableCell style={{ color: bet.updated === true ? '#10b981' : bet.updated === false ? '#ef4444' : '#ffffff' }}>{bet.bet}</TableCell>
                <TableCell style={{ color: bet.updated === true ? '#10b981' : bet.updated === false ? '#ef4444' : '#ffffff' }}>{bet.win}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </TableContainer>
  );
};

export default ResponsiveTable;




const TableContainer = styled.div`
  width: 95%;
  margin: auto;
  border-radius: 10px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 5px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  background: #360000;
  padding: 15px;
  box-sizing: border-box;
  color: white;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TableWrapper = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ff5722;
    border-radius: 10px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
`;

const TableHeader = styled.thead`
  position: sticky;
  top: -2;
  z-index: 10;
  background: #0F1124;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #444;
`;

const TableCell = styled.td`
  padding: 12px;
  text-align: center;
  box-sizing: border-box;
  font-size: 12px;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: center;
  font-weight: bold;
  box-sizing: border-box;
  position: sticky;
  top: -3px;
  background: #0F1124;
    z-index: 100; /* Keeps it above scrolling content */
`;