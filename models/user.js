const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require("bcrypt-nodejs")
const crypto = require("crypto")
const { promisify } = require("util")

const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  name: String,
  password: String,
  photo: String,
  tweets: [
    { tweet: { type: Schema.Types.ObjectId, ref: "Tweet" } } // mac dinh tao user thi tweets se la []
  ],
  likedTweets: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  retweets: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],

  followers: [{ type: Schema.Types.ObjectId, ref: "User" }]
})

UserSchema.index({ name: "text", email: "text" })

UserSchema.pre("save", async function(next) {
  var user = this
  if (!user.isModified("password")) return next()

  try {
    let salt = await promisify(bcrypt.genSalt)(10)
    let hash = await promisify(bcrypt.hash)(user.password, salt, null)
    user.password = hash
    return next()
  } catch (error) {
    next(error)
  }
})

UserSchema.methods.gravatar = function(size) {
  if (!size) size = 200
  if (!this.email) return "https://gravatar.com/avatar/?s=" + size + "&d=retro"
  var md5 = crypto
    .createHash("md5")
    .update(this.email)
    .digest("hex")
  return "https://gravatar.com/avatar/" + md5 + "?s=" + size + "&d=retro"
  // this specific picture only belong to this specific email
}

UserSchema.methods.comparedPassword = function(password) {
  return bcrypt.compareSync(password, this.password) // this.password is in database
}

module.exports = mongoose.model("User", UserSchema)
