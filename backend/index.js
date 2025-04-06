const JWT_SECRET = 'bunneybet';
const express = require('express');
const app = express();
const cors = require('cors');
const User = require('./models/UserSignUp');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User_Wallet = require('./models/Wallet.js');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const playerRouter = require("./Routes/cricket/playerRoutes");
dotenv.config();
const axios = require('axios');
const cricketMarketRoutes = require('./Routes/cricketMarketRoutes');
const cheerio = require('cheerio');
const moment = require('moment'); // For Node.js
app.use(express.json());
const betRoutes = require('./Routes/betRoutes');
const matkaRouter = require('./Routes/matkaRoutes.js');
const Matka = require('./models/matkaModel.js')
const papuRouter = require("./Routes/pappuRoutes.js")
const AddPointRouter = require("./controller/addPointsController")
const withdraw = require("./Routes/withdrwaRoter.js")
const crickbetRoutes = require("./Routes/crickbetRoutes.js")
const minesRouter = require('./Routes/minesRoute.js')
const bankDetailsRouter = require("./controller/bankDetails.js")
const http = require("http");
const matchRouter = require("./Routes/matchRouter.js")
const socketIo = require("socket.io");
const server = http.createServer(app);
const aarParParchiRouter = require('./Routes/aarPaarParchiRoutes.js');
const avaitorRouter = require("./Routes/avaitorRoutes.js")
const crashAvaitorRouter = require('./Routes/crashAvaitorRoutes.js')
const titliWinnerRouter = require("./Routes/titliWinnerRoutes.js")
const marketLogicRoutes = require('./Routes/marketLogicRoutes.js')
const sessionResultRoutes = require("./Routes/sessionResultRoutes.js")
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});


port = 4000
// CORS configuration

// app.use(
//   cors({
//     origin: ["https://www.98fastbet.com", "https://admin.98fastbet.com"], // Replace '*' with the specific origin(s) you want to allow, e.g., 'https://yourdomain.com'
//     methods: ['POST', 'GET', 'PUT', 'DELETE'], // Define allowed HTTP methods
//     credentials: true, // Allow credentials like cookies to be sent
//   })
// );
app.use(cors());

