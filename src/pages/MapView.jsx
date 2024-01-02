import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import img from "../assets/react.svg";
import "../css/MapView.css";
import axios from "axios";
import api from "../api/api";
import mark from "../assets/mark.svg";
import current from '../assets/current.svg';

const MapView = () => {
  const apiKey = "";
  const [position, setPosition] = useState({
    lat: 18.645732400587775,
    lng: 73.76579150007586,
  });
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [markers, setMarkers] = useState([{}]);
  const [menu, setMenu] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDPEAGbAfP-gnmnziEPebB340EQ6J9at9M",
  });

  const onMarkerClick = () => {
    setInfoWindowOpen(!infoWindowOpen);
  };

  const onMarkerDragEnd = (e) => {
    setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };
  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/get-menu-data");
        console.log(response.data.menu_data);
        setMarkers(response.data.menu_data);
      } catch (error) {
        alert(error.message);
      }
    })();

    // Use Geolocation API to get the user's current position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user's location:", error);
      }
    );
  }, [window.google]);

  const mapOptions = {
    gestureHandling: "greedy",
    disableDefaultUI: true,
    mapId: "43e761c16c55b930",
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  const loadImage = async (marker) => {
    try {
      console.log(marker);
      if (!marker.menu_image_url) {
        alert("Menu not updated");
        return;
      }

      const response = await api.get(
        `/get-image-url?img_name=${marker.menu_image_url}`
      );
      const awsresponse = await axios.get(response.data.url);
      const base64String = awsresponse.data;
      setMenu(`data:image/jpeg;base64,${base64String}`);
      setPosition({
        lat: parseFloat(marker.location?.lat),
        lng: parseFloat(marker.location?.lng),
      });
      setInfoWindowOpen(!infoWindowOpen);
    } catch (error) {
      alert("Somthing went wrong");
    }
  };
  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={position}
      zoom={17.6}
      options={mapOptions}
    >
      {markers &&
        markers.map((marker) => (
          <Marker
            key={marker._id}
            onClick={() => loadImage(marker)}
            position={{
              lat: parseFloat(marker.location?.lat),
              lng: parseFloat(marker.location?.lng),
            }}
            // label={"Athavan"}
            icon={{
              url: mark,
              scaledSize: {
                width: 30,
                height: 30,
              },
            }}
            label={{
              text: marker.mess_name,
              color: "black",
              fontSize: "10px",
              fontWeight: "bold",
              position: "absolute",
            }}
            draggable={false}
            animation={google.maps.Animation.DROP}
          />
        ))}
      {currentLocation && (
        <Marker
          position={currentLocation}
          title="Live Location"
          icon={{
            url: current,
            scaledSize: new window.google.maps.Size(30, 30),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(25, 25),
          }}
        />
      )}
      {infoWindowOpen && (
        <InfoWindow
          position={position}
          onCloseClick={() => setInfoWindowOpen(false)}
        >
          <div className="infoWindow">
            <h3>Todays Menu</h3>
            <img src={menu} alt="" />
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <>Wait a moment</>
  );
};

export default MapView;
