(function() {
  'use strict';



  angular
    .module('angularVersion')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, webDevTec, toastr, $scope) {
    var vm = this;

    console.log($scope.items)

      angular.element(document).ready(function () {

        var countyListGet = {
          "data": {
            "Surrey": [
              {
                "username": "2048637",
                "profession": "nurse",
                "customer_group": "tesco"
              },
              {
                "username": "2046351",
                "profession": "pharmacist",
                "customer_group": "asda"
              }
            ],
            "East Sussex": [
              {
                "username": "2046389",
                "profession": "nurse",
                "customer_group": "morrisons"
              },
              {
                "username": "2046383",
                "profession": "pharmacist",
                "customer_group": "asda"
              }
            ]
          }
        }

        var countyListShow = countyListGet.data
        console.log(countyListShow)
        console.log(gBData)


      	// Base path to maps
      	var baseMapPath = "http://code.highcharts.com/mapdata/",
      		showDataLabels = false, // Switch for data labels enabled/disabled
      		mapCount = 0,
      		searchText,
      		mapOptions = '';

          // Populate dropdown menus and turn into jQuery UI widgets
        	$.each(gBData.features, function (mapGroup, maps) {
        		if (mapGroup !== "version") {
        			mapOptions += '<option class="option-header">' + mapGroup + '</option>';
        			$.each(maps, function (desc, path) {
        	            mapOptions += '<option value="' + path + '">' + desc + '</option>';
        	            mapCount++;
        			});
        		}
        	});


      	searchText = 'Choose county';
      	mapOptions = '<option value="countries/gb/gb-all.js">' + searchText + '</option>' + mapOptions;
      	$("#mapDropdown").append(mapOptions).combobox();

      	// Change map when item selected in dropdown
      	$("#mapDropdown").change(function () {
      		var $selectedItem = $("option:selected", this),
      			mapDesc = $selectedItem.text(),
      			mapKey = this.value.slice(0, -3),
      			svgPath = baseMapPath + mapKey + '.svg',
      			geojsonPath = baseMapPath + mapKey + '.geo.json',
      			javascriptPath = baseMapPath + this.value,
      			isHeader = $selectedItem.hasClass('option-header');

            console.log($selectedItem)

      		// Dim or highlight search box
      		if (mapDesc === searchText || isHeader) {
      			$('.custom-combobox-input').removeClass('valid');
      			location.hash = '';
      		} else {
      			$('.custom-combobox-input').addClass('valid');
      			location.hash = mapKey;
      		}

      		if (isHeader) {
      			return false;
      		}

              // Show loading
              if ($("#container").highcharts()) {
              	$("#container").highcharts().showLoading('<i class="fa fa-spinner fa-spin fa-2x"></i>');
              }


              // When the map is loaded or ready from cache...
              function mapReady () {

      			var mapGeoJSON = Highcharts.maps[mapKey],
      				data = [],
      				parent,
      				match;

      			// Update info box download links
      			$("#download").html('<a class="button" target="_blank" href="http://www.highcharts.com/samples/maps-base.php?mapkey=' + mapKey + '">' +
      				'View clean demo</a>' +
      				'<div class="or-view-as">... or view as ' +
      				'<a target="_blank" href="' + svgPath + '">SVG</a>, ' +
      				'<a target="_blank" href="' + geojsonPath + '">GeoJSON</a>, ' +
      				'<a target="_blank" href="' + javascriptPath + '">JavaScript</a>.</div>');

      			// Generate non-random data for the map
      			$.each(mapGeoJSON.features, function (index, feature) {
      				data.push({
      					key: feature.properties['hc-key'],
      					value: index
      				});
      			});

      			// Show arrows the first time a real map is shown
      			if (mapDesc !== searchText) {
      				$('.selector .prev-next').show();
      				$('#sideBox').show();
      			}


      			// Is there a layer above this?
      			if (/^countries\/[a-z]{2}\/[a-z]{2}-all$/.test(mapKey)) { // country
      				parent = {
      					desc: 'World',
      					key: 'custom/world'
      				};
      			} else if (match = mapKey.match(/^(countries\/[a-z]{2}\/[a-z]{2})-[a-z0-9]+-all$/)) { // admin1
      				parent = {
      					desc: $('option[value="' + match[1] + '-all.js"]').text(),
      					key: match[1] + '-all'
      				};
      			}
      			$('#up').html('');
      			if (parent) {
      				$('#up').append(
      					$('<a><i class="fa fa-angle-up"></i> ' + parent.desc + '</a>')
      					.attr({
      						title: parent.key
      					})
      					.click(function () {
      						$('#mapDropdown').val(parent.key + '.js').change();
      					})
      				);
      			}


      			// Instantiate chart
      			$("#container").highcharts('Map', {

      				title: {
      					text: null
      				},

      				mapNavigation: {
      					enabled: true
      				},

      				colorAxis: {
      					min: 0,
      					stops: [
      						[0, '#EFEFFF'],
      						[0.5, Highcharts.getOptions().colors[0]],
      						[1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
      					]
      				},

      				legend: {
      					layout: 'vertical',
      					align: 'left',
      					verticalAlign: 'bottom'
      				},

      				series: [{
      					data: data,
      					mapData: mapGeoJSON,
      					joinBy: ['hc-key', 'key'],
      					name: 'Random data',
      					states: {
      						hover: {
      							color: Highcharts.getOptions().colors[2]
      						}
      					},
      					dataLabels: {
      						enabled: showDataLabels,
      						formatter: function () {
      							return mapKey === 'custom/world' || mapKey === 'countries/us/us-all' ?
      								(this.point.properties && this.point.properties['hc-a2']) :
      								this.point.name;
      						}
      					},
      					point: {
      						events: {
      							// On click, look for a detailed map
      							click: function () {
      								var key = this.key;
      								$('#mapDropdown option').each(function (i) {
      									if (this.value === 'countries/' + key.substr(0, 2) + '/' + key + '-all.js') {
      										$('#mapDropdown').val(this.value).change();
      									}
      								});
      							}
      						}
      					}
      				}, {
      					type: 'mapline',
      					name: "Separators",
      					data: Highcharts.geojson(mapGeoJSON, 'mapline'),
      					nullColor: 'gray',
      					showInLegend: false,
      					enableMouseTracking: true
      				}]
      			});

      			showDataLabels = $("#chkDataLabels").attr('checked');

      		}

      		// Check whether the map is already loaded, else load it and
      		// then show it async
      		if (Highcharts.maps[mapKey]) {
      			mapReady();
      		} else {
      			$.getScript(javascriptPath, mapReady);
      		}
      	});

      	// Toggle data labels - Note: Reloads map with new random data
      	$("#chkDataLabels").change(function () {
      		showDataLabels = $("#chkDataLabels").attr('checked');
      		$("#mapDropdown").change();
      	});

      	// Trigger change event to load map on startup
      	if (location.hash) {
      		$('#mapDropdown').val(location.hash.substr(1) + '.js');
      	} else { // for IE9
      		$($('#mapDropdown option')[0]).attr('selected', 'selected');
      	}
      	$('#mapDropdown').change();

      });
  }
})();
