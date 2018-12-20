const Tweet = require("../models/tweet")
const moment = (momen = require("moment"))

const fetchTweetsByOwners = async (
	tweetId = null,
	owners = null,
	currentUserId,
	next
) => {
	try {
		let tweets
		if (tweetId == null) {
			tweets = await Tweet.find({ owner: owners })
				.sort("-created")
				.populate("owner")
				.populate("usersLike")
				.populate({
					path: "comments",
					// Get friends of friends - populate the 'friends' array for every friend
					populate: { path: "userId" }
				})
				.lean()
				.exec()
		} else {
			tweets = await Tweet.find({ _id: tweetId })
				.sort("-created")
				.populate("owner")
				.populate("usersLike")
				.populate({
					path: "comments",
					// Get friends of friends - populate the 'friends' array for every friend
					populate: { path: "userId" }
				})
				.lean()
				.exec()
		}

		tweets.forEach((val, index) => {
			// console.log(val.comments)
			// console.log("typeof usersLike", typeof val.usersLike)
			val.dateFormated = getdateAndTimeFromDateString(val.created)
			if (typeof val.usersLike === "undefined" || val.usersLike.length === 0) {
				val.noLiked = true
			} else {
				val.noLiked = false
			}

			val.liked = false
			if (typeof val.usersLike === "undefined") {
			} else {
				val.usersLike.forEach(item => {
					if (item._id === currentUserId || item._id.equals(currentUserId)) {
						val.liked = true
					}
				})
			}

			if (
				val.owner._id == currentUserId ||
				val.owner._id.equals(currentUserId)
			) {
				val.isTweetOfCurrentUser = true
			} else {
				val.isTweetOfCurrentUser = false
			}
		})

		return tweets
	} catch (error) {
		next(error)
	}
}

const getdateAndTimeFromDateString = (dateString, isTimeOfComment = false) => {
	if (isTimeOfComment) {
		return moment(dateString).fromNow(true)
	}

	let diffInHour = moment().diff(dateString, "hour")
	let result
	if (diffInHour >= 24) {
		result = moment(dateString).format("D MMMM YYYY [at] H:mm")
	} else {
		result = moment(dateString).fromNow()
	}
	return result
}

function checkLogin(req) {
	if (!req.user._id) {
		res.json({ info: "you need login first" })
	}
}

module.exports.fetchTweetsByOwners = fetchTweetsByOwners
module.exports.checkLogin = checkLogin
module.exports.getdateAndTimeFromDateString = getdateAndTimeFromDateString
