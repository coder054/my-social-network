$(function() {
	var socket = io()
	$(document).on("keydown", ".comment-content", function(event) {
		// e.preventDefault();
		if (event.which === 13 && !event.shiftKey) {
			let self = $(this)
			let tweetId = self.data("idtweet")
			let content = self.val()

			socket.emit("comment", { content, tweetId })
			self.val("")
			return false
		}
	})
})
