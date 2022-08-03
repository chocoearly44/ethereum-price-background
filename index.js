let token = "token";
let currency = "currency";
let sign = "O";

var chartData = new Array();
var chartLabels = new Array();
let price = 0;

var currencies = {
	usd: "$",
	cad: "CAD",
	eur: "€",
	jpy: "¥",
	gbp: "£",
	inr: "₹"
};

const tokens = {
	ethereum: "./icons/ethereum.svg",
	bitcoin: "./icons/bitcoin.svg",
	dogecoin: "./icons/dogecoin.svg",
	litecoin: "./icons/litecoin.svg",
	polkadot: "./icons/polkadot.svg",
	solana: "./icons/solana.svg",
};

// Setup graph
var ethCanvas = document.getElementById("speedChart");
Chart.defaults.global.defaultFontFamily = "Varela Round";

var priceData = {
	labels: chartLabels,
	datasets: [
		{
			label: "Price",
			data: chartData,
			lineTension: 0,
			fill: false,
			borderColor: "#FFFFFF",
			backgroundColor: "transparent",
			pointBorderColor: "#FFFFFF",
			pointBackgroundColor: "#FFFFFF",
			pointRadius: 0,
			pointHoverRadius: 5,
			pointHitRadius: 5,
			pointBorderWidth: 2,
			pointStyle: "point",
		},
	],
};

var chartOptions = {
	tooltips: {
		callbacks: {
			label: function (tooltipItems, data) {
				return sign + " " + tooltipItems.yLabel.toString();
			},
		},
	},

	legend: {
		display: false,
	},

	scales: {
		xAxes: [
			{
				gridLines: {
					display: true,
					color: "white",
					borderDash: [2, 5],
				},

				ticks: {
					display: true,
					fontColor: "white",
					maxTicksLimit: 7,
					maxRotation: 0,
					minRotation: 0,
				},
			},
		],

		yAxes: [
			{
				gridLines: {
					color: "white",
					borderDash: [2, 5],
				},

				ticks: {
					fontColor: "white",
				},
			},
		],
	},
};

var lineChart = new Chart(ethCanvas, {
	type: "line",
	data: priceData,
	options: chartOptions,
});

// Set properties
window.wallpaperPropertyListener = {
	applyUserProperties: function (properties) {
		// Set token
		if (properties.token) {
			token = properties.token.value;
		}

		// Set currency
		if (properties.currency) {
			currency = properties.currency.value;
			sign = currencies[currency];
		}

		// Set style
		if (properties.style) {
			switch (properties.style.value) {
				case "normal":
					$("#area").css("--bckgColor", "#4e54c8");
					break;

				case "dark":
					$("#area").css("--bckgColor", "#202225");
					break;
			}
		}

		// Update stuff
		updateIcon();
		updateDayGraph();
		updatePrice();
	},
};

// Logic
function formateDate(timestamp) {
	var date = new Date(timestamp);

	var month = date.getMonth() + 1;
	if (month < 10) {
		month = "0" + month;
	}

	return month + "/" + date.getDate() + "/" + date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
}

function updateIcon() {
	$("#icon").attr("src", tokens[token]);
}

function updateDayGraph() {
	while (chartData.length) {
		chartData.pop();
	}

	while (chartLabels.length) {
		chartLabels.pop();
	}

	$.get("https://api.coingecko.com/api/v3/coins/" + token + "/market_chart?vs_currency=" + currency + "&days=1", function (data) {
		var i;
		for (i = 0; i < data.prices.length; i++) {
			var priceToAdd = parseFloat(data.prices[i][1]).toFixed(2);
			var label = data.prices[i][0];

			chartData.push(priceToAdd);
			chartLabels.push(formateDate(label));
		}

		lineChart.update();
	});
}

function updatePrice() {
	$.get("https://api.coingecko.com/api/v3/simple/price?ids=" + token + "&vs_currencies=" + currency, function (data) {
		var jsonObj = $.parseJSON(JSON.stringify(data));
		var obj1 = jsonObj[token];
		var obj2 = $.parseJSON(JSON.stringify(obj1));

		var updPrice = obj2[currency];

		chartData.push(updPrice);
		chartLabels.push(formateDate(Date.now()));
		chartData.splice(0, 1);

		lineChart.update();

		$("#current-price").text(sign + " " + updPrice);

		if (updPrice > price) {
			$("#arrow-sign").removeAttr("class");
			$("#arrow-sign").addClass("fas").addClass("arrow").addClass("green").addClass("fa-arrow-up");
		} else if (updPrice < price) {
			$("#arrow-sign").removeAttr("class");
			$("#arrow-sign").addClass("fas").addClass("arrow").addClass("red").addClass("fa-arrow-down");
		}

		price = updPrice;
	});
}

setInterval(function () {
	updatePrice();
}, 300000);

// First run
updateDayGraph();
