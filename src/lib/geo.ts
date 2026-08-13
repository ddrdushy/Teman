/**
 * The jitter that makes approx_point safe to expose. ~500m of noise, applied
 * once at write time — never derived again from the exact point, so repeated
 * reads can't be averaged back to a home.
 */

const EARTH_M_PER_DEG_LAT = 111_320;

export function jitterPoint(lat: number, lng: number, radiusM = 500): { lat: number; lng: number } {
  const u = Math.random();
  const v = Math.random();
  const w = (radiusM / EARTH_M_PER_DEG_LAT) * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  return {
    lat: lat + w * Math.cos(t),
    lng: lng + (w * Math.sin(t)) / Math.cos((lat * Math.PI) / 180),
  };
}

/** WKT for a geography column insert. PostGIS casts text with lon-lat order. */
export function toWkt(lat: number, lng: number): string {
  return `POINT(${lng} ${lat})`;
}
