var projectDataTable = dc.dataTable('#projectDataTable');
var timeline = dc.barChart('#timeline');
var deptChart = dc.rowChart('#barDeptChart');
var statusPie = dc.pieChart('#statusPie');
var projectPie = dc.pieChart('#projectPie');
var datasetCleaned;
d3.csv('data/cleaned.csv', function(data) {
   datasetCleaned = crossfilter(data);
  var all = datasetCleaned.groupAll();

  var dateFormat = d3.time.format("%b-%Y");
  var oldestDate = new Date(2007,1,1);
  var newestDate = new Date(2013,1, 1);

  data.forEach(function(d) {
    dateTemp = dateFormat.parse(d["datestr"]);
    if (dateTemp < oldestDate) {
      oldestDate = dateTemp;
    }
    if (dateTemp > newestDate) {
      newestDate = dateTemp;
    }
    d.dd = dateTemp;
  });

  var expenseType = datasetCleaned.dimension(function(d) {
    return d["Agency Name"];
  });
  var expenseTypeGroup = expenseType.group();

  var digitFormar = d3.format('02d');
  projectDataTable
    .dimension(expenseType)
    .group(function(d) {
      return d["Agency Name"];
    })
    .size(Infinity)
    .columns([
      'Agency Name',
      'Project Name',
      'ProjectStatus',
      'Lifecycle Cost'
    ])
      .sortBy(function (d) { return parseFloat(d["Lifecycle Cost"]); })
      .order(d3.descending);
  update();


  var flexible = datasetCleaned.dimension(function(d) {
    return d["Agency Name"];
  });
  var flexibleGroup = flexible.group();
  deptChart
    .width(480)
    .height(1000)
    .dimension(flexible)
    .group(flexibleGroup)
    .label(function(d) {
      return d.key;
    })
    .title(function(d) {
      return d.value;
    })
    .elasticX(true)
    .ordering(function(d) {
      return -d.value;
    })
    .xAxis().ticks(6);

  var date = datasetCleaned.dimension(function(d) {
    return d.dd;
  });
  var dateGroup = date.group();

  timeline
    .width(500)
    .height(200)
    .dimension(date)
    .group(dateGroup)
    .centerBar(false)
    .elasticX(false)
    .gap(0)
    .xUnits(function() {
      return 50;
    })
    .x(d3.time.scale().domain([oldestDate, newestDate]))
    .renderHorizontalGridLines(true);


  var  statusDimension  = datasetCleaned.dimension(function(d) {return d["ScheduleStatus"];});
  var   statusGroup = statusDimension.group();
  statusPie
      .width(200)
      .height(200)
      .slicesCap(3)
      .innerRadius(30)
      .dimension(statusDimension)
      .group(statusGroup)
      .legend(dc.legend())
      .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
          return dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
      });

    var  projectPieDimension  = datasetCleaned.dimension(function(d) {return d["ProjectStatus"];});
    var   projectGroup = projectPieDimension.group();
    projectPie
        .width(200)
        .height(200)
        .slicesCap(3)
        .innerRadius(30)
        .dimension(projectPieDimension)
        .group(projectGroup)
        .legend(dc.legend())
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            })
        });


  dc.renderAll();

});

var projectsOfset = 0, projectsPerPage = 12;
function display() {
  d3.select('#begin')
      .text(projectsOfset);
  d3.select('#end')
      .text(projectsOfset+projectsPerPage-1);
  d3.select('#last')
      .attr('disabled', projectsOfset-projectsPerPage<0 ? 'true' : null);
  d3.select('#next')
      .attr('disabled', projectsOfset+projectsPerPage>=datasetCleaned.size(Infinity) ? 'true' : null);
  d3.select('#size').text(datasetCleaned.size(Infinity));
}
function update() {
  projectDataTable.beginSlice(projectsOfset);
  projectDataTable.endSlice(projectsOfset+projectsPerPage);
  display();
}
function next() {
  projectsOfset += projectsPerPage;
  update();
  projectDataTable.redraw();
}
function last() {
  projectsOfset -= projectsPerPage;
  update();
  projectDataTable.redraw();
}