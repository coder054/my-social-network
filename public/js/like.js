$(function() {
	var socket = io()
	$(document).on("click", ".glyphicon-heart-empty.notlike", function(e) {
		// e.preventDefault();

		var tweetId = $(this).data("idtweet")

		$.ajax({
			type: "POST",
			url: "/liketweet/" + tweetId,
			success: function(data) {
				socket.emit("like-tweet", data)
			},
			error: function(data) {
				console.log(data)
			}
		})
	})

	$(document).on("click", ".glyphicon-heart.liked", function(e) {
		var tweetId = $(this).data("idtweet")

		$.ajax({
			type: "POST",
			url: "/unliketweet/" + tweetId,
			success: function(data) {
				socket.emit("unlike-tweet", data)
			},
			error: function(data) {
				console.log(data)
			}
		})
	})
})
