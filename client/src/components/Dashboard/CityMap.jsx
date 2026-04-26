import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getCityCoordinates } from '../../utils/cityCoordinates';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const volunteerIcon = new L.DivIcon({
  html: '<div class="map-pin map-pin--volunteer"></div>',
  className: '',
  iconSize: [18, 18],
});

const busyVolunteerIcon = new L.DivIcon({
  html: '<div class="map-pin map-pin--busy"></div>',
  className: '',
  iconSize: [18, 18],
});

const taskIcon = (urgency) =>
  new L.DivIcon({
    html: `<div class="map-pin map-pin--task map-pin--${String(urgency || 'Low').toLowerCase()}"></div>`,
    className: '',
    iconSize: [20, 20],
  });

const INDIA_CENTER = [23.5937, 78.9629];

export default function CityMap({ volunteers, tasks }) {
  const center = INDIA_CENTER;
  const aggregate = new Map();

  volunteers.forEach((volunteer) => {
    const city = volunteer.location?.city || 'Unassigned';
    if (!aggregate.has(city)) {
      const coords = getCityCoordinates(city);
      aggregate.set(city, {
        city,
        volunteers: 0,
        lat: coords ? coords.lat : null,
        lng: coords ? coords.lng : null,
      });
    }

    const item = aggregate.get(city);
    item.volunteers += 1;
  });

  const cities = Array.from(aggregate.values()).filter((city) => city.lat && city.lng);

  return (
    <section className="panel map-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Geo View</p>
          <h2>City map and live field footprint</h2>
        </div>
      </div>

      <div className="map-wrap">
        <MapContainer center={center} zoom={5} scrollWheelZoom className="map-container">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {cities.map((cityObj) => (
            <Circle
              key={cityObj.city}
              center={[cityObj.lat, cityObj.lng]}
              radius={Math.max(8000, cityObj.volunteers * 2000)}
              pathOptions={{ color: '#1f7a8c', fillColor: '#1f7a8c', fillOpacity: 0.14 }}
            >
              <Popup>
                <strong>{cityObj.city}</strong>
                <div>{cityObj.volunteers} volunteers in this city</div>
              </Popup>
            </Circle>
          ))}

          {volunteers
            .filter((v) => getCityCoordinates(v.location?.city))
            .map((volunteer) => {
              const coords = getCityCoordinates(volunteer.location.city);
              // Slight jitter so markers don't overlap perfectly
              const jitterLat = coords.lat + (Math.random() - 0.5) * 0.05;
              const jitterLng = coords.lng + (Math.random() - 0.5) * 0.05;

              return (
                <Marker
                  key={volunteer.id}
                  position={[jitterLat, jitterLng]}
                  icon={volunteer.availability ? volunteerIcon : busyVolunteerIcon}
                >
                  <Popup>
                    <strong>{volunteer.name}</strong>
                    <div>{volunteer.location.city}</div>
                    <div>{volunteer.availability ? 'Available' : 'Busy'}</div>
                  </Popup>
                </Marker>
              );
            })}

          {tasks
            .filter((t) => getCityCoordinates(t.city))
            .map((task) => {
              const coords = getCityCoordinates(task.city);
              const jitterLat = coords.lat + (Math.random() - 0.5) * 0.05;
              const jitterLng = coords.lng + (Math.random() - 0.5) * 0.05;

              return (
                <Marker key={task.id} position={[jitterLat, jitterLng]} icon={taskIcon(task.urgency)}>
                  <Popup>
                    <strong>{task.title}</strong>
                    <div>{task.city}</div>
                    <div>Status: {task.status}</div>
                    <div>Assigned: {task.assignedTo?.name || 'Unassigned'}</div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </section>
  );
}
