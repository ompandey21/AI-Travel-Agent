const { Op } = require("sequelize");
const { TripMember, ExpenseData, UserExpense, ExpenseMember, ExpenseSettlement, UserAuth } = require("../../config/db");
const { simplifyDebts } = require("../../service/expenseService");

// Helper function to ensure UserExpense record exists
const ensureUserExpenseRecord = async (tripId, userId) => {
    const existing = await UserExpense.findOne({ where: { tripId, userId } });
    if (!existing) {
        await UserExpense.create({ tripId, userId, totalPaid: 0, totalOwed: 0 });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { title, amount, splitType, splits, participants } = req.body;
        const paidBy = req.user.id;

        if (!title || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid expense data" });
        }

        const isMember = await TripMember.findOne({ where: { tripId, userId: paidBy } });
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        const totalAmount = parseFloat(amount);

        if (splitType === 'equal') {
            if (!participants || !Array.isArray(participants) || participants.length === 0) {
                return res.status(400).json({ message: "Participants required for equal split" });
            }

            for (const userId of participants) {
                const memberExists = await TripMember.findOne({ where: { tripId, userId } });
                if (!memberExists) {
                    return res.status(400).json({ message: `User ${userId} is not a member of this trip` });
                }
            }

            const shareAmount = totalAmount / participants.length;

            const expense = await ExpenseData.create({
                tripId: parseInt(tripId),
                title,
                amount: totalAmount,
                paidBy,
                splitType: 'equal'
            });

            for (const userId of participants) {
                await ensureUserExpenseRecord(tripId, userId);

                await ExpenseMember.create({
                    userId,
                    expenseId: expense.id,
                    shareAmount
                });

                await UserExpense.increment('totalOwed', {
                    by: shareAmount,
                    where: { tripId, userId }
                });
            }

            await UserExpense.increment('totalPaid', {
                by: totalAmount,
                where: { tripId, userId: paidBy }
            });

            return res.status(201).json({
                message: "Expense added and split among selected participants",
                expense
            });
        }

        if (splitType === 'custom') {
            if (!splits || !Array.isArray(splits) || splits.length === 0) {
                return res.status(400).json({ message: "Custom splits must include participant list" });
            }

            let totalSplitAmount = 0;
            const normalizedSplits = [];

            for (let idx = 0; idx < splits.length; idx++) {
                const split = splits[idx];
                const userId = split.userId ?? split.userid;
                const amountValue = Number(split.amount);

                if (!userId || Number.isNaN(amountValue) || amountValue < 0) {
                    return res.status(400).json({
                        message: `Invalid split data at index ${idx}`
                    });
                }

                totalSplitAmount += amountValue;
                normalizedSplits.push({ userId, amount: amountValue });
            }

            if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
                return res.status(400).json({
                    message: `Split amounts (${totalSplitAmount}) don't match total expense (${totalAmount})`
                });
            }

            const userIds = normalizedSplits.map(s => s.userId);
            const uniqueIds = new Set(userIds);

            if (uniqueIds.size !== userIds.length) {
                return res.status(400).json({ message: "Duplicate users in splits" });
            }

            for (const split of normalizedSplits) {
                const memberExists = await TripMember.findOne({
                    where: { tripId, userId: split.userId }
                });

                if (!memberExists) {
                    return res.status(400).json({
                        message: `User ${split.userId} is not a member of this trip`
                    });
                }
            }

            const expense = await ExpenseData.create({
                tripId: parseInt(tripId),
                title,
                amount: totalAmount,
                paidBy,
                splitType: 'custom'
            });

            for (const split of normalizedSplits) {
                await ensureUserExpenseRecord(tripId, split.userId);

                await ExpenseMember.create({
                    userId: split.userId,
                    expenseId: expense.id,
                    shareAmount: split.amount
                });

                await UserExpense.increment('totalOwed', {
                    by: split.amount,
                    where: { tripId, userId: split.userId }
                });
            }

            await UserExpense.increment('totalPaid', {
                by: totalAmount,
                where: { tripId, userId: paidBy }
            });

            return res.status(201).json({
                message: "Expense added with custom splits",
                expense
            });
        }

        return res.status(400).json({
            message: "Invalid split type. Use 'equal' or 'custom'"
        });

    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.settleExpense = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { receiverId, amount } = req.body;
        const payerId = req.user.id;

        if (!receiverId || !amount || amount <= 0) {
            if(!receiverId) return res.status(400).json({ message: "Invalid reciever" });
            return res.status(400).json({ message: "Invalid settlement data" });
        }

        const payerIsMember = await TripMember.findOne({ where: { tripId, userId: payerId } });
        const receiverIsMember = await TripMember.findOne({ where: { tripId, userId: receiverId } });

        if (!payerIsMember || !receiverIsMember) {
            return res.status(403).json({ message: "Both users must be members of this trip" });
        }

        await ensureUserExpenseRecord(tripId, payerId);
        await ensureUserExpenseRecord(tripId, receiverId);

        const payerExpense = await UserExpense.findOne({ where: { tripId, userId: payerId } });
        const receiverExpense = await UserExpense.findOne({ where: { tripId, userId: receiverId } });

        const payerBalance = payerExpense.totalPaid - payerExpense.totalOwed;
        const receiverBalance = receiverExpense.totalPaid - receiverExpense.totalOwed;

        if (payerBalance >= 0 || receiverBalance <= 0) {
            return res.status(400).json({
                message: "Invalid settlement: Payer must owe money and receiver must be owed money"
            });
        }

        const settlementAmount = parseFloat(amount);
        const maxSettlement = Math.min(Math.abs(payerBalance), receiverBalance);

        if (settlementAmount > maxSettlement) {
            return res.status(400).json({
                message: `Settlement amount too high. Maximum allowed: ${maxSettlement}`
            });
        }

        const existingPending = await ExpenseSettlement.findOne({
            where: {
                tripId,
                payerId,
                receiverId,
                status: 'pending'
            }
        });

        if (existingPending) {
            return res.status(400).json({
                message: "A pending settlement already exists between these users"
            });
        }

        const settlement = await ExpenseSettlement.create({
            tripId: parseInt(tripId),
            payerId,
            receiverId,
            amount: settlementAmount,
            status: 'pending'
        });

        await UserExpense.increment('pendingToPay', {
            by: settlementAmount,
            where: { tripId, userId: payerId }
        });

        await UserExpense.increment('pendingToReceive', {
            by: settlementAmount,
            where: { tripId, userId: receiverId }
        });

        return res.status(201).json({
            message: "Settlement request sent. Awaiting confirmation.",
            settlement
        });

    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.confirmSettlement = async (req, res) => {
    try {
        const { settlementId } = req.params;
        const userId = req.user.id;

        const settlement = await ExpenseSettlement.findByPk(settlementId);

        if (!settlement) {
            return res.status(404).json({ message: "Settlement not found" });
        }

        if (settlement.receiverId !== userId) {
            return res.status(403).json({ message: "Only receiver can confirm this settlement" });
        }

        if (settlement.status !== 'pending') {
            return res.status(400).json({ message: "Settlement already processed" });
        }

        const { tripId, payerId, receiverId, amount } = settlement;

        await ensureUserExpenseRecord(tripId, payerId);
        await ensureUserExpenseRecord(tripId, receiverId);

        const payerExpense = await UserExpense.findOne({ where: { tripId, userId: payerId } });
        const receiverExpense = await UserExpense.findOne({ where: { tripId, userId: receiverId } });

        if (payerExpense.pendingToPay < amount || receiverExpense.pendingToReceive < amount) {
            return res.status(400).json({ message: "Invalid pending balances" });
        }

        await UserExpense.decrement('pendingToPay', {
            by: amount,
            where: { tripId, userId: payerId }
        });

        await UserExpense.decrement('pendingToReceive', {
            by: amount,
            where: { tripId, userId: receiverId }
        });

        await UserExpense.decrement('totalOwed', {
            by: amount,
            where: { tripId, userId: payerId }
        });

        await UserExpense.decrement('totalPaid', {
            by: amount,
            where: { tripId, userId: receiverId }
        });

        settlement.status = 'completed';
        settlement.clearedAt = new Date();
        settlement.confirmedAt = new Date();

        await settlement.save();

        return res.status(200).json({
            message: "Settlement confirmed successfully",
            settlement
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getSettlements = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user.id;

        const isMember = await TripMember.findOne({ where: { tripId, userId } });
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        const userExpenses = await UserExpense.findAll({ where: { tripId }, include: [{ model: UserAuth, as: 'user', attributes: ['id', 'name', 'email'] }] });

        const balances = userExpenses.map((ue) => ({
            userId: ue.userId,
            name: ue.user ? ue.user.name : null,
            email: ue.user ? ue.user.email : null,
            totalPaid: parseFloat(ue.totalPaid),
            totalOwed: parseFloat(ue.totalOwed),
            balance: parseFloat(ue.totalPaid - ue.totalOwed)
        }));

        const transactions = simplifyDebts(balances);

        const recentSettlements = await ExpenseSettlement.findAll({
            where: { tripId },
            include: [
                { model: UserAuth, as: 'payer', attributes: ['id', 'name'] },
                { model: UserAuth, as: 'receiver', attributes: ['id', 'name'] }
            ],
            order: [['clearedAt', 'DESC']],
            limit: 10
        });

        const formattedSettlements = recentSettlements.map((settlement) => ({
            id: settlement.id,
            payer: settlement.payer ? { id: settlement.payer.id, name: settlement.payer.name } : null,
            receiver: settlement.receiver ? { id: settlement.receiver.id, name: settlement.receiver.name } : null,
            amount: parseFloat(settlement.amount),
            status: settlement.status,
            clearedAt: settlement.clearedAt
        }));

        return res.status(200).json({ message: "Settlement data retrieved successfully", balances, suggestedSettlements: transactions, recentSettlements: formattedSettlements });

    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTripExpenses = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user.id;

        const isMember = await TripMember.findOne({ where: { tripId, userId } });
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        const expenses = await ExpenseData.findAll({
            where: { tripId },
            include: [
                { model: UserAuth, as: 'paidByUser', attributes: ['id', 'name', 'email'] },
                { model: ExpenseMember, as: 'members', include: [{ model: UserAuth, as: 'user', attributes: ['id', 'name', 'email'] }] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const formattedExpenses = expenses.map((expense) => ({
            id: expense.id,
            title: expense.title,
            amount: parseFloat(expense.amount),
            splitType: expense.splitType,
            paidBy: expense.paidByUser ? { id: expense.paidByUser.id, name: expense.paidByUser.name, email: expense.paidByUser.email } : null,
            participants: expense.members.map((member) => ({ userId: member.userId, name: member.user?.name, email: member.user?.email, shareAmount: parseFloat(member.shareAmount) })),
            createdAt: expense.createdAt
        }));

        return res.status(200).json({ message: "Trip expenses retrieved successfully", expenses: formattedExpenses });

    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getUserBalance = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.user.id;

        const isMember = await TripMember.findOne({ where: { tripId, userId } });
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        const userExpense = await UserExpense.findOne({ where: { tripId, userId } });
        if (!userExpense) {
            return res.status(200).json({ message: "No expenses found for this user in the trip", balance: { totalPaid: 0, totalOwed: 0, netBalance: 0, status: "settled", youOwe: [], owesYou: [] } });
        }

        const totalPaid = parseFloat(userExpense.totalPaid);
        const totalOwed = parseFloat(userExpense.totalOwed);
        const netBalance = totalPaid - totalOwed;

        const allBalances = await UserExpense.findAll({ where: { tripId }, include: [{ model: UserAuth, as: 'user', attributes: ['id', 'name', 'email'] }] });

        const debts = simplifyDebts(allBalances.map((bal) => ({ userId: bal.userId, totalPaid: bal.totalPaid, totalOwed: bal.totalOwed })));

        const youOwe = debts.filter((d) => d.from === userId);
        const owesYou = debts.filter((d) => d.to === userId);

        return res.status(200).json({
            message: "User balance retrieved successfully",
            balance: {
                totalPaid,
                totalOwed,
                netBalance,
                status: netBalance === 0 ? "settled" : netBalance > 0 ? "owed" : "owes",
                youOwe,
                owesYou
            }
        });

    } catch (err) {
        console.error("Internal server error", err);
        res.status(500).json({ message: "Internal server error" });
    }
};