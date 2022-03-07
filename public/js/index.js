const socket = new WebSocket('ws://localhost:3000/socket');

$(document).ready(function () {
	$.get("/latest", function (data) {
		console.log(data);
	});

	window.onkeyup = (e) => {
		let users = Object.keys(USER_DATA);
		if (e.keyCode == 49) {
			console.log($(".userRow.current").data("part"))
			$.post(`/update/${users[0]}/${$(".userRow[data-user='" + users[0] + "'].current").data("part")}`, (data) => {
				console.log(data)
				USER_DATA = data.userData;
				updateStopwatch(users[0], data.userData[users[0]].timerParts);
			});
		}
		if (e.keyCode == 50) {
			$.post(`/update/${users[1]}/${$(".userRow[data-user='" + users[1] + "'].current").data("part")}`, (data) => {
				console.log(data)
				USER_DATA = data.userData;
				updateStopwatch(users[1], data.userData[users[1]].timerParts);
			});
		}
	}

	socket.addEventListener('open', function (event) {
		socket.send('Hello Server!');
	});
	
	// Listen for messages
	socket.addEventListener('message', function (event) {
		console.log('Message from server ', event.data);

		try {
			let data = JSON.parse(event.data);

			if (data.type == "START_TIMER") {
				cancelAnimationFrame(timerRAF);
				USER_DATA = data.data.userData;
				for (var user in USER_DATA) {
					TIMER[user] = { startTime: data.data.startTime, time: [0, 0, 0, 0] };
					$(`[data-user="${user}"][data-part="${USER_DATA[user].timerParts[0].stopName}"]`).addClass("current");
				}

				timerCycle();
			}

			if (data.type == "RESET_TIMER") {
				cancelAnimationFrame(timerRAF);

				USER_DATA = data.data.userData;

				$("#users").empty();

				for (var user in USER_DATA) {
					$("#users").append(createUserOverlay(user));
				}
			}
		}
		catch (e) {

		}
	});
});

function createUserOverlay (user) {
	let rows = $(`<div class="user_rows"></div>`);
	let userInfo = USER_DATA[user];
	let userBlock = $(`<div class="userBlock" data-user="${user}">
		<div class="user_title">${user}</div>
		
	</div>`);
	userInfo.timerParts.forEach(part => {
		let isCurrent = part.startTime !== undefined && part.stopTime === undefined;
		let row = $(`<div class="userRow ${isCurrent ? "current" : ""}" data-user="${user}" data-part="${part.stopName}">
			<div class="userRow_title">${part.stopName}</div>
			<div class="userRow_time"></div>
		</div>`);
		row.toggleClass("current", isCurrent);
		if (part.stopTime && part.startTime) {
			row.addClass("done");
			row.find(".userRow_time").text(getDiff(part.startTime, part.stopTime));
		}
		rows.append(row);
	});

	userBlock.append(rows);

	return userBlock;
}

const TIMER = {
	// "tom": { startTime: Date.now(), lastTime: Date.now(), time: [0, 0, 0, 0] },
	// "bon": { startTime: Date.now(), lastTime: Date.now(), time: [0, 0, 0, 0] },
}

let USER_DATA = {
	// "tom": {
	// 	timerParts: [
	// 		{ stopName: "PART_NAME_1", startTime: Date.now() },
	// 		{ stopName: "PART_NAME_2" },
	// 		{ stopName: "PART_NAME_3" },
	// 		{ stopName: "PART_NAME_4" },
	// 		{ stopName: "PART_NAME_5" }
	// 	]
	// },
	// "bon": {
	// 	timerParts: [
	// 		{ stopName: "PART_NAME_1", startTime: Date.now() },
	// 		{ stopName: "PART_NAME_2" },
	// 		{ stopName: "PART_NAME_3" },
	// 		{ stopName: "PART_NAME_4" },
	// 		{ stopName: "PART_NAME_5" }
	// 	]
	// }
}

function updateStopwatch (user, timerParts) {
	let numberDone = 0;
	let userRows = $(`.userRow[data-user="${user}"`);
	for (var i = 0; i < timerParts.length; i++) {
		if (timerParts[i].startTime && timerParts[i].stopTime) {
			userRows.filter(`[data-part="${timerParts[i].stopName}"]`).addClass("done");
			userRows.filter(`[data-part="${timerParts[i].stopName}"]`).removeClass("current");
			numberDone++;
		}
		else if (timerParts[i].startTime) {
			TIMER[user].startTime = timerParts[i].startTime;
			userRows.filter(`[data-part="${timerParts[i].stopName}"]`).addClass("current");
		}
	}
	if (numberDone === (timerParts.length)) {
		triggerFinalTime(user, USER_DATA[user].timerParts[0].startTime, USER_DATA[user].timerParts[timerParts.length - 1].stopTime);
	}
}

function triggerFinalTime (user, startTime, finalTime) {
	let userBlock = $(`.userBlock[data-user="${user}"]`).find(".user_rows");
	userBlock.append(
		`<div class="userRow final" data-user="${user}">
			<div class="userRow_title">FINAL TIME</div>
			<div class="userRow_time">${getDiff(startTime, finalTime)}</div>
		</div>`
	)
}

function timerCycle() {
	for (var user in TIMER) {
		timerCycleUser(user);
	}
	timerRAF = requestAnimationFrame(timerCycle);
}

function timerCycleUser (user) {
	let timeDiff = new Date(Date.now() - TIMER[user].startTime);
	

	TIMER[user].time[0] = timeDiff.getUTCHours();
	TIMER[user].time[1] = timeDiff.getUTCMinutes();
	TIMER[user].time[2] = timeDiff.getUTCSeconds();
	TIMER[user].time[3] = timeDiff.getUTCMilliseconds();

	$(`#users [data-user=${user}].current`).find(".userRow_time").html(TIMER[user].time.map((item, i) => {
		return item.toString().padStart(i === 3 ? 3 : 2, 0);
	}).join(":"));
}

function getDiff (startTime, stopTime) {
	let timeDiff = new Date(stopTime - startTime);
	let timeArray = [0, 0, 0, 0];
	timeArray[0] = timeDiff.getUTCHours();
	timeArray[1] = timeDiff.getUTCMinutes();
	timeArray[2] = timeDiff.getUTCSeconds();
	timeArray[3] = timeDiff.getUTCMilliseconds();

	return timeArray.map((item, i) => {
		return item.toString().padStart(i === 3 ? 3 : 2, 0);
	}).join(":");
}

let timerRAF;