const MONGO_URI = process.env.mongodb_url;   
// MongoDB connection
mongoose.connect(`mongodb+srv://siddharthojha421:yPlKyyZpefa9Y5lJ@cluster0.rtjwl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.error("MongoDB Connection Error:", err));

  const NodeCache = require('node-cache');
  const cache = new NodeCache({ stdTTL: 60 });
  
  const marketMapping = {
    1: "SRIDEVI MORNING",
    10: "MILAN MORNING",
    13: "KALYAN MORNING",
    16: "SRIDEVI",
    22: "TIME BAZAR",
    25: "MADHUR DAY",
    31: "RAJDHANI DAY",
    34: "MILAN DAY",
    40: "KALYAN",
    46: "SRIDEVI NIGHT",
    58: "MILAN NIGHT",
    61: "KALYAN NIGHT",
    64: "RAJDHANI NIGHT",
    // 71: "abc",
  };
  
  const fetchMarketData = async () => {
    try {
      console.log('Fetching fresh market data...');
      const url = 'https://www.shrimatka.in';
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
  
      const markets = [];
  
      $('.clmn.clmn6.mblinbk.center').each((i, el) => {
        const marketNumber = i + 1;
        const marketName = marketMapping[marketNumber];
  
        if (!marketName) return; // Skip markets not in mapping
  
        const vCenterChildren = $(el).find('.v-center').children();
        const openNumber = vCenterChildren.eq(0)?.text().trim() || '*';
        const jodiDigit = vCenterChildren.eq(1)?.text().trim() || '*';
        const closeNumber = vCenterChildren.eq(2)?.text().trim() || '*';
  
        const openTime = $(el).find('.cmlo.font1 .clmn.clmn6.center.mblinbk span').first().text().trim();
        const closeTime = $(el).find('.cmlo.font1 .clmn.clmn6.center.mblinbk span').last().text().trim();
  
        if (!openTime || !closeTime || openTime === 'N/A' || closeTime === 'N/A') {
          return; // Skip markets without valid open/close times
        }
  
        const currentTime = moment();
        const openTimeMoment = moment(openTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
        const closeTimeMoment = moment(closeTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
        
        const isBeforeOpenTime = currentTime.isBefore(openTimeMoment);
        const isBeforeCloseTime = currentTime.isBefore(closeTimeMoment);
        
        let bidStatus;
        
        if (!isBeforeOpenTime && isBeforeCloseTime) {
          bidStatus = "Close";  // ✅ If open time has passed but close time has not
        } else if (!isBeforeOpenTime && !isBeforeCloseTime) {
          bidStatus = "Closed"; // ✅ If both open time and close time have passed
        } else if (isBeforeOpenTime && isBeforeCloseTime) {
          bidStatus = "Open | Close"; // ✅ If neither open time nor close time has passed
        }
        
       
        
  
        markets.push({
          marketNumber,
          marketName,
          openNumber,
          jodiDigit,
          closeNumber,
          openTime,
          closeTime,
          bidStatus
        });
      });
  
      const matkaData = await Matka.find();
    if (Array.isArray(matkaData)) {
      matkaData.forEach(data => {
        if (!Object.values(marketMapping).includes(data.marketName)) {
          return; // ✅ Skip if marketName is not in marketMapping
        }
  
        // ✅ Check if marketName already exists in `markets`
        const existingMarket = markets.find(m => m.marketName === data.marketName);
        if (!existingMarket) {
          const currentTime = moment();
          const openTimeMoment = moment(openTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
          const closeTimeMoment = moment(closeTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
          
          const isBeforeOpenTime = currentTime.isBefore(openTimeMoment);
          const isBeforeCloseTime = currentTime.isBefore(closeTimeMoment);
          
          let bidStatus;
          
          if (!isBeforeOpenTime && isBeforeCloseTime) {
            bidStatus = "Close";  // ✅ If open time has passed but close time has not
          } else if (!isBeforeOpenTime && !isBeforeCloseTime) {
            bidStatus = "Closed"; // ✅ If both open time and close time have passed
          } else if (isBeforeOpenTime && isBeforeCloseTime) {
            bidStatus = "Open | Close"; // ✅ If neither open time nor close time has passed
          }
          
        
          markets.push({
            marketName: data.marketName,
            openNumber: data.openNumber,
            jodiDigit: data.jodiDigit,
            closeNumber: data.closeNumber,
            openTime: data.openTime,
            closeTime: data.closeTime,
            bidStatus
          });
        }
      });
    } else {
      console.error("matkaData is not an array:", matkaData);
    }
      cache.set('marketData', markets);
      return markets;
  
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return [];
    }
  };
  
  app.get('/api/subscription-state', async (req, res) => {
    let markets = cache.get('marketData');
  
    if (!markets) {
      markets = await fetchMarketData();
    }
  
    res.json({ markets });
  });
  
  setInterval(fetchMarketData, 60000);











// const NodeCache = require('node-cache');
// const cache = new NodeCache({ stdTTL: 60 });

// const marketMapping = {
//   1: "SRIDEVI MORNING",
//   10: "MILAN MORNING",
//   13: "KALYAN MORNING",
//   16: "SRIDEVI",
//   22: "TIME BAZAR",
//   25: "MADHUR DAY",
//   31: "RAJDHANI DAY",
//   34: "MILAN DAY",
//   40: "KALYAN",
//   46: "SRIDEVI NIGHT",
//   58: "MILAN NIGHT",
//   61: "KALYAN NIGHT",
//   64: "RAJDHANI NIGHT",
//   // 71: "abc",
// };

// const fetchMarketData = async () => {
//   try {
//     console.log('Fetching fresh market data...');
//     const url = 'https://www.shrimatka.in';
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);

//     const markets = [];

//     $('.clmn.clmn6.mblinbk.center').each((i, el) => {
//       const marketNumber = i + 1;
//       const marketName = marketMapping[marketNumber];

//       if (!marketName) return; // Skip markets not in mapping

//       const vCenterChildren = $(el).find('.v-center').children();
//       const openNumber = vCenterChildren.eq(0)?.text().trim() || '*';
//       const jodiDigit = vCenterChildren.eq(1)?.text().trim() || '*';
//       const closeNumber = vCenterChildren.eq(2)?.text().trim() || '*';

//       const openTime = $(el).find('.cmlo.font1 .clmn.clmn6.center.mblinbk span').first().text().trim();
//       const closeTime = $(el).find('.cmlo.font1 .clmn.clmn6.center.mblinbk span').last().text().trim();

//       if (!openTime || !closeTime || openTime === 'N/A' || closeTime === 'N/A') {
//         return; // Skip markets without valid open/close times
//       }

//       const currentTime = moment();
//       const openTimeMoment = moment(openTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
//       const closeTimeMoment = moment(closeTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
      
//       const isBeforeOpenTime = currentTime.isBefore(openTimeMoment);
//       const isBeforeCloseTime = currentTime.isBefore(closeTimeMoment);
      
//       let bidStatus;
      
//       if (!isBeforeOpenTime && isBeforeCloseTime) {
//         bidStatus = "Close";  // ✅ If open time has passed but close time has not
//       } else if (!isBeforeOpenTime && !isBeforeCloseTime) {
//         bidStatus = "Closed"; // ✅ If both open time and close time have passed
//       } else if (isBeforeOpenTime && isBeforeCloseTime) {
//         bidStatus = "Open | Close"; // ✅ If neither open time nor close time has passed
//       }
      
     
      

//       markets.push({
//         marketNumber,
//         marketName,
//         openNumber,
//         jodiDigit,
//         closeNumber,
//         openTime,
//         closeTime,
//         bidStatus
//       });
//     });

//     const matkaData = await Matka.find();
//   if (Array.isArray(matkaData)) {
//     matkaData.forEach(data => {
//       if (!Object.values(marketMapping).includes(data.marketName)) {
//         return; // ✅ Skip if marketName is not in marketMapping
//       }

//       // ✅ Check if marketName already exists in `markets`
//       const existingMarket = markets.find(m => m.marketName === data.marketName);
//       if (!existingMarket) {
//         const currentTime = moment();
//         const openTimeMoment = moment(openTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
//         const closeTimeMoment = moment(closeTime, 'hh:mm a').subtract(5, 'hours').subtract(30, 'minutes');
        
//         const isBeforeOpenTime = currentTime.isBefore(openTimeMoment);
//         const isBeforeCloseTime = currentTime.isBefore(closeTimeMoment);
        
//         let bidStatus;
        
//         if (!isBeforeOpenTime && isBeforeCloseTime) {
//           bidStatus = "Close";  // ✅ If open time has passed but close time has not
//         } else if (!isBeforeOpenTime && !isBeforeCloseTime) {
//           bidStatus = "Closed"; // ✅ If both open time and close time have passed
//         } else if (isBeforeOpenTime && isBeforeCloseTime) {
//           bidStatus = "Open | Close"; // ✅ If neither open time nor close time has passed
//         }
        
       
        

//         markets.push({
//           marketName: data.marketName,
//           openNumber: data.openNumber,
//           jodiDigit: data.jodiDigit,
//           closeNumber: data.closeNumber,
//           openTime: data.openTime,
//           closeTime: data.closeTime,
//           bidStatus
//         });
//       }
//     });
//   } else {
//     console.error("matkaData is not an array:", matkaData);
//   }
//     cache.set('marketData', markets);
//     return markets;

//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     return [];
//   }
// };

// app.get('/api/subscription-state', async (req, res) => {
//   let markets = cache.get('marketData');

//   if (!markets) {
//     markets = await fetchMarketData();
//   }

//   res.json({ markets });
// });

// setInterval(fetchMarketData, 60000);



app.get('/api/name/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user and wallet by ID
    const user = await User.findById(id);
    const wallet = await User_Wallet.findOne({ user: id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with username, wallet balance, exposure balance, and email
    res.json({ 
      username: user.username, 
      walletBalance: wallet.balance, 
      exposureBalance: wallet.exposureBalance || 0, 
      email: user.email,
      userNo: user.userNo 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Sign Up Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Ensure all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let userNo;
    let count = 5000;
    do {
      userNo = `C${count}`;
      count++;
    } while (await User.findOne({ userNo }));

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      userNo,
    });

    const savedUser = await newUser.save();

    // Create a wallet for the new user
    const wallet = new User_Wallet({
      user: savedUser._id,
      balance: 0, // Set an initial wallet balance if desired
    });
    await wallet.save();

    // Link the wallet to the user
    savedUser.wallet = wallet._id;
    await savedUser.save();

    // Respond with success
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: savedUser._id, username: savedUser.username, email: savedUser.email ,userNo:savedUser.userNo},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { userNo, password } = req.body;

  if (!userNo || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ userNo }).populate('wallet');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletBalance: user.wallet?.balance || 0,
        userNo:user.userNo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;
  console.log(email, newPassword)
  // Check if email and new password are provided
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.use('/api', aarParParchiRouter);
app.use("/", matkaRouter)
app.use("/", playerRouter)
app.use("/",crickbetRoutes)
app.use('/api', AddPointRouter);
app.use(betRoutes);
app.use("/api",papuRouter)
app.use('/api', bankDetailsRouter);
app.use('/api', withdraw);
app.use('/api', minesRouter)
app.use('/api', matchRouter);
app.use('/api', avaitorRouter);
app.use('/api', crashAvaitorRouter);
app.use('/api', titliWinnerRouter);
app.use("/api", marketLogicRoutes);
app.use("/", cricketMarketRoutes);
app.use("/", sessionResultRoutes);
let liveData = {
  matches: [],
  odds: {},
};

// Fetch ongoing matches every second
const fetchOngoingMatches = async () => {
  try {
    const response = await axios.post(
      "https://api.btx99.com/v1/sports/matchList",
      {},
      {
        headers: {
          Authorization: "Bearer YOUR_VALID_TOKEN_HERE", // Replace with a valid token
          Accept: "application/json",
          Origin: "https://btx99.com",
          Referer: "https://btx99.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0",
        },
      }
    );
    liveData.matches = response.data.data.map((match) => ({
      eventId: match.eventId,
      matchName: match.matchName,
      marketId: match.marketId,
      scoreIframe: match.scoreIframe,
    }));
    io.emit("updateMatches", liveData.matches);
  } catch (error) {
    console.error("Error fetching ongoing matches:", error.message);
  }
};

// Fetch odds for each market ID
const fetchOdds = async () => {
  try {
    const marketIds = liveData.matches.map((match) => match.marketId);
    if (marketIds.length === 0) return;

    for (const marketId of marketIds) {
      const response = await axios.get(
        `https://vigcache.crickexpo.in/v2/api/oddsDataNew?market_id=${marketId}`,
        {
          headers: {
            accept: 'application/json, text/plain, /',
            'accept-language': 'en-US,en;q=0.9,en-IN;q=0.8',
            origin: 'https://btx99.com',
            referer: 'https://btx99.com/',
            'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
          },
        }
      );

      if (response.data.result) {
        const matchData = liveData.matches.find(match => match.marketId === marketId);
        const matchName = matchData ? matchData.matchName : `Market ${marketId}`;
        liveData.odds[marketId] = {
          matchName,
          matchOdds: response.data.result.team_data || [],
          fancyMarkets: response.data.result.session || [],
          commissionFancy: response.data.result.commission_fancy_data || [],
          noCommissionFancy: response.data.result.no_commission_fancy_data || [],
        };
      }
    }
    io.emit("updateOdds", liveData.odds);
  } catch (error) {
    console.error("Error fetching odds:", error.message);
  }
};

