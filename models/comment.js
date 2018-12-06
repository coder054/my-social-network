const mongoose = require("mongoose")

const Schema = mongoose.Schema

const CommentSchema = new Schema({
	tweetId: {
		type: Schema.Types.ObjectId,
		ref: "Tweet"
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},

	usersLike: [{ type: Schema.Types.ObjectId, ref: "User" }],
	content: String,
	created: {
		type: Date,
		default: Date.now
	}
})

const ModelClass = mongoose.model("Comment", CommentSchema)

module.exports = ModelClass
