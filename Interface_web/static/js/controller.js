
var measures = ["latency", "throughput", "success-rate", "debit"];
var timeLimit = 55; //afficher les valeurs prises durant les 30 dernieres minutes
/*
Remarque: les valeurs des deux timers suivants doivent être égales, sinon ça fausse les valeurs affichées!
*/
var refreshChartsTimeLimit = 1; //récupérer du json les valeurs prises durant la derniere minute
var refreshChartsUpdate = 60000; //60000 ms = 1min, 1000ms = 1sec
var animation = true;

var extraOptions = {
	responsive: true,
	scaleBeginAtZero: false,
	bezierCurve : false,
	bezierCurveTension : 0.2,
    pointDot : true,
    pointDotRadius : 1,
    pointDotStrokeWidth : 1
}

//var labelForDebit = "<%if (label){%><%= label %>- <%}%><%= value + ' bits/sec' %>";
var labelForLatency = "<%= value + ' sec' %>";
var labelForThroughput = "<%= value + ' bits' %>";
var labelForSuccessRate = "<%= value + ' %' %>";
var labelForDebit = "<%= value + ' bits/sec' %>";

//normal case
var normalCase = {
	//fillColor: "rgba(220,220,220,0.2)",
	strokeColor: "rgba(15,187,25,1)",
	pointColor: "rgba(15,187,25,1)",
    pointStrokeColor: "rgba(15,187,25,1)",
    pointHighlightFill: "#fff",
   	pointHighlightStroke: "rgba(151,187,205,1)"
};
//threshold case
var thresholdLine = {
	fillColor: "rgba(151,187,205,0.2)",
	strokeColor: "rgba(224,0,0,1)",
	pointColor: "rgba(255, 0, 0, 0.3)",
	pointStrokeColor: "rgba(255, 0, 0, 0.3)",
	pointHighlightFill: "#fff",
	pointHighlightStroke: "rgba(220,220,220,1)"
};

//exceptional case of latency, different representation
//threshold case
var thresholdLineLatency = {
	fillColor: "rgba(220,220,220,0.2)",
	strokeColor: "rgba(224,0,0,1)",
	pointColor: "rgba(255, 0, 0, 0.3)",
	pointStrokeColor: "rgba(255, 0, 0, 0.3)",
	pointHighlightFill: "#fff",
	pointHighlightStroke: "rgba(220,220,220,1)"
};

//dépassement d'un seuil, ne sert pas pour le moment
var performanceIssuesCase = {
	fillColor: "rgba(220,220,220,0.2)",
    strokeColor: "rgba(220,20,20,1)",
	pointColor: "rgba(220,20,20,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)"
};

var latencyThreshold = 2000; //seuil fixé à 2min, qd latence > 2min, seuil atteint
var throughputThreshold = 100; //si throughput < 10bits, seuil atteint
var succesRateThreshold = 50; // qd success-rate < 50%, seuil atteint
var debitThreshold = 150; //si debit < 10bits/sec, seuil atteint

var optionsNoAnimation = {animation: false};

function compareValueSuperiorToThresold(value, threshold) {
	var pointOptions = {};

	if (value > threshold) {
		for (var o in performanceIssuesCase) {
			pointOptions[o] = performanceIssuesCase[o]; 
		}
	} else {
		for (var o in normalCase) {
			pointOptions[o] = normalCase[o]; 
		}
	}
	return pointOptions;
}

function compareValueInferiorToThresold(value, threshold) {
	var pointOptions = {};

	if (value < threshold) {
		for (var o in performanceIssuesCase) {
			pointOptions[o] = performanceIssuesCase[o]; 
		}
	} else {
		for (var o in normalCase) {
			pointOptions[o] = normalCase[o]; 
		}
	}
	return pointOptions;
}

