const mongoose = require("mongoose")

const Schema = mongoose.Schema

const NotificationStateSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},

	new_notification: {
		type: Boolean,
		default: true
	}
})

const ModelClass = mongoose.model("NotificationState", NotificationStateSchema)

module.exports = ModelClass