// Run functions every second
setInterval(fetchOngoingMatches, 1000);
setInterval(fetchOdds, 1000);

// API Route: Fetch odds from backend cache
app.get("/api/odds", (req, res) => {
  const { market_id } = req.query;
  if (!market_id || !liveData.odds[market_id]) {
    return res.status(404).json({ error: "No odds available" });
  }
  res.json(liveData.odds[market_id]);
});

// WebSocket: Live Score & Odds Updates
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("updateMatches", liveData.matches);
  socket.emit("updateOdds", liveData.odds);
  socket.on("disconnect", () => console.log("Client disconnected"));
});





// Titli Game WebSocket Implementation

let titliGameState = {

  currentRound: null,

  gamePhase: 'betting', // 'betting' or 'result'

  timeRemaining: 30,

  winningImage: null,

  winningImageNumber: null,

  bettingOpen: true,

  participants: new Set(),

  roundStartTime: null

};



// Make titliGameState globally available

global.titliGameState = titliGameState;



// Function to generate a unique round ID

const generateRoundId = () => {

  const date = new Date();

  return `T${date.getTime().toString().padStart(3, '0')}`;

};



// Start a new Titli game round

const startNewTitliRound = async () => {

  try {

    // Reset game state for a new round

    titliGameState.currentRound = generateRoundId();

    titliGameState.gamePhase = 'betting';

    titliGameState.timeRemaining = 30;

    titliGameState.bettingOpen = true;

    titliGameState.participants = new Set();

    titliGameState.roundStartTime = Date.now();

    titliGameState.winningImage = null;

    titliGameState.winningImageNumber = null;

    

    // Broadcast new round start to all clients

    io.emit('titli:roundStart', {

      roundId: titliGameState.currentRound,

      timeRemaining: titliGameState.timeRemaining

    });

    

    console.log(`New Titli round started: ${titliGameState.currentRound}`);

  } catch (error) {

    console.error('Error starting new Titli round:', error);

  }

};



