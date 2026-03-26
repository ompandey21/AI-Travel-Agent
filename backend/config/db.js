const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false
  }
);

// Import model defininition
const userAuthDef = require('../models/userAuth');

const tripDataDef = require('../models/tripData');
const tripMemberDef = require('../models/tripMember');

const itineraryDataDef = require('../models/itinerary_models/itineraryData');
const dayDataDef = require('../models/itinerary_models/dayData');
const slotDataDef = require('../models/itinerary_models/slotsData');

const HiddenGemDataDef = require('../models/hidden_gem/hiddenGem');
const voteDataDef = require('../models/hidden_gem/voteData');

const DocumentVaultDef = require('../models/documentVault');

const {expenseDataDef} = require('../models/expense_splitter/expenseData');
const userExpenseDef = require('../models/expense_splitter/userExpense');
const expenseMemberDef = require('../models/expense_splitter/expenseMember');
const expenseSettleMentDef = require('../models/expense_splitter/expenseSettlement');


// Define model
const UserAuth = sequelize.define('user_auth', userAuthDef, { timestamps: true });

const TripData = sequelize.define('trip_data', tripDataDef, { timestamps: true });
const TripMember = sequelize.define('trip_member_data', tripMemberDef, { timestamps: true });

const ItineraryData = sequelize.define('itinerary_data', itineraryDataDef, { timestamps: true });
const DayData = sequelize.define('day_data', dayDataDef, { timestamps: true });
const SlotData = sequelize.define('slot_data', slotDataDef, { timestamps: true });

const HiddenGemData = sequelize.define('hidden_gem_data',HiddenGemDataDef,{timestamps: true});
const HiddenGemVote = sequelize.define('hidden_gem_vote', voteDataDef, { timestamps: true, indexes: [{ unique: true, fields: ['userId', 'gemId'] }] });

const DocumentVault = sequelize.define('document_vault', DocumentVaultDef, { timestamps: true });

const ExpenseData = sequelize.define('expense_data', expenseDataDef, { timestamps: true });
const UserExpense = sequelize.define('user_expense', userExpenseDef, { timestamps: true });
const ExpenseMember = sequelize.define('expense_member', expenseMemberDef, { timestamps: true, indexes: [{ unique: true, fields: ['expenseId','userId'] }] });
const ExpenseSettlement = sequelize.define('expense_settlement', expenseSettleMentDef, { timestamps: true });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, UserAuth, TripData, TripMember, ItineraryData, DayData, SlotData, HiddenGemData, HiddenGemVote, DocumentVault, ExpenseData, UserExpense, ExpenseMember, ExpenseSettlement };
