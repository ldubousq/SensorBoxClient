var dt;
var charts = new Object(); //Set of charts
var chartOpts = new Object(); //Set of chart options
var refmSec = 1000; //Refresh interval in ms
var ids = ['force', 'gasPressure', 'humidity', 'light', 'sound',
  'temperature', 'vibration', 'motion'
];
var warm = { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red', 5: 'black' };
var hostname = 'http://129.88.49.247:8080';

/*var hostname = 'http://129.88.48.13:8080';
 */
/*var hostname = 'http://localhost:8080';
 */
$(function() {
  // Load the Visualization API library and add package name.
  google.charts.load('visualization', '1.0', { 'packages': ['corechart', 'gauge'] });
  google.charts.setOnLoadCallback(initialize);


  $('#input-refresh-rate').on('change', function(e) {
    setRefreshRate(this.value);
  });

  $('input[name="warm"]').on('change', function(e) {
    /*    console.log(this.value);
     */
    fanWarm(this.value);
  });

  $('input[name="power"]').on('change', function(e) {
    /*    console.log(this.value);
     */
    fanPower(this.value);
  });
});

// Prepare charts and call getValue()
function initialize() {
  //Prepare a gauge chart for light sensor
  charts['light'] = new google.visualization.Gauge(document.getElementById('light'));
  chartOpts['light'] = {
    'min': 0,
    'max': 1000,
    'yellowFrom': 600,
    'yellowTo': 800,
    'redFrom': 800,
    'redTo': 1000,
    'minorTicks': 20,
    'width': 200,
    'height': 200
  };

  //Prepare a column chart for sound sensor
  charts['sound'] = new google.visualization.ColumnChart(
    document.getElementById('sound'));
  chartOpts['sound'] = {
    'min': 0,
    'max': 70,
    'width': 250,
    'height': 250,
    'legend': { position: 'none' }
  };

  //Prepare a column chart for temperature sensor
  charts['temperature'] = new google.visualization.ColumnChart(
    document.getElementById('temperature'));
  chartOpts['temperature'] = {
    'min': 0,
    'max': 40,
    'width': 250,
    'height': 250,
    'legend': { position: 'none' }
  };
  //Prepare a column chart for humidity sensor
  charts['humidity'] = new google.visualization.ColumnChart(
    document.getElementById('humidity'));
  chartOpts['humidity'] = {
    'min': 0,
    'max': 100,
    'width': 250,
    'height': 250,
    'legend': { position: 'none' }
  };

  //Prepare a column chart for gas pressure sensor
  charts['gasPressure'] = new google.visualization.ColumnChart(
    document.getElementById('gasPressure'));
  chartOpts['gasPressure'] = {
    'min': 80,
    'max': 130,
    'width': 250,
    'height': 250,
    'legend': { position: 'none' }
  };

  //Prepare a column chart for motion sensor
  charts['motion'] = new google.visualization.ColumnChart(
    document.getElementById('motion'));
  chartOpts['motion'] = {
    'min': 0,
    'max': 2,
    'width': 250,
    'height': 250,
    'legend': { position: 'none' }
  };

  //Prepare a presence chart for motion sensor
  charts['presence'] = new google.visualization.ColumnChart(
    document.getElementById('presence'));
  chartOpts['presence'] = {
    'min': 0,
    'max': 100,
    'width': 250,
    'height': 250,
    'legend': { position: 'none' }
  };

  setRefreshRate(1000);
  getValue();
}

//Obtain sensor values by REST. Call updateValues() when succeeded.
function getValue() {
  //------------  Get values from sensors and update graphs ----------//
  var sboxAddr = hostname + '/axis2/services/' + 'SensorBoxService/getAllValues'; // REST API endpoint
  jQuery.ajax({
    url: sboxAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(data, jqXHR) {
      if (data == 'null') {
        console.log('No data retrieved.');
      } else {
        var date = new Date();
        $('#now').text(date.toLocaleString());
        updateValues(data);
      }
    },
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });

  //------------  Get status from windows and update status ----------//
  var windowAddr = hostname + '/axis2/services/' + 'D316WindowService/getAllStatus'
  jQuery.ajax({
    url: windowAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(data2, jqXHR) {
      if (data2 == 'null') {
        console.log('No data retrieved.');
      } else {
        updateWindowStatus(data2);
      }
    },
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });

  //------------  Get status from the fan and update the status ----------//
  var fanAddr = hostname + '/axis2/services/' + 'D316FanService/getStatus'
  jQuery.ajax({
    url: fanAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(data3, jqXHR) {
      if (data3 == 'null') {
        console.log('No data retrieved.');
      } else {
        updateFanStatus(data3);
      }
    },
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });

  //------------  Get status from the presence sensor and update the status ----------//
  var presenceAddr = hostname + '/axis2/services/' + 'PresenceSensorService/getLikelihood'
  jQuery.ajax({
    url: presenceAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(ps, jqXHR) {
      if (ps == 'null') {
        console.log('No data retrieved.');
      } else {
        var keyValue = new Object(); // map {id:value} of sensor values
        var value = $(ps).find('return').text();
        var id = 'presence';
        keyValue[id] = value;
        drawGraphs(keyValue); //Redraw graphs based on the map
      }
    },
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });

  setTimeout('getValue()', refmSec);
}

function fanWarm(warm) {
  if (warm > 0 && warm < 5) {
    /*    console.log(warm);
     */
    var fanAddr = hostname + '/axis2/services/' + 'D316FanService/' + warm;
    /*    jQuery.ajax({
          url: fanAddr,
          type: 'GET',
          dataType: 'xml',
          cache: false,
          success: function(data3, jqXHR) {
          },
          error: function(textStatus) {
            console.log ('Could not connect the API.');
          }
        });*/
  }
}

function fanPower(power) {
  var cmd = 'off';
  if (power > 0 && power < 3) {
    cmd = 'on';
  }
  var fanAddr = hostname + '/axis2/services/' + 'D316FanService/' + cmd;
  jQuery.ajax({
    url: fanAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(data3, jqXHR) {},
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });
}

function updateFanStatus(xml) {
  var isPowerOn = $(xml).find('power').text();
  /*  console.log(isPowerOn);
   */
  if (isPowerOn === 'true') {
    $('input[name="power-switch"]').attr('checked', 'checked');
  } else {
    $('input[name="power-switch"]').attr('checked', false);
  }
}

function openWindow(num) {
  var windowAddr = hostname + '/axis2/services/' + 'D316WindowService/open?num=' + num;
  jQuery.ajax({
    url: windowAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(data2, jqXHR) {},
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });
}

function closeWindow(num) {
  var windowAddr = hostname + '/axis2/services/' + 'D316WindowService/close?num=' + num;
  jQuery.ajax({
    url: windowAddr,
    type: 'GET',
    dataType: 'xml',
    cache: false,
    success: function(data2, jqXHR) {},
    error: function(textStatus) {
      console.log('Could not connect the API.');
    }
  });
}

function updateWindowStatus(xml) {
  var states = [];
  $(xml).find('return').each(function() {
    var state = $(this).find('state').text();
    states.push(state);
  });

  var src = '';
  for (var i = 0; i < states.length; i++) {
    var bgcolor = (states[i] == 'close') ? '#dddddd' : 'skyblue';
    src = src +
      '<div  style="width:120px; border-style: solid; ' +
      'background-color:' + bgcolor + ';' +
      'margin: auto; top:0; bottom:0; left:0; right:0;' +
      'border-color: #dddddd; font-size: 80%;">' + 'window' + i + '<br>' + states[i] + '<br>' + '<input type="button" value="open" onclick="openWindow(' + i + ')">' + '<input type="button" value="close" onclick="closeWindow(' + i + ')">' + '</div>'
  }

  $('#windows').html(src);

}

//Update the current sensor values for the charts
function updateValues(xml) {
  var keyValue = new Object(); // map {id:value} of sensor values

  $(xml).find('return').each(function() {
    var id = $(this).find('id').text();
    var value = $(this).find('value').text();
    keyValue[id] = value;
  });

  drawGraphs(keyValue); //Redraw graphs based on the map
  updateDiscomfortIndex(keyValue);
  updateDiscomfortIndex2(keyValue);

}

//Draw graphs for given values of sensors
function drawGraphs(keyValue) {
  for (var k in keyValue) {
    var data = new Array();
    switch (k) {
      case 'light':
        data[0] = ['lux'];
        data[1] = [parseInt(keyValue[k])];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'sound':
        data[0] = ['', 'db', { role: 'annotation' }];
        data[1] = ['Sound Volume', parseFloat(keyValue[k]), Math.round(parseFloat(keyValue[k]) * 100) / 100 + ' db'];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'temperature':
        data[0] = ['', 'C', { role: 'annotation' }, { role: 'style' }];
        data[1] = ['Temperature', parseFloat(keyValue[k]), Math.round(parseFloat(keyValue[k]) * 100) / 100 + ' C', 'color: orange'];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'humidity':
        data[0] = ['', 'C', { role: 'annotation' }, { role: 'style' }];
        data[1] = ['Humidity', parseFloat(keyValue[k]), Math.round(parseFloat(keyValue[k]) * 100) / 100 + ' %', 'color: cyan'];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'gasPressure':
        data[0] = ['', 'kPa', { role: 'annotation' }, { role: 'style' }];
        data[1] = ['Gas Pressure', parseFloat(keyValue[k]), Math.round(parseFloat(keyValue[k]) * 100) / 100 + ' kPa', 'color: green'];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'presence':
        data[0] = ['', '', { role: 'annotation' }, { role: 'style' }];
        data[1] = ['Presence', parseInt(keyValue[k]), parseInt(keyValue[k]) + ' %', 'color: violet'];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'motion':
        data[0] = ['', 'kPa', { role: 'annotation' }, { role: 'style' }];
        var isMoved = (keyValue[k] == 'true') ? 2 : 1;

        data[1] = ['Motion', parseFloat(isMoved), keyValue[k], 'color: purple'];
        dt = google.visualization.arrayToDataTable(data);
        charts[k].draw(dt, chartOpts[k]);
        break;
      case 'door_sensor_port_0':
        var y = $('.door_sensor_port_0 .thumb');
        var x = y.attr('class');
        if (keyValue[k] === 'true') {
          y.removeClass('thumbOpened');
        } else {
          $('.door_sensor_port_0 .thumb').removeClass('thumbOpened');
          y.addClass('thumbOpened');
        }
        break;
      case 'door_sensor_port_7':
        var y = $('.door_sensor_port_7 .thumb');
        var x = y.attr('class');
        if (keyValue[k] === 'true') {
          y.removeClass('thumbOpened');
        } else {
          $('.door_sensor_port_7 .thumb').removeClass('thumbOpened');
          y.addClass('thumbOpened');
        }
        break;
      default:
        console.log(k + '=' + keyValue[k]);
    }
  }
}

//Calculate and update the discomfort index
function updateDiscomfortIndex(keyValue) {
  var T = parseFloat(keyValue['temperature']);
  var H = parseFloat(keyValue['humidity']);
  var DI = T - 0.55 * (1 - 0.01 * H) * (T - 14.5);
  DI = Math.round(DI * 100) / 100;


  var msg, color;

  if (DI <= 21) {
    color = 'skyblue';
    msg = 'Comfortable';
  } else if (DI <= 24) {
    color = 'aliceblue';
    msg = 'It\'s OK';
  } else if (DI <= 27) {
    color = 'yellow';
    msg = 'A bit discomfort';
  } else if (DI <= 29) {
    color = 'gold';
    msg = 'Discomfort';
  } else if (DI <= 32) {
    color = 'darkorange';
    msg = 'Warning. Very discomfort';
  } else {
    color = 'red';
    msg = 'Severe. Call emergency';
  }

  //Dirty code... I should define the style in another section
  var src = '<div style="height:250px;position: relative;">' + '<div style="position:absolute;' +
    'margin: auto; top:0; bottom:0; left:0; right:0;' +
    'width:120px; height:120px;font-size: 80%;' +
    'background-color:' + color + ';' +
    '"><br>' + DI + '<br><br>' + msg + '</div>' + '</div>';

  $('#DI').html(src);

  return DI;
}

//Calculate and update the discomfort index (Japanese Index)
function updateDiscomfortIndex2(keyValue) {
  var T = parseFloat(keyValue['temperature']);
  var H = parseFloat(keyValue['humidity']);
  var DI = 0.81 * T + 0.01 * H * (0.99 * T - 14.3) + 46.3;
  DI = Math.round(DI * 100) / 100;


  var msg, color;

  if (DI <= 55) {
    color = 'blueviolet';
    msg = 'Cold';
  } else if (DI <= 60) {
    color = 'skyblue';
    msg = 'A bit cold';
  } else if (DI <= 65) {
    color = 'aliceblue';
    msg = 'It\'s OK';
  } else if (DI <= 70) {
    color = 'palegreen';
    msg = 'Comfortable';
  } else if (DI <= 75) {
    color = 'honeydew';
    msg = 'Not hot';
  } else if (DI <= 80) {
    color = 'yellow';
    msg = 'A bit hot';
  } else if (DI <= 85) {
    color = 'gold';
    msg = 'Hot';
  } else {
    color = 'red';
    msg = 'Very hot. Call emergency';
  }

  //Dirty code... I should define the style in another section
  var src = '<div style="height:250px;position: relative;">' + '<div style="position:absolute;' +
    'margin: auto; top:0; bottom:0; left:0; right:0;' +
    'width:120px; height:120px; font-size: 80%;' +
    'background-color:' + color + ';' +
    '"><br>' + DI + '<br><br>' + msg + '</div>' + '</div>';

  $('#DI2').html(src);

  return DI;
}



//Change the refresh rate
function setRefreshRate(newValue) {
  refmSec = newValue;
  $('#refRate').text(newValue);
}
