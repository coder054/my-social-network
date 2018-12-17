const mongoose = require("mongoose")

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
	sourceUser: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	targetUser: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},

	comment: {
		type: Schema.Types.ObjectId,
		ref: "Comment"
	},
	tweet: {
		type: Schema.Types.ObjectId,
		ref: "Tweet"
	},

	showed: {
		type: Boolean,
		default: false
	},

	created: {
		type: Date,
		default: Date.now
	}
})

const ModelClass = mongoose.model("Notification", NotificationSchema)

module.exports = ModelClass
