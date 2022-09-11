const mongoose = require("mongoose")

const schema = mongoose.Schema({
    gameType: String,
    tableName: String,
    smallBlind: String,
    bigBlind: String,
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

function generateRandom(min, max) {
    return  parseInt(Math.floor(Math.random() * (max - min)) + min);
}

module.exports = mongoose.model("TableTypes", schema)