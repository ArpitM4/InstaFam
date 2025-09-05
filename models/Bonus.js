import mongoose from 'mongoose';

const bonusSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorUsername: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  totalFamPointsRedeemed: {
    type: Number,
    required: true,
    default: 0
  },
  totalRedemptions: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['UnRequested', 'Requested', 'Granted'],
    default: 'UnRequested',
    required: true
  },
  requestedAt: {
    type: Date,
    default: null
  },
  grantedAt: {
    type: Date,
    default: null
  },
  bonusAmount: {
    type: Number,
    default: 0 // Amount granted when status is 'Granted'
  },
  redemptionDetails: [{
    redemptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Redemption'
    },
    fanUsername: String,
    vaultItemTitle: String,
    famPointsSpent: Number,
    redeemedAt: Date
  }]
}, {
  timestamps: true
});

// Compound index to ensure one bonus record per creator per month/year
bonusSchema.index({ creatorId: 1, month: 1, year: 1 }, { unique: true });

// Index for efficient queries
bonusSchema.index({ creatorUsername: 1 });
bonusSchema.index({ status: 1 });
bonusSchema.index({ month: 1, year: 1 });

// Static method to get or create bonus record for current month
bonusSchema.statics.getOrCreateMonthlyBonus = async function(creatorId, creatorUsername, month = null, year = null) {
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  let bonus = await this.findOne({
    creatorId,
    month: targetMonth,
    year: targetYear
  });

  if (!bonus) {
    bonus = await this.create({
      creatorId,
      creatorUsername,
      month: targetMonth,
      year: targetYear,
      totalFamPointsRedeemed: 0,
      totalRedemptions: 0,
      status: 'UnRequested'
    });
  }

  return bonus;
};

// Instance method to add redemption to bonus
bonusSchema.methods.addRedemption = async function(redemptionData) {
  // Check if redemption already exists to avoid duplicates
  const existingRedemption = this.redemptionDetails.find(
    detail => detail.redemptionId?.toString() === redemptionData.redemptionId?.toString()
  );

  if (!existingRedemption) {
    this.totalFamPointsRedeemed += redemptionData.famPointsSpent;
    this.totalRedemptions += 1;
    this.redemptionDetails.push(redemptionData);
  }
  
  return this.save();
};

// Instance method to clear and reset redemptions (for rebuilding data)
bonusSchema.methods.resetRedemptions = async function() {
  this.totalFamPointsRedeemed = 0;
  this.totalRedemptions = 0;
  this.redemptionDetails = [];
  return this.save();
};

// Instance method to request bonus
bonusSchema.methods.requestBonus = async function() {
  if (this.status !== 'UnRequested') {
    throw new Error('Bonus has already been requested or granted');
  }
  this.status = 'Requested';
  this.requestedAt = new Date();
  return this.save();
};

// Instance method to grant bonus
bonusSchema.methods.grantBonus = async function(bonusAmount) {
  if (this.status !== 'Requested') {
    throw new Error('Bonus must be requested before it can be granted');
  }
  this.status = 'Granted';
  this.grantedAt = new Date();
  this.bonusAmount = bonusAmount;
  return this.save();
};

const Bonus = mongoose.models.Bonus || mongoose.model('Bonus', bonusSchema);

export default Bonus;
