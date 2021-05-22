let currency = "dontexist";
let rlcurrency = "dontexist";
let currencysign = "O";

window.wallpaperPropertyListener = {
	applyUserProperties: function(properties) {
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

		if (properties.currency) {
			currency = properties.currency.value;

			setTimeout(function () {
				retreivePrice();
				updateGraph();
				updateIcon();
			}, 2000);
		}
		
		if (properties.rlcurrency) {
			switch(properties.rlcurrency.value) {
				case "usd":
					currencysign = "$";
					break;

				case "cad":
					currencysign = "CAD";
					break;

				case "eur":
					currencysign = "€";
					break;

				case "jpy":
					currencysign = "¥";
					break;

				case "gbp":
					currencysign = "£";
					break;
			}
			
			rlcurrency = properties.rlcurrency.value;

			setTimeout(function () {
				retreivePrice();
				updateGraph();
				updateIcon();
			}, 2000);
		}
	}
}

var chartData = new Array();
var chartLabels = new Array();

var ethCanvas = document.getElementById("speedChart");
Chart.defaults.global.defaultFontFamily = "Varela Round";

var speedData = {
	labels: chartLabels,
	datasets: [{
		label: "Car Speed",
		data: chartData,
		lineTension: 0,
		fill: false,
		borderColor: '#FFFFFF',
		backgroundColor: 'transparent',
		pointBorderColor: '#FFFFFF',
		pointBackgroundColor: '#FFFFFF',
		pointRadius: 0,
		pointHoverRadius: 5,
		pointHitRadius: 5,
		pointBorderWidth: 2,
		pointStyle: 'point'
	}]
};

var chartOptions = {
	tooltips: {
		callbacks: {
			label: function(tooltipItems, data) {
				return currencysign + " " + tooltipItems.yLabel.toString();
			}
		}
	},

	legend: {
		display: false
	},

	scales: {
		xAxes: [{
			gridLines: {
				display: true,
				color: "white",
				borderDash: [2, 5]
			},

			ticks: {
				display: true,
				fontColor: "white",
				maxTicksLimit: 7,
				maxRotation: 0,
				minRotation: 0
			}
		}],

		yAxes: [{
			gridLines: {
				color: "white",
				borderDash: [2, 5]
			},

			ticks: {
				fontColor: "white"
			}
		}]
	}
};

var lineChart = new Chart(ethCanvas, {
	type: 'line',
	data: speedData,
	options: chartOptions
});

function updateIcon() {
	switch (currency) {
		case "ethereum":
			$("#icon").attr("src", "icon/ethereum.svg")
			break;

		case "bitcoin":
			$("#icon").attr("src", "icon/bitcoin.svg")
			break;

		case "dogecoin":
			$("#icon").attr("src", "icon/dogecoin.svg")
			break;

		case "litecoin":
			$("#icon").attr("src", "icon/litecoin.svg")
			break;

		case "polkadot":
			$("#icon").attr("src", "icon/polkadot.svg")
			break;

		case "solana":
			$("#icon").attr("src", "icon/solana.svg")
			break;
	}
}

let price = 0;

function formateDate(timestamp) {
	var date = new Date(timestamp);

	var month = date.getMonth() + 1;
	if (month < 10) {
		month = "0" + month;
	}

	return month + '/' + date.getDate() + '/' + date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
};

function retreivePrice() {
	$.get("https://api.coingecko.com/api/v3/simple/price?ids=" + currency + "&vs_currencies=" + rlcurrency, function(data) {
		var jsonObj = $.parseJSON(JSON.stringify(data));
		var obj1 = jsonObj[currency];
		var obj2 = $.parseJSON(JSON.stringify(obj1));

		var updPrice = obj2[rlcurrency];

		chartData.push(updPrice);
		chartLabels.push(formateDate(Date.now()));
		chartData.splice(0, 1);

		lineChart.update();

		$("#current-price").text(currencysign + " " + updPrice);

		if (updPrice > price) {
			$("#arrow-sign").removeAttr('class');
			$("#arrow-sign").addClass("fas").addClass("arrow").addClass("green").addClass("fa-arrow-up");
		} else if (updPrice == price) {

		} else {
			$("#arrow-sign").removeAttr('class');
			$("#arrow-sign").addClass("fas").addClass("arrow").addClass("red").addClass("fa-arrow-down");
		}

		price = updPrice;
	});
}

function updateGraph() {
	while (chartData.length) {
		chartData.pop();
	}

	while (chartLabels.length) {
		chartLabels.pop();
	}

	$.get("https://api.coingecko.com/api/v3/coins/" + currency + "/market_chart?vs_currency=" + rlcurrency + "&days=1", function(data) {
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

setInterval(function() {
	retreivePrice();
}, 300000);