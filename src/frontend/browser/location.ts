import {timezone_to_location} from "./tz/tz_table";

export function getBrowserTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getBrowserTimeZoneOffset(): number {
    try {
        const date = new Date();
        const offset = Intl.DateTimeFormat("ia", { timeZoneName: "shortOffset" }).formatToParts(date).find((i) => i.type === "timeZoneName").value;
        const sign = offset.charAt(0) === "+" ? 1 : -1;
        const hours = parseInt(offset.slice(1, 3), 10);
        const minutes = parseInt(offset.slice(4), 10);
        return sign * (hours * 60 + minutes);
    } catch(err) {
        const date = new Date();
        return date.getTimezoneOffset();
    }
}

function getApproximateBrowserLocation(): [number, number, number] {
    let tz = getBrowserTimeZone();
    try {
        let loc = timezone_to_location(tz)
        return [loc[0], loc[1], 10.0]  // sea-level
    } catch(err) {
        let offset = getBrowserTimeZoneOffset();
        let lon = 180.0 / 12 * offset;
        return [0.0, lon, 10.0]  // equator at sea-level
    }
}

export function getBrowserLocation(): [number, number, number] {
    let latLonAlt: [number, number, number];
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((geoPos) => {
                let lat = geoPos.coords.latitude;
                let lon = geoPos.coords.longitude;
                let alt = geoPos.coords.altitude;
                latLonAlt = [lat, lon, alt]
            },
            (err) => {  // fallback
                latLonAlt = getApproximateBrowserLocation();
            });
    } else
        latLonAlt = getApproximateBrowserLocation();
    return latLonAlt
}