// End betting phase and determine winning image

const endTitliBettingPhase = async () => {

  try {

    titliGameState.bettingOpen = false;

    titliGameState.gamePhase = 'result';

    

    // Get the winning image from database (admin-selected)

    const titliWinnerModel = require('./models/TitliWinner');

    const allowedEntries = await titliWinnerModel.find({ "Images.isAllowed": true });

    

    if (!allowedEntries.length) {

      console.error('No allowed images found for revealing result');

      return;

    }

    

    // Flatten all allowed images into a single array

    const allAllowedImages = allowedEntries.flatMap(entry =>

      entry.Images.filter(img => img.isAllowed)

    );

    

    if (!allAllowedImages.length) {

      console.error('No allowed images found in the flattened array');

      return;

    }

    

    // Select a random image from allowed ones

    const randomImage = allAllowedImages[Math.floor(Math.random() * allAllowedImages.length)];

    titliGameState.winningImage = randomImage.image;

    

    // Find the image number based on the image name

    if (randomImage.imageNumber) {

      titliGameState.winningImageNumber = randomImage.imageNumber;

    } else {

      // If the image doesn't have a number, find it from our static mapping

      const imageMapping = {

        "butterfly.jpg": 1,

        "cow.jpg": 2,

        "football.jpg": 3,

        "spin.jpg": 4,

        "flower.webp": 5,

        "diya.webp": 6,

        "bucket.jpg": 7,

        "kite.webp": 8,

        "rat.webp": 9,

        "umberlla.jpg": 10,

        "parrot.webp": 11,

        "sun.webp": 12

      };

      titliGameState.winningImageNumber = imageMapping[randomImage.image] || null;

    }

    

    // Broadcast result to all clients

    io.emit('titli:revealResult', {

      roundId: titliGameState.currentRound,

      winningImage: titliGameState.winningImage,

      winningImageNumber: titliGameState.winningImageNumber

    });

    

    // Process winners for this round

    processWinners(titliGameState.currentRound, titliGameState.winningImage, titliGameState.winningImageNumber);

    

    console.log(`Titli round ${titliGameState.currentRound} result revealed: ${titliGameState.winningImage} (Number: ${titliGameState.winningImageNumber})`);

    

    // Wait 5 seconds before starting a new round

    setTimeout(() => {

      startNewTitliRound();

    }, 5000);

  } catch (error) {

    console.error('Error ending Titli betting phase:', error);

  }

};



