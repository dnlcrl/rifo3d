var ge;

var app = {};

//this timer is used when toggling layers after a map style change
app.styleTimer = null;

styles = {
	'satellite': "mapbox://styles/dnlcrl/ciy5oqecp00472sqitnohq0rw",
	'hybrid': "mapbox://styles/dnlcrl/ciy1cvzzp00c32sqkqt2uebg1",
	'outdoors': "mapbox://styles/dnlcrl/ciya6ykcx006x2sqea5852xc2",
	'light': "mapbox://styles/dnlcrl/ciy5r55xv004r2slsthz09mh7",
	'dark': "mapbox://styles/dnlcrl/ciy5rbyyh004i2sofxd7ka19s",
}

styleToLabelLayer = {
	'hybrid': 'waterway-label',
	'satellite': 'designatori',
	'light': 'water',
	'dark': 'waterway-label',
	'outdoors': 'poi-outdoor-features',

}

app.currentStyle = 'satellite';
app.stylechanged = undefined;
app.center = [9.95528, 45.64553388];
document.getElementById(app.currentStyle).checked = "checked";



Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

centers = {'sondrio': [ 9.878767, 46.169858 ],
			'lodi': [ 9.5037159, 45.3097228 ] ,
			'cremona':[ 10.022651, 45.133249 ], 
			'milano':[ 9.185924, 45.465422 ],
			'mantova': [ 10.791375, 45.156417 ], 
			'bergamo':[ 9.67727, 45.698264 ],
			'lecco':[ 9.39767, 45.85657 ] ,
			'pavia':[ 9.158207, 45.184725 ] ,
			'monza':[ 9.274449, 45.5845 ] ,
			'brescia':[ 10.211802, 45.541553 ],
			'como':[ 9.085176, 45.80806 ] ,
			'varese': [ 8.825058, 45.820599 ] };


app.currentGeojsonObjects = { 
};
    
//var ge_strade = false;
//var ge_abitati = true;

// google.load("earth", "1");
var bounds = [
    [8.55666,44.738], // Southwest coordinates
    [11.3539,46.5386]  // Northeast coordinates
];

function init() {
	mapboxgl.accessToken = 'pk.eyJ1IjoiZG5sY3JsIiwiYSI6ImNpc3ZpeXpuYzAwMGcydG1uZnYwcjF6a20ifQ.haWicjVXwzcXqRMj3kdYMg';
	var map = new mapboxgl.Map({
		// attributionControl: false,
	    container: 'map3d', // container id
	    style:  styles [app.currentStyle], //stylesheet location
	    center:  app.center, //[9.856441382762, 45.10320555826568], // starting position
	    zoom: 8, //9 // starting zoom
	    pitch: 60,
    	maxBounds: bounds // Sets bounds as max

    });
    setTimeout(function() {
      document.getElementById("coordinate").innerHTML = "9.68963, 45.70565";
    }, 10);


    app.map = map;
    map.on('mousemove', function (e) {
	    setTimeout(function() {
	      // alert(text);
	      var text = e.lngLat['lat'].toFixedDown(5) + ", " + e.lngLat['lng'].toFixedDown(5);

	      var divcoordinate = document.getElementById("coordinate");
	      divcoordinate.innerHTML = text;
	    }, 10);
	});

	// map.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
	// document.getElementsByClassName('mapboxgl-ctrl-attrib')[0].innerHTML = '<a href="https://github.com/dnlcrl" target="_blank">© dnlcrl</a> ' + document.getElementsByClassName('mapboxgl-ctrl-attrib')[0].innerHTML

   	

	// When a click event occurs near a place, open a popup at the location of
	// the feature, with description HTML from its properties.
	app.map.on('click', function (e) {
	    if(app.popup){
	        app.popup._closeButton.click()
	    }
	    var features = map.queryRenderedFeatures(e.point, { layers: Object.keys( app.currentGeojsonObjects )});

	    if (!features.length) {
	        return;
	    }

	    feature = undefined;
	    for (var i = features.length - 1; i >= 0; i--) {
	    	if (features[i].properties.description !== undefined){
	    		feature = features[i];
	    		break;
	    	}
	    }

	    // var feature = features[features.length - 1];

	    // Populate the popup and set its coordinates
	    // based on the feature found.
	    app.popup = new mapboxgl.Popup()
	        .setLngLat(e.lngLat)
	        .setHTML('<div class="popup-title"><center><h4>' + feature.properties.name+ '</h4></ center></div><div>' + feature.properties.description + '</div>')
	        .addTo(map);
	});

	// Use the same approach as above to indicate that the symbols are clickable
	// by changing the cursor style to 'pointer'.
	app.map.on('mousemove', function (e) {
	    var features = map.queryRenderedFeatures(e.point, { layers: Object.keys(app.currentGeojsonObjects) });
	    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

	});

	// map.on('load', function() {
	// 	loadEdifici();
	// });

	map.on("render", function() {
	  if(map.loaded()) {
	    stopspinner();
	  }
	});

	map.on("dataloading", function(){
		startspinner();
	});

	map.addControl(new mapboxgl.NavigationControl());

	
}

