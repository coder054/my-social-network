const mongoose = require("mongoose")

const Schema = mongoose.Schema

const TweetSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	usersLike: [{ type: Schema.Types.ObjectId, ref: "User" }],
	comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
	content: String,
	created: {
		type: Date,
		default: Date.now
	}
})

const ModelClass = mongoose.model("Tweet", TweetSchema)

module.exports = ModelClass
