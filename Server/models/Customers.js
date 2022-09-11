const mongoose = require("mongoose")

const schema = mongoose.Schema({
    walletId: String,
    walletPw: String,
    availableBalance: Number,
    totalBalance: Number,
    isActive: Boolean,
  
},
    {
        timestamps: true
    }
)
schema.virtual('id', {
    id: this.id
});

// Define a pre-save method for categorySchema
schema.pre('save', function (next) {
    var self = this;
    next();
});

module.exports = mongoose.model("Customers", schema)