// Process bet winners for a completed round

const processWinners = async (roundId, winningImage, winningImageNumber) => {

  try {

    const User_Wallet = require('./models/Wallet');

    const PappuModel = require('./models/papuModel');

    

    // Find all bets for this round

    const bets = await PappuModel.find({ 

      titliGameId: roundId

    });

    

    console.log(`Processing ${bets.length} bets for round ${roundId}`);

    

    // Get image to number mapping

    const titliWinnerModel = require('./models/TitliWinner');

    const imageData = await titliWinnerModel.find().sort({ createdAt: -1 }).limit(1);

    

    let imageNumberMapping = {};

    if (imageData.length > 0 && imageData[0].Images) {

      imageData[0].Images.forEach(img => {

        imageNumberMapping[img.image] = img.imageNumber;

      });

    } else {

      // Fallback hardcoded mapping

      imageNumberMapping = {

        "butterfly.jpg": 1,

        "cow.jpg": 2,

        "football.jpg": 3,

        "spin.jpg": 4,

        "flower.webp": 5,

        "diya.webp": 6,

        "bucket.jpg": 7,

        "kite.webp": 8,

        "rat.webp": 9,

        "umberlla.jpg": 10,

        "parrot.webp": 11,

        "sun.webp": 12

      };

    }

    

    // Process each bet

    for (const bet of bets) {

      console.log(`Processing bet for user: ${bet.user}, game: ${roundId}`);

      console.log(`Bet selected cards:`, bet.selectedCard);

      

      const userSelectedCards = bet.selectedCard || [];

      let isWin = false;

      let totalProfit = 0;

      

      // Determine if any selected card matches the winning image/number

      for (const card of userSelectedCards) {

        const cardImage = card.image;

        const cardImageNumber = imageNumberMapping[cardImage];

        

        console.log(`Checking card: ${cardImage} (${cardImageNumber}) against winner: ${winningImage} (${winningImageNumber})`);

        

        // Winning condition: either image name matches OR image number matches

        if (cardImage === winningImage || cardImageNumber === winningImageNumber) {

          isWin = true;

          const betAmount = card.betAmount || 0;

          // Calculate profit (10x the bet amount)

          const profit = betAmount * 10;

          totalProfit += profit;

          console.log(`WIN! User ${bet.user} won ${profit} on ${cardImage}`);

        }

      }

      

      // Update bet with result

      bet.isCompleted = true;

      bet.isWin = isWin;

      bet.profit = totalProfit;

      bet.winningImage = winningImage;

      await bet.save();

      

      // If win, update user wallet

      if (isWin && totalProfit > 0) {

        try {

          // First try with userId field

          let userWallet = await User_Wallet.findOne({ userId: bet.user });

          

          // If not found, try directly with user field

          if (!userWallet) {

            userWallet = await User_Wallet.findOne({ user: bet.user });

          }

          

          // If still not found, try with user as string

          if (!userWallet) {

            userWallet = await User_Wallet.findOne({ userId: bet.user.toString() });

          }

          

          if (userWallet) {

            console.log(`Found wallet for user ${bet.user}, current balance: ${userWallet.balance}`);

            userWallet.balance += totalProfit;

            await userWallet.save();

            console.log(`Updated wallet balance to ${userWallet.balance} (+${totalProfit})`);

            

            // Emit win notification to user

            io.emit('titli:winResult', {

              userId: bet.user.toString(),

              profit: totalProfit,

              winningImage,

              winningImageNumber

            });

            

            console.log(`User ${bet.user} won ${totalProfit} on round ${roundId}`);

          } else {

            console.error(`Wallet not found for user ${bet.user}. Tried userId and user fields.`);

          }

        } catch (err) {

          console.error(`Error updating wallet for user ${bet.user}:`, err);

        }

      }

    }

    

    console.log(`Finished processing winners for round ${roundId}`);

  } catch (error) {

    console.error('Error processing winners:', error);

  }

};



