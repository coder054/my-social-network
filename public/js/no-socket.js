$(function() {
	$(document).on("click", ".number-of-like-on-tweet", function(e) {
		//current
		$("#open-button").click()
		let self = $(this)
		let tweetId = self.data("idtweet")

		$.ajax({
			type: "GET",
			url: "/usersThatLikeTweet/" + tweetId,
			success: function(data) {
				$(".modal-contenttt-wr .spinner").addClass("hidden")

				console.log("DATAAAAAAA:", data)
				const {
					tweets: { usersLike }
				} = data
				///////////////////////////////////
				let html = `<ul class="usersLike-wr">`

				for (let i = 0; i < usersLike.length; i++) {
					let user = usersLike[i]
					html += `
					<li class="one-user"> 
						<a href="${user._id}"> <img src="${user.photo}"/> </a> 
						<a href="${user._id}"> <span class="usernameeee">${user.name}</span> </a> 
					</li>`
				}

				html += `</ul>`
				///////////////////////////////
				////////////////////////////////////////////
				// 				let html = `
				// <ul class="usersLike-wr">
				// <li class="one-user">
				// 	<a href="#"><img src="https://gravatar.com/avatar/1bc4844b8845410e49361bf89a3c51bf?s=200&amp;d=retro" googl="true"> </a>
				// 	<a href="#"><span class="usernameeee"> anhdt.lrv </span> </a>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// <li class="one-user">
				// 	<img src="https://gravatar.com/avatar/81a9e82b9f3b782cad7dcc1187579274?s=200&amp;d=retro">
				// 	<span class="usernameeee"> Đỗ Tuấn Anh </span>
				// </li>

				// </ul>
				// `
				// ///////////////////////////////

				$(".modal-content-main").append(html)
				$(".modal").addClass("expanded")
				$(".anhdt-modal-header").removeClass("hidden")
			},
			error: function(data) {
				// console.log(data)
			}
		})
	})
})