function getPointOptions(measure, value) {
	var pointOptions = {};

	switch(measure) {
    	case measures[0]:
    		pointOptions = compareValueSuperiorToThresold(value, latencyThreshold);
        	break;

    	case measures[2]:
        	pointOptions = compareValueInferiorToThresold(value, succesRateThreshold);
        	break;
        default:
        	for (var o in normalCase) {
				pointOptions[o] = normalCase[o]; 
			}
    }
    return pointOptions;
}

function getMeasureThreshold(measure) {
	var thresholdValue = 0;
	switch(measure) {
    	case measures[0]:
    		thresholdValue = latencyThreshold;
        	break;
        case measures[1]:
    		thresholdValue = throughputThreshold;
        	break;
    	case measures[2]:
        	thresholdValue = succesRateThreshold;
        	break;
        case measures[3]:
        	thresholdValue = debitThreshold;
        	break;
        default:
        	thresholdValue = 0;
    }
    return thresholdValue;
}

function drawThreshold(measure, xLegendLength) {

	var thresholdData = [];
	var thresholdValue = getMeasureThreshold(measure);

    if (thresholdValue != 0) {
    	console.log("ThresholdValue is not equal to 0");
    	for (var i=0; i<xLegendLength; i++) {
    		thresholdData.push(thresholdValue);
    	}
    }

    return thresholdData;
}

//on va créer des options differentes de tooltip display en fonction du graphe considere
function getChartOptions(measure) {
	var options = {};

	switch(measure) {
		//latency
    	case measures[0]:
    		options["multiTooltipTemplate"] = labelForLatency;
        	break;
        //throughput
    	case measures[1]:
    		options["multiTooltipTemplate"] = labelForThroughput;
        	break;
        //success-rate
    	case measures[2]:
        	options["multiTooltipTemplate"] = labelForSuccessRate;
        	break;
        //debit
    	case measures[3]:
        	options["multiTooltipTemplate"] = labelForDebit;
        	break;
    }

    return options;
}

/*
Fonction qu'on va utiliser dans le cas où on veut un axe des abscisses représenté avec un pas précis 
(t0=0ms, t1=10ms, t2=20ms etc)
*/
function calculateXScale(measure, nbDataFromFile) {
	//va contenir les valeurs en abscisse
	var xScaleLegend = [];
	//va contenir le pas de l'axe des abscisses
	var xStepScale = 0;

	switch(measure) {
    case measures[0]:
        xStepScale = 10;
        break;
    case measures[1]:
        xStepScale = 5;
        break;
    default:
        xStepScale = 2;
	}

	for (var i=0; i<nbDataFromFile; i++) {
		xScaleLegend.push(i*xStepScale);
	}
	return xScaleLegend;
}

