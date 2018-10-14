chart = null;
agechart = null;
votechart = null;

//Election stats
stats = ['Kiesgerechtigden','Opkomst','OpkomstPercentage','OngeldigeStemmen','BlancoStemmen','GeldigeStemmen'];

//All parties
parties = ['D66','CDA','PVV','VVD','SP','PVDA','CUSGP','GL',
    'PVDD','50PLUS','Piratenpartij','Artikel50','AntiEuroPartij',
    'DeGroenen','JEZUSLEEFT','ikkiesvooreerlijk.eu','LDP',
    'AandachtEnEenvoud','IQDeRechtenPlichtenPartij'];

//(TODO: recalculate) Dutch averages to show alongside regional numbers.
nationalparties = {
    'D66': 741797,
    'CDA': 722120,
    'PVV': 633591,
    'VVD': 570810,
    'SP': 458332,
    'PVDA': 446945,
    'CUSGP': 365408,
    'GL': 331196,
    'PVDD': 200494,
    '50PLUS': 175061,
    'Piratenpartij': 40699,
    'Artikel50': 24086,
    'AntiEuroPartij': 12302,
    'DeGroenen': 10885,
    'JEZUSLEEFT': 9517,
    'ikkiesvooreerlijk.eu': 6791,
    'LDP': 6343,
    'AandachtEnEenvoud': 3179,
    'IQDeRechtenPlichtenPartij': 1711
};

agegroups = [
    'Jonger dan 5 jaar', '5 tot 10 jaar', '10 tot 15 jaar', '15 tot 20 jaar',
    '20 tot 25 jaar', '25 tot 45 jaar', '45 tot 65 jaar', '65 tot 80 jaar', '80 jaar of ouder'
];

//TODO: recalculate
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

$(document).ready(function () {
    var csv = document.getElementById('csv').innerHTML;
    var csvdata = parseData(csv);
    var options = createOptions(csvdata);

    chart = Highcharts.mapChart('mapcontainer', options);
});

function clickLocation(e) {
    var data = e.point;

    refreshAgeMap(data);
    refreshVoteMap(data);
    refreshElectionStats(data);

    document.getElementById("stats").scrollIntoView();
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

    for(var agegroup of agegroups) {
        regionaltotal += dataitem[agegroup];
        nationaltotal += nationalages[agegroup];
    }

    regionaltotal /= 100;
    nationaltotal /= 100;

    var series = [
        {
            name: '80 or older',
            data: [dataitem['80 jaar of ouder'] / regionaltotal, nationalages['80 jaar of ouder'] / nationaltotal]
        },
        {
            name: '65 to 80',
            data: [dataitem['65 tot 80 jaar'] / regionaltotal, nationalages['65 tot 80 jaar'] / nationaltotal]
        },
        {
            name: '45 to 65',
            data: [dataitem['45 tot 65 jaar'] / regionaltotal, nationalages['45 tot 65 jaar'] / nationaltotal]
        },
        {
            name: '25 to 45',
            data: [dataitem['25 tot 45 jaar'] / regionaltotal, nationalages['25 tot 45 jaar'] / nationaltotal]
        },
        {
            name: '20 to 25',
            data: [dataitem['20 tot 25 jaar'] / regionaltotal, nationalages['20 tot 25 jaar'] / nationaltotal]
        },
        {
            name: '15 to 20',
            data: [dataitem['15 tot 20 jaar'] / regionaltotal, nationalages['15 tot 20 jaar'] / nationaltotal]
        },
        {
            name: '10 to 15',
            data: [dataitem['10 tot 15 jaar'] / regionaltotal, nationalages['10 tot 15 jaar'] / nationaltotal]
        },
        {
            name: '5 to 10',
            data: [dataitem['5 tot 10 jaar'] / regionaltotal, nationalages['5 tot 10 jaar'] / nationaltotal]
        },
        {
            name: 'Younger than 5',
            data: [dataitem['Jonger dan 5 jaar'] / regionaltotal, nationalages['Jonger dan 5 jaar'] / nationaltotal]
        }
    ];

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
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: series
        });
    } else {
        agechart.update({
            xAxis: {
                categories: [dataitem.name, 'National']
            },
            title: {
                text: 'Age distribution in ' + dataitem.name
            },
            series: series
        });
    }

}

function roundOneDecimal(num) {
    return Math.round(num * 10) / 10
}

function refreshVoteMap(dataitem) {
    data = [];
    nationaldata = [];

    for(var party of parties) {
        data.push({
           name: party,
           y: dataitem[party]
        });

        nationaldata.push({
            name: party,
            y: nationalparties[party]
        });
    }

    var series = [{
        name: 'Parties',
        colorByPoint: true,
        data: data
    }];

    var nationalseries = [{
        name: 'Parties National',
        colorByPoint: true,
        data: data
    }];

    if (votechart === null) {
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
            series: series
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
            series: nationalseries
        });
    } else {
        votechart.update({
            title: {
                text: 'Votes in ' + dataitem.name
            },
            series: series
        });
    }

}

// Function to create the options
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
            type: 'logarithmic',
            minColor: '#EEEEFF',
            maxColor: '#703a92',
            /*stops: [
                [0, '#EFEFFF'],
                [0.67, '#4444FF'],
                [1, '#000022']
            ]*/
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
