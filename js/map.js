//Variables to store the charts
mapchart = null;
agechart = null;
votechart = null;
regionsList = null;

//CSV column names of election stats
stats = ['Kiesgerechtigden','Opkomst','OpkomstPercentage','OngeldigeStemmen','BlancoStemmen','GeldigeStemmen'];

//CSV column names of the political parties
parties = ['D66','CDA','PVV','VVD','SP','PVDA','CUSGP','GL',
    'PVDD','50PLUS','Piratenpartij','Artikel50','AntiEuroPartij',
    'DeGroenen','JEZUSLEEFT','ikkiesvooreerlijk.eu','LDP',
    'AandachtEnEenvoud','IQDeRechtenPlichtenPartij'];

//Total (national) number of votes to show alongside regional numbers.
nationalparties = {
    'D66': 734273,
    'CDA': 720568,
    'PVV': 633591,
    'VVD': 570089,
    'SP': 457245,
    'PVDA': 446111,
    'CUSGP': 364756,
    'GL': 331109,
    'PVDD': 200009,
    '50PLUS': 174816,
    'Piratenpartij': 40172,
    'Artikel50': 24042,
    'AntiEuroPartij': 12275,
    'DeGroenen': 10870,
    'JEZUSLEEFT': 9504,
    'ikkiesvooreerlijk.eu': 6788,
    'LDP': 6335,
    'AandachtEnEenvoud': 3165,
    'IQDeRechtenPlichtenPartij': 1702
};

// Objects for each age group.
// column = CSV column name of the age group
// name = the label that appears on the chart
agegroups = [
    {
        name: 'Younger than 5',
        column: 'Jonger dan 5 jaar'
    },
    {
        name: '5-10',
        column: '5 tot 10 jaar'
    },
    {
        name: '10-15',
        column: '10 tot 15 jaar'
    },
    {
        name: '15-20',
        column: '15 tot 20 jaar'
    },
    {
        name: '20-25',
        column: '20 tot 25 jaar'
    },
    {
        name: '25-45',
        column: '25 tot 45 jaar'
    },
    {
        name: '45-65',
        column: '45 tot 65 jaar'
    },
    {
        name: '65-80',
        column: '65 tot 80 jaar'
    },
    {
        name: '80 or older',
        column: '80 jaar of ouder'
    },
];

//Total (national) numbers in age groups to show alongside regional numbers.
nationalages = {
    'Jonger dan 5 jaar': 855834,
    '5 tot 10 jaar': 910964,
    '10 tot 15 jaar': 960326,
    '15 tot 20 jaar': 1014556,
    '20 tot 25 jaar': 1049590,
    '25 tot 45 jaar': 4141842,
    '45 tot 65 jaar': 4725595,
    '65 tot 80 jaar': 2345108,
    '80 jaar of ouder': 748111
};

//This part is run automatically when page is loaded
$(document).ready(function () {
    //Read CSV data
    var csv = document.getElementById('csv').innerHTML;

    //Parse the raw data
    var csvdata = parseData(csv);

    //Add a column called 'voltage' which gives each region a score based on how much it is related to Volt
    csvdata = addVoltage(csvdata);

    //Get the options for creating the map chart based on the csv data
    var options = createOptions(csvdata);
    //Create the map chart
    mapchart = Highcharts.mapChart('mapcontainer', options);
});

/**
 * Click handler that is triggered when a region is clicked.
 * @param e
 */
function clickLocation(e) {
    //Get the data of the clicked region
    var data = e.point;

    //Refresh all charts to display data of the clicked region
    refreshAgeMap(data);
    refreshVoteMap(data);
    refreshElectionStats(data);

    //Scroll down to display charts
    document.getElementById("stats").scrollIntoView();
}

function addVoltage(data) {

    //Compute total number of people and votes per region
    for (var i = 0; i < data.length; i++) {
        data[i]['totalages'] = 0;
        data[i]['totalvotes'] = 0;

        for(var agegroup of agegroups) {
            if(data[i][agegroup.column] === undefined || data[i][agegroup.column] === '') {
                continue;
            }
            data[i]['totalages'] += data[i][agegroup.column];
        }
        for(var party of parties) {
            if(data[i][party] === undefined) {
                continue;
            }

            data[i]['totalvotes'] += data[i][party];
        }
    }

    //Compute the Voltage of each region
    for (var j = 0; j < data.length; j++) {
        var voteScore = (data[j]['D66'] + data[j]['GL']) / data[j]['totalvotes'];
        var ageScore = (data[j]['15 tot 20 jaar'] + data[j]['20 tot 25 jaar']) / data[j]['totalages'];


        data[j]['value'] = roundOneDecimal(voteScore * 70 + ageScore * 30);

        if(data[j]['name'] === 'Veghel') {
            console.log(voteScore);
            console.log(ageScore);
            console.log(data[j]['value']);
        }
    }

    return data;
}

