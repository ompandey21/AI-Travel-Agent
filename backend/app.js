const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const authRoutes = require("./userRole/routes/authRoute");
const createTripRoutes = require("./userRole/routes/createTripRoute");
const readTripRoutes = require("./userRole/routes/readTripRoute");
const createItineraryRoutes = require("./userRole/routes/createItineraryRoute");
const readItineraryRoutes = require("./userRole/routes/readItineraryRoute");
const hiddenGemRoutes = require('./userRole/routes/hiddenGemRoute');
const documentRoutes = require('./userRole/routes/documentRoute');
const expenseSplitterRoutes = require('./userRole/routes/expenseSplitterRoute');

const { sequelize, connectDB, UserAuth, TripData, TripMember, ItineraryData, DayData, SlotData, HiddenGemData, DocumentVault, ExpenseData, ExpenseMember, UserExpense, ExpenseSettlement} = require("./config/db");
connectDB();

sequelize.sync({alter: false})
  .then(() => console.log("Tables synced"))
  .catch(err => console.error(err));

// Associations
// UserAuth and TripData: one-to-many (created_by)
UserAuth.hasMany(TripData, { foreignKey: 'created_by', as: 'trips' });
TripData.belongsTo(UserAuth, { foreignKey: 'created_by', as: 'creator' });

// UserAuth and TripMember: many-to-many through TripMember
UserAuth.hasMany(TripMember, { foreignKey: 'userId', as: 'tripMemberships' });
TripMember.belongsTo(UserAuth, { foreignKey: 'userId', as: 'user' });

// TripData and TripMember: many-to-many through TripMember
TripData.hasMany(TripMember, { foreignKey: 'tripId', as: 'members' });
TripMember.belongsTo(TripData, { foreignKey: 'tripId', as: 'trip' });

// TripData and ItineraryData: one-to-many (trip_id)
TripData.hasMany(ItineraryData, { foreignKey: 'trip_id', as: 'itineraries' });
ItineraryData.belongsTo(TripData, { foreignKey: 'trip_id', as: 'trip' });

// ItineraryData and DayData: one-to-many (itinerary_id)
ItineraryData.hasMany(DayData, { foreignKey: 'itinerary_id', as: 'days' });
DayData.belongsTo(ItineraryData, { foreignKey: 'itinerary_id', as: 'itinerary' });

// DayData and SlotData: one-to-many (day_id)
DayData.hasMany(SlotData, { foreignKey: 'day_id', as: 'slots' });
SlotData.belongsTo(DayData, { foreignKey: 'day_id', as: 'day' });

// HiddenGemData and UserAuth: many-to-one (added_by)
UserAuth.hasMany(HiddenGemData, { foreignKey: 'added_by', as: 'hiddenGems' });
HiddenGemData.belongsTo(UserAuth, { foreignKey: 'added_by', as: 'adder' });

// DocumentVault and UserAuth: many-to-one (userId)
UserAuth.hasMany(DocumentVault, { foreignKey: 'userId', as: 'documents' });
DocumentVault.belongsTo(UserAuth, { foreignKey: 'userId', as: 'uploader' });

// DocumentVault and TripData: many-to-one (tripId)
TripData.hasMany(DocumentVault, { foreignKey: 'tripId', as: 'documents' });
DocumentVault.belongsTo(TripData, { foreignKey: 'tripId', as: 'trip' });

// Associations for expense-splitter
// ExpenseData belongs to a Trip and a Payer (UserAuth)
ExpenseData.belongsTo(TripData, { foreignKey: 'tripId', as: 'trip', onDelete: 'CASCADE' });
TripData.hasMany(ExpenseData, { foreignKey: 'tripId', as: 'expenses', onDelete: 'CASCADE' });
ExpenseData.belongsTo(UserAuth, { foreignKey: 'paidBy', as: 'paidByUser', onDelete: 'SET NULL' });
UserAuth.hasMany(ExpenseData, { foreignKey: 'paidBy', as: 'paidExpenses' });

// ExpenseMember links users to an Expense and stores per-user share
ExpenseMember.belongsTo(ExpenseData, { foreignKey: 'expenseId', as: 'expense', onDelete: 'CASCADE' });
ExpenseData.hasMany(ExpenseMember, { foreignKey: 'expenseId', as: 'members', onDelete: 'CASCADE' });
ExpenseMember.belongsTo(UserAuth, { foreignKey: 'userId', as: 'user' });
UserAuth.hasMany(ExpenseMember, { foreignKey: 'userId', as: 'expenseMemberships' });

// UserExpense holds per-user aggregates for a Trip
UserExpense.belongsTo(TripData, { foreignKey: 'tripId', as: 'trip', onDelete: 'CASCADE' });
TripData.hasMany(UserExpense, { foreignKey: 'tripId', as: 'userExpenses', onDelete: 'CASCADE' });
UserExpense.belongsTo(UserAuth, { foreignKey: 'userId', as: 'user' });
UserAuth.hasMany(UserExpense, { foreignKey: 'userId', as: 'tripBalances' });

// ExpenseSettlement records suggested/actual settlements between users
ExpenseSettlement.belongsTo(TripData, { foreignKey: 'tripId', as: 'trip', onDelete: 'CASCADE' });
TripData.hasMany(ExpenseSettlement, { foreignKey: 'tripId', as: 'settlements', onDelete: 'CASCADE' });
ExpenseSettlement.belongsTo(UserAuth, { foreignKey: 'payerId', as: 'payer' });
UserAuth.hasMany(ExpenseSettlement, { foreignKey: 'payerId', as: 'outgoingSettlements' });
ExpenseSettlement.belongsTo(UserAuth, { foreignKey: 'receiverId', as: 'receiver' });
UserAuth.hasMany(ExpenseSettlement, { foreignKey: 'receiverId', as: 'incomingSettlements' });

// link from settlement to originating expense
ExpenseSettlement.belongsTo(ExpenseData, { foreignKey: 'expenseId', as: 'originExpense', onDelete: 'SET NULL' });
ExpenseData.hasMany(ExpenseSettlement, { foreignKey: 'expenseId', as: 'relatedSettlements' });

app.use(express.json());

app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api/trips", createTripRoutes);
app.use("/api/read-trips", readTripRoutes);
app.use("/api/itinerary", createItineraryRoutes);
app.use("/api/read-itinerary", readItineraryRoutes);
app.use("/api/hidden-gem", hiddenGemRoutes);
app.use("/api/docs", documentRoutes);
app.use("/api/expense-splitter", expenseSplitterRoutes);

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log("Server connected successfully");
})