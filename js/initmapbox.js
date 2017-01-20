var ge;

var app = {};

//this timer is used when toggling layers after a map style change
app.styleTimer = null;

styles = {
	'default': "mapbox://styles/dnlcrl/ciy1cvzzp00c32sqkqt2uebg1",
	'satellite': "mapbox://styles/dnlcrl/ciy5oqecp00472sqitnohq0rw",
	'light': "mapbox://styles/dnlcrl/ciy5r55xv004r2slsthz09mh7",
	'dark': "mapbox://styles/dnlcrl/ciy5rbyyh004i2sofxd7ka19s"
}

styleToLabelLayer = {
	'default': 'waterway-label',
	'satellite': undefined,
	'light': 'water',
	'dark': 'waterway-label'
}

app.currentStyle = 'default'
app.stylechanged = undefined

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


app.currentKmlObjects = { 
// 'ecomuseo': null,
//'tin': null,
//'sic_riserve_plis': null,
// 'confini_comunali': null,
// 'designatori__': null
 
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
	    style: 'mapbox://styles/dnlcrl/ciy1cvzzp00c32sqkqt2uebg1', //stylesheet location
	    center:  [9.689630, 45.705651], //[9.856441382762, 45.10320555826568], // starting position
	    zoom: 13, //9 // starting zoom
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
	    var features = map.queryRenderedFeatures(e.point, { layers: Object.keys( app.currentKmlObjects )});

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
	        .setHTML(feature.properties.description)
	        .addTo(map);
	});

	// Use the same approach as above to indicate that the symbols are clickable
	// by changing the cursor style to 'pointer'.
	app.map.on('mousemove', function (e) {
	    var features = map.queryRenderedFeatures(e.point, { layers: Object.keys(app.currentKmlObjects) });
	    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

	});
	// the 'building' layer in the mapbox-streets vector source contains building-height
	// data from OpenStreetMap.
	// map.on('load', function() {
	//     addBuildings();
	// });


  // google.earth.createInstance('map3d', initCallback, failureCallback);
}



function addBuildings(){
	app.map.addLayer({
	        'id': '3d-buildings',
	        'source': 'composite',
	        'source-layer': 'building',
	        'filter': ['==', 'extrude', 'true'],
	        'type': 'fill-extrusion',
	        'minzoom': 15,
	        'paint': {
	            'fill-extrusion-color': '#aaa',
	            'fill-extrusion-height': {
	                'type': 'identity',
	                'property': 'height'
	            },
	            'fill-extrusion-base': {
	                'type': 'identity',
	                'property': 'min_height'
	            },
	            'fill-extrusion-opacity': .6
	        }
	    }, 'background');
}

function initCallback(pluginInstance) {




	if (document.getElementById('kml-confini_comunali-check').checked)
	loadKml('confini_comunali');

	if (document.getElementById('kml-designatori__-check').checked)
	loadKml('designatori__');






	function eventHandler(event) {
		var text = event.getLatitude()+","+event.getLongitude();

		// Prevent default balloon from popping up for marker placemarks
		event.preventDefault();

		// wrap alerts in API callbacks and event handlers
		// in a setTimeout to prevent deadlock in some browsers
		setTimeout(function() {
			// alert(text);
			var divcoordinate = document.getElementById("coordinate");
			divcoordinate.innerHTML = text;
		}, 0);
	}
	// listen to the click event on the globe and window
	google.earth.addEventListener(ge.getWindow(), 'mousemove', eventHandler);

}

function failureCallback(errorCode) {
}

function toggleGeojson(file) {

	var kmlCheckbox = document.getElementById('kml-' + file + '-check');

	if (kmlCheckbox.checked && !app.currentKmlObjects[file])
		loadGeojson(file);
	else{
		toggleLayer(file);
	}
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


function loadGeojson(file) {

	var path = '';

	{
		path = 'https://unibg-gislab.github.io/datasets/obsoleto_dismesso_3D/' + file + '.geojson'; 
		flyTo(centers[file.split('_')[0]]);
	}
	map = app.map;
	// var path = 'https://unibg-gislab.github.io/datasets/obsoleto_dismesso_3D/' + file + '.geojson'; 
	if (!linkCheck(path)){
		alert('Work In Progress!\nGoogle ha terminato il supporto alle API di Google Earth, stiamo lavorando per rendere la piattaforma nuovamente funzionante quanto prima.')
		document.getElementById('kml-' + file + '-check').checked = '';
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
	            'fill-extrusion-opacity': 0.8
	    }
	}, styleToLabelLayer[app.currentStyle]);

	app.currentKmlObjects[file] = true;

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
				toggleGeojson(file);
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
    app.layersToRecover = app.currentKmlObjects 
    app.currentKmlObjects = {}
    app.currentStyle = layerId
    app.stylechanged = true
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}