function startspinner(){
	if (app.spinner) {return}
	var opts = {
	 lines: 13 // The number of lines to draw
	, length: 28 // The length of each line
	, width: 14 // The line thickness
	, radius: 42 // The radius of the inner circle
	, scale: 0.15 // Scales overall size of the spinner
	, corners: 1 // Corner roundness (0..1)
	, color: '#000' // #rgb or #rrggbb or array of colors
	, opacity: 0.25 // Opacity of the lines
	, rotate: 0 // The rotation offset
	, direction: 1 // 1: clockwise, -1: counterclockwise
	, speed: 1 // Rounds per second
	, trail: 60 // Afterglow percentage
	, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
	, zIndex: 2e9 // The z-index (defaults to 2000000000)
	, className: 'spinner' // The CSS class to assign to the spinner
	, top: '3vh' // Top position relative to parent
	, left: '3vh' // Left position relative to parent
	, shadow: false // Whether to render a shadow
	, hwaccel: false // Whether to use hardware acceleration
	, position: 'relative' // Element positioning
	}
	var target = document.getElementsByClassName('mapboxgl-ctrl-top-left')[0];
	var spinner = new Spinner(opts).spin(target);
	app.spinner = spinner;
}

function stopspinner(){
	if (! app.spinner) {return}
	var parent = document.getElementsByClassName('mapboxgl-ctrl-top-left')[0];
	var child = document.getElementsByClassName("spinner")[0];
	parent.removeChild(child);
	app.spinner = undefined;	
}

function loadEdifici(){
	map = app.map;
	for (var fnum = 0; fnum < 6; fnum++) {
	    map.addSource('buildings'+ fnum.toString(), {
		    'type': 'geojson',
		    'data': 'https://unibg-gislab.github.io/datasets/obsoleto_dismesso_3D/bergamo_altri/buildings' + fnum.toString() + '.geojson'
			});

			
		map.addLayer({
	        'id': 'buildings' + fnum.toString(),
	        'type': 'fill-extrusion',
	        'source': 'buildings'+ fnum.toString(),
	        'paint': {
	            // See the Mapbox Style Spec for details on property functions
	            // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
	            'fill-extrusion-color': {
	                // Get the fill-color from the source 'color' property.
	                'property': 'color',
	                'type': 'identity'
	            },
	            'fill-extrusion-height': {
	                // Get fill-extrude-height from the source 'height' property.
	                'property': 'height',
	                'type': 'identity'
	            },
	            'fill-extrusion-base': {
	                // Get fill-extrude-base from the source 'base_height' property.
	                'property': 'base_height',
	                'type': 'identity'
	            },
	            // Make extrusions slightly opaque for see through indoor walls.
		            'fill-extrusion-opacity': 1
		    }
		}, styleToLabelLayer[app.currentStyle]);
		map.setLayoutProperty('buildings' + fnum.toString(), 'visibility', 'visible');
		app.currentGeojsonObjects['buildings' + fnum.toString()] = true;
	}

}

function toggleEdifici(file) {
	map = app.map;
	var GeojsonCheckbox = document.getElementById('Geojson-bergamo_buildings-check');
	if (GeojsonCheckbox.checked && !app.currentGeojsonObjects['buildings0']){
		loadEdifici();
	}
	else{
		for (var fnum = 0; fnum < 6; fnum++) {
	    	var clickedLayer = 'buildings' + fnum.toString()
	    	var visibility = map.getLayoutProperty(clickedLayer, "visibility");

		    if (visibility !== 'none') {
		        map.setLayoutProperty(clickedLayer, 'visibility', 'none');
		        this.className = '';
		    } else {
		        this.className = 'active';
		        map.setLayoutProperty(clickedLayer, 'visibility', 'visible');

		    }
	    }
	}
}

