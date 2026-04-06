const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  CompanyName: {
    type: String,
    required: true,
    unique: true,
  },
  companyCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
  },
  logo: {
    type: String,
    default: null,
  },
  adminId: {
    type: String,
    ref: "User",
  },
},
  { timestamps: true }
);
// Auto-generate company code from company name before saving
companySchema.pre("save", function () {
  if (this.isNew && !this.companyCode) {
    // Extract first 2-4 letters from company name
    const words = this.CompanyName.trim().split(/\s+/);
    console.log("Words is:",words);
    let code = "";
    
    if (words.length === 1) {
      // Single word - take first 2-4 letters
      code = words[0].substring(0, 2).toUpperCase();
      console.log("Code in single word:",code);
    } else {
      // Multiple words - take first letter of each word (max 4)
      code = words
        .slice(0, 4)
        .map(word => word[0])
        .join("")
        .toUpperCase();
        console.log("Code in multiple words:",code);
    }
    this.companyCode = code;
  }
});
module.exports = mongoose.model('Company', companySchema);