function refreshElectionStats(dataitem) {
    var statstext = "<p><b>Election statistics for " + dataitem.name + "</b><br/>";
    statstext += "Total voters: " + dataitem['Kiesgerechtigden'] + "<br/>";
    statstext += "Turnout: " + dataitem['OpkomstPercentage'] + '% (' + dataitem['Opkomst'] + " votes)<br/><br/>";
    statstext += "Valid votes: " + dataitem['GeldigeStemmen'] + "<br/>";
    statstext += "Invalid votes: " + dataitem['OngeldigeStemmen'] + "<br/>";
    statstext += "Blank votes: " + dataitem['BlancoStemmen'] + "<br/>";

    document.getElementById("statscontainer").innerHTML = statstext;
}

function refreshAgeMap(dataitem) {
    var regionaltotal = 0;
    var nationaltotal = 0;

    //Calculate total number of votes and people
    for(var agegroup of agegroups) {
        regionaltotal += dataitem[agegroup.column];
        nationaltotal += nationalages[agegroup.column];
    }

    //(Computation trick) Divide by 100 so that you do not have to multiply by a 100 every time
    regionaltotal /= 100;
    nationaltotal /= 100;

    //Create the series by calculating the regional age percentages for the selected region
    var regionalseries = [];
    for(var agegroup of agegroups) {
        regionalseries.push({
            name: agegroup.name,
            data: [dataitem[agegroup.column] / regionaltotal, nationalages[agegroup.column] / nationaltotal]
        });
    }

    //If the chart is created for the first time
    if (agechart === null) {
        agechart = Highcharts.chart('agecontainer', {
            chart: {
                type: 'bar'
            },
            tooltip: {
                formatter: function() {
                    return this.x + ': ' + roundOneDecimal(this.y) + '% are '+ this.series.name;
                }
            },
            title: {
                text: 'Age distribution in ' + dataitem.name
            },
            xAxis: {
                categories: [dataitem.name, 'National']

            },
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: 'Number of people'
                },
                reversed: true
            },
            legend: {
                reversed: false
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: regionalseries
        });
    }
    //Else if the chart is refreshed
    else {
        agechart.update({
            xAxis: {
                categories: [dataitem.name, 'National']
            },
            title: {
                text: 'Age distribution in ' + dataitem.name
            },
            series: regionalseries
        });
    }

}

function refreshVoteMap(dataitem) {
    var regionaldata = [];

    for(var party of parties) {
        regionaldata.push({
           name: party,
           y: dataitem[party]
        });
    }

    var regionalseries = [{
        name: 'Parties Regional',
        colorByPoint: true,
        data: regionaldata
    }];

    //If the chart is created for the first time
    if (votechart === null) {
        var nationaldata = [];

        for(var party of parties) {
            nationaldata.push({
                name: party,
                y: nationalparties[party]
            });
        }

        var nationalseries = [{
            name: 'Parties National',
            colorByPoint: true,
            data: nationaldata
        }];

        votechart = Highcharts.chart('votecontainer', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Votes in ' + dataitem.name
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: regionalseries
        });

        Highcharts.chart('nationalvotecontainer', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Votes National'
            },
            tooltip: {
                pointFormat: '{nationalseries.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: nationalseries
        });
    }
    //Else if the chart is refreshed
    else {
        votechart.update({
            title: {
                text: 'Votes in ' + dataitem.name
            },
            series: regionalseries
        });
    }

}

/**
 * Create the options to be used for creating the map chart.
 * @param csvdata
 * @returns {{chart: {map: string}, title: {text: string}, subtitle: {text: string}, mapNavigation: {enabled: boolean, buttonOptions: {verticalAlign: string}}, colorAxis: {min: number, type: string, minColor: string, maxColor: string}, plotOptions: {series: {events: {click: plotOptions.series.events.click}}}, series: *[]}}
 */
function createOptions(csvdata) {

    return {
        chart: {
            map: 'countries/nl/nl-all-all'
        },

        title: {
            text: 'Map of the Netherlands'
        },

        subtitle: {
            text: 'Source map: <a href="http://code.highcharts.com/mapdata/countries/nl/nl-all-all.js">The Netherlands, admin2</a>'
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },

        colorAxis: {
            min: 1,
            type: 'linear',
            minColor: '#EEEEFF',
            maxColor: '#703a92',
        },

        plotOptions: {
            series: {
                events: {
                    click: function (e) {
                        clickLocation(e);
                    }
                }
            }
        },

        series: [{
            data: csvdata,
            name: 'Research data',
            color: '#703a92',
            joinBy: ['name', 'name'],
            states: {
                hover: {
                    color: '#FFFFFF'
                }
            },
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            },
            tooltip: {
                pointFormat: '{point.name}:'
            }
        }]
    };
}

/**
 * Parse CSV data to be used in the application
 * @param csv
 * @returns {*}
 */
function parseData(csv) {
    var data = Papa.parse(csv, {
        download: false,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            return results;
        }
    });

    return data.data;
}

//Round by one decimal for cleaner formatting.
function roundOneDecimal(num) {
    return Math.round(num * 10) / 10
}
