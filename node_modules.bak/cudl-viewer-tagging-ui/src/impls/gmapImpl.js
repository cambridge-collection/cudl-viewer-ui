import $ from 'jquery';
import some from 'lodash/some';
import filter from 'lodash/filter';
import GoogleMapsLoader from 'google-maps';


export var gmapImpl = {

    originLatLng : [52.2051, 0.10834], // location of CUDL

    google: {},
    map : {},
    infowindow : {},
    geocoder : {},
    marker : {},
    markers : [],

    initGMLoader : function() {
        GoogleMapsLoader.KEY      = 'AIzaSyBzPB8FfB31q742f0HcsPx6aycNlWKWAgE'; // cudl api key
        GoogleMapsLoader.SENSOR   = false;
        GoogleMapsLoader.LANGUAGE = 'en';
    },

    init : function(options) {

        this.el    = options.el;
        this.input = options.input;

        this.initGMLoader();

        GoogleMapsLoader.load(google => {
            this.google = google;

            this.geocoder   = new google.maps.Geocoder();
            this.infowindow = new google.maps.InfoWindow();

            var mapOptions = {
                center : {
                    lat: this.originLatLng[0],
                    lng: this.originLatLng[1]
                },
                zoom: 1,
                zoomControl: false,
                disableDefaultUI: true,
                streetViewControl: false
            };

            this.map = new google.maps.Map(this.el, mapOptions);

            // add event hadnler
            google.maps.event.addListener(this.map, 'click', e => {

                //
                // automatically geocode the location where user clicks to city or country
                // based on current zoom level
                //

                this.geocoder.geocode({'latLng': e.latLng}, (results, status) => {
                    if (status == google.maps.GeocoderStatus.OK) {

                        var candidates = this.getPlace(results, this.map.getZoom());

                        if(candidates.length === 0) {
                            console.warn('No suitable geocode results');
                        }
                        else {
                            var address = candidates[0];


                            $(this.input).val(address.formatted_address);

                            this.clearMarkers();

                            // Centre the map on the selected area and drop a
                            // pin on it.
                            this.map.fitBounds(address.geometry.bounds);
                            this.marker = new google.maps.Marker({
                                position: address.geometry.location,
                                map: this.map
                            });
                            this.marker.setMap(this.map);
                            this.markers.push(this.marker);
                        }
                    }
                    else {
                        console.warn('Geocoder failed due to: ' + status);
                    }
                });
            });
        });
    },

    getPlace: function(results, zoom) {
        if(results.length === 0) {
            return [];
        }

        var isCountryLevel = address => {
            return some(address.types, t => t === 'country');
        };

        var isCityOrTownOrCountryLevel = address => {
            return some(address.types, t => t === 'country' ||
                                            t === 'locality' ||
                                            t === 'postal_town');
        };

        var predicate = zoom <= 4 ? isCountryLevel : isCityOrTownOrCountryLevel;

        return filter(results, predicate);
    },

    clearMarkers : function() {
        for (var i=0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers.length = 0;
    },

    refresh : function() {
        this.google.maps.event.trigger(this.map, 'resize');
        this.map.setCenter(new this.google.maps.LatLng(this.originLatLng[0], this.originLatLng[1]));
        this.map.setZoom(0);
        this.clearMarkers();
    }

 }