function toggleGeojson(file) {
	if (file.search('buildings') > -1) {
		toggleEdifici(file);
		return;
	}
	var GeojsonCheckbox = document.getElementById('Geojson-' + file + '-check');

	if (GeojsonCheckbox.checked && !app.currentGeojsonObjects[file])
		loadGeojson(file);
	else{
		toggleLayer(file);	
	}
}

function loadGeojson(file) {

	var path = '';
	if (file.startsWith('buildings')) {
		path = 'https://unibg-gislab.github.io/datasets/obsoleto_dismesso_3D/bergamo_altri/' + file + '.geojson'
	}
	else
	{
		path = 'https://unibg-gislab.github.io/datasets/obsoleto_dismesso_3D/' + file + '.geojson'; 
		flyTo(centers[file.split('_')[0]]);
	}
	map = app.map;
	if (!linkCheck(path)){
		alert('Work In Progress!\nGoogle ha terminato il supporto alle API di Google Earth, stiamo lavorando per rendere la piattaforma nuovamente funzionante quanto prima.')
		document.getElementById('Geojson-' + file + '-check').checked = '';
		return
	}

	map.addSource(file, {
    'type': 'geojson',
    'data': path
	});

	
	map.addLayer({
        'id': file,
        'type': 'fill-extrusion',
        'source': file,
        'paint': {
            // See the Mapbox Style Spec for details on property functions
            // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
            'fill-extrusion-color': {
                // Get the fill-color from the source 'color' property.
                'property': 'color',
                'type': 'identity'
            },
            'fill-extrusion-height': {
                // Get fill-extrude-height from the source 'height' property.
                'property': 'height',
                'type': 'identity'
            },
            'fill-extrusion-base': {
                // Get fill-extrude-base from the source 'base_height' property.
                'property': 'base_height',
                'type': 'identity'
            },
            // Make extrusions slightly opaque for see through indoor walls.
	            'fill-extrusion-opacity': 1
	    }
	}, styleToLabelLayer[app.currentStyle]);

	app.currentGeojsonObjects[file] = true;
}

function toggleLayer(file){
	map = app.map;
    var clickedLayer = file

    var visibility = map.getLayoutProperty(file, "visibility");

    if (visibility !== 'none') {
        map.setLayoutProperty(file, 'visibility', 'none');
        this.className = '';
    } else {
        this.className = 'active';
        map.setLayoutProperty(file, 'visibility', 'visible');

	    flyTo(centers[file.split('_')[0]]);
    }

}

function linkCheck(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
    http.send();
    return http.status!=404;
}

function flyTo(coordinates){
	if(app.stylechanged){
		return
	}
    if(app.popup){
        app.popup._closeButton.click()
    }
	app.map.flyTo({
        center: coordinates,
        zoom: 13, //9 // starting zoom
	    pitch: 60,
	    bearing: 0
    });
}

function toggleStrade() {
	sat = "mapbox://styles/dnlcrl/ciy5oqecp00472sqitnohq0rw"

// else

}

function startStyleTimer(){
	app.styleTimer = setInterval(addCheckedLayers, 500);
}

function addCheckedLayers(){
	var l = app.map.style.getLayer("confini-comunali");
	if (l !== undefined && app.map != undefined) {
			clearInterval(app.styleTimer);
			toggleConfini();
			// addBuildings();
			for (var file in app.layersToRecover){
				if (!file.includes('buildings') || file.includes('0')) {
					toggleGeojson(file);
				}

			}
			app.stylechanged = undefined
	}
}

function toggleConfini() {

	map = app.map
	var l = map.style.getLayer("confini-comunali");

	if (!document.getElementById('confini_comunali-check').checked) {
		l.layout.visibility = "none"
	}
	else{
	l.layout.visibility = "visible"
	}
	map._render();
}// JavaScript Document


var layerList = document.getElementById('menustyle');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
    var layerId = layer.target.id;
    app.map.setStyle(styles[layerId]);
    // 'mapbox://styles/mapbox/' + layerId + '-v9');
    
    app.styleTimer = setInterval(addCheckedLayers, 500);
    app.layersToRecover = app.currentGeojsonObjects 
    app.currentGeojsonObjects = {}
    app.currentStyle = layerId
    app.stylechanged = true
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}


// var styleList = document.getElementById('menustyle');
// var inputs = layerList.getElementsByTagName('input');

// checked="checked"