// Update time remaining and broadcast to clients

const updateTitliTimer = () => {

  if (titliGameState.gamePhase === 'betting' && titliGameState.timeRemaining > 0) {

    titliGameState.timeRemaining -= 1;

    

    // When 10 seconds or less remain, close betting

    if (titliGameState.timeRemaining <= 10) {

      titliGameState.bettingOpen = false;

    }

    

    // Broadcast updated timer to all clients

    io.emit('titli:timerUpdate', {

      roundId: titliGameState.currentRound,

      timeRemaining: titliGameState.timeRemaining,

      bettingOpen: titliGameState.bettingOpen

    });

    

    // When timer reaches 0, reveal result

    if (titliGameState.timeRemaining === 0) {

      endTitliBettingPhase();

    }

  }

};



// Start the Titli game on server startup

startNewTitliRound();



// Run timer update every second

setInterval(updateTitliTimer, 1000);



// Socket connection handler

io.on('connection', (socket) => {

  console.log(`Client connected: ${socket.id}`);

  

  // Handle client joining Titli game

  socket.on('titli:join', () => {

    // Send current game state to the client that just joined

    socket.emit('titli:gameState', {

      roundId: titliGameState.currentRound,

      timeRemaining: titliGameState.timeRemaining,

      gamePhase: titliGameState.gamePhase,

      bettingOpen: titliGameState.bettingOpen,

      winningImage: titliGameState.gamePhase === 'result' ? titliGameState.winningImage : null,

      winningImageNumber: titliGameState.gamePhase === 'result' ? titliGameState.winningImageNumber : null

    });

    

    titliGameState.participants.add(socket.id);

    console.log(`Client ${socket.id} joined Titli game, round ${titliGameState.currentRound}`);

  });

  

  // Handle client placing bet

  socket.on('titli:placeBet', async (betData) => {

    // Forward this to the frontend through API calls

    console.log(`Client ${socket.id} placed bet in round ${titliGameState.currentRound}:`, betData);

  });

  

  // Handle disconnection

  socket.on('disconnect', () => {

    titliGameState.participants.delete(socket.id);

    console.log(`Client disconnected: ${socket.id}`);

  });



  // Handle client requesting next image reveal

  socket.on('titli:requestNextImage', (data) => {

    // Check if we have the winning image available

    if (titliGameState.winningImage && data.gameId === titliGameState.currentRound) {

      socket.emit('titli:nextImage', {

        index: data.currentIndex + 1, // Next index

        winningImage: titliGameState.winningImage,

        winningImageNumber: titliGameState.winningImageNumber

      });

    }

  });

});


// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server started on port ${PORT}`);
// });
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