function createDataGraph(measure, dataFromFile, animationWanted) {

	//var xLegend = calculateXScale(measure, dataFromFile.length);

	var xLegend = [];
	var values = [];
	var horizontalThreshold = [];
	var options = {};

	var data = {
		labels : [],
		datasets : [{}, {}]
	}

	var canvas = document.getElementById(measure).getContext('2d');

	/*
	Pour chaque point (value, date) on récupère les values dans l'ordre et les temps dans l'ordre pour créer des points
	il faut pour cela que dans le json, les valeurs soient complétées dans un ordre précis: du plus ancien au plus récent
	donc à chaque nouvelle mesure effectuée, il faudra la rajouter en dernière ligne du fichier json qu'on va récup
	*/
	$(jQuery.parseJSON(JSON.stringify(dataFromFile))).each(function() {
		var dateTimeComponents = this.date.split(" ");
        xLegend.push(dateTimeComponents[1]);

        if (measure == measures[0]) {
        	if ("fillColor" in data["datasets"][0]) {
        		console.log("FillColor already exists: %s", data["datasets"][0]["fillColor"]);
        	}
        	if (this.value > getMeasureThreshold(measure)) {
        		//repérer position en abscisse (xLegend) du point
        		console.log("Value superior to threshold");
        		data["datasets"][0]["fillColor"] = "rgba(151,187,205,0.2)";
        	} else {
        		console.log("Value inferior to threshold");
        		data["datasets"][0]["fillColor"] = "rgba(220,220,220,0.2)";
        	}

        } else {
        	data["datasets"][0]["fillColor"] = "rgba(220,220,220,0.2)";
        }
        

        /*var pointOptions = getPointOptions(measure, this.value); //on obtient un {}
        var merge = {data: this.value};
        for (var opt in merge) {
			pointOptions[opt] = merge[opt]; 
		}
        values.push(pointOptions);*/
        //data["datasets"][0].push(pointOptions);


        values.push(this.value);
	});

	horizontalThreshold = drawThreshold(measure, xLegend.length);

	data["labels"] = xLegend;
	data["datasets"][0]["data"] = values;
	data["datasets"][1]["data"] = horizontalThreshold;

	/*var data = {
		labels : xLegend,
		datasets : [{data : values}, {data: horizontalThreshold}]
	}*/

	for (var opt in normalCase) {
		data["datasets"][0][opt] = normalCase[opt]; 
	}
	if (measure == measures[0]) {
		for (var optionalThreshold in thresholdLineLatency) {
			data["datasets"][1][optionalThreshold] = thresholdLineLatency[optionalThreshold]; 
		}
	} else {
		for (var optionalThreshold in thresholdLine) {
			data["datasets"][1][optionalThreshold] = thresholdLine[optionalThreshold]; 
		}
	}

	//chart options
    var tooltipOptions = getChartOptions(measure);
    for (var o in tooltipOptions) {
    	options[o] = tooltipOptions[o]; 
    }

    if (animationWanted == false) {
    	for (var op in optionsNoAnimation) {
    		options[op] = optionsNoAnimation[op]; 
    	}
    }

    for (var extraOpt in extraOptions) {
    		options[extraOpt] = extraOptions[extraOpt]; 
    }

    new Chart(canvas).Line(data, options);

}

/* Function not used for now */
function listeningForThresoldReached() {

	canvas.onclick = function(evt){
    	var activePoints = myLineChart.getPointsAtEvent(evt);
    	// => activePoints is an array of points on the canvas that are at the same position as the click event.
    	for (var activePoint in activePoints) {
    		console.log("Point is active: %s", activePoints[activePoint]);
    	}
	};
}

function createStaticGraph() {
	var latency = document.getElementById('latency').getContext('2d');

	var data = {
		labels : ["January","February","March","April","May","June"],
		datasets : [
			{
				fillColor : "rgba(172,194,132,0.4)",
				strokeColor : "#ACC26D",
				pointColor : "#fff",
				pointStrokeColor : "#9DB86D",
				data : [203,156,99,251,305,247]
			}
		]
	}
	new Chart(latency).Line(data, {
			responsive: true
		});
}

function getDataFromJsonFile(measure, sinceTime, animation) {
	$.ajax({
		url: "./data" + "/" + measure + "/" + sinceTime,
		type: "GET",
		dataType: "json",
		success: function (data) {
			//console.log(data);
			console.log(JSON.stringify(data));
			if (data !== null) {
				createDataGraph(measure, jQuery.parseJSON(JSON.stringify(data)), animation);
			}
		},
		error: function (error) {
    		console.log(JSON.stringify(error));
		}
	});
}

function createGraphs(sinceTime, animation) {
	for (var parameterToTest in measures) {
		getDataFromJsonFile(measures[parameterToTest], sinceTime, animation);
	}
}

function getCurrentDate() {

	var d = new Date();
	document.getElementById("dateOfToday").innerHTML = d.toString('dd-MMM-yyyy');
}

function main(jQuery) {

	createGraphs(timeLimit, animation);
	getCurrentDate();

	setInterval(function() {
		getCurrentDate();
		animation = false;
		createGraphs(timeLimit + refreshChartsTimeLimit, animation);
		refreshChartsTimeLimit += refreshChartsTimeLimit;
	}, refreshChartsUpdate);
}

$(document).ready(main);
