$(function() {
	$(document).on("click", ".glyphicon-heart-empty.notlike", function(e) {
		// e.preventDefault();

		let self = $(this)
		var tweetId = $(this).data("idtweet")
		$.ajax({
			type: "POST",
			url: "/liketweet/" + tweetId,
			success: function(data) {
				self.removeClass("notlike")
				self.removeClass("glyphicon-heart-empty")
				self.addClass("glyphicon-heart")
				self.addClass("liked")
			},
			error: function(data) {
				console.log(data)
			}
		})
	})

	$(document).on("click", ".glyphicon-heart.liked", function(e) {
		let self = $(this)
		// e.preventDefault();

		var tweetId = $(this).data("idtweet")
		$.ajax({
			type: "POST",
			url: "/unliketweet/" + tweetId,
			success: function(data) {
				self.removeClass("glyphicon-heart")
				self.removeClass("liked")
				self.addClass("notlike")
				self.addClass("glyphicon-heart-empty")
			},
			error: function(data) {
				console.log(data)
			}
		})
	})
})
