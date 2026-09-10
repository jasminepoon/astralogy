import * as A from "./vendor/astronomy.js";
export function skyTransform(date, lat, lon) {
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() < 1900 ||
    date.getUTCFullYear() > 2100 ||
    !Number.isFinite(lat) ||
    Math.abs(lat) > 90 ||
    !Number.isFinite(lon) ||
    Math.abs(lon) > 180
  )
    throw Error("Use a date in 1900–2100 and valid latitude / longitude.");
  const time = A.MakeTime(date),
    rot = A.Rotation_EQJ_HOR(time, new A.Observer(lat, lon, 0));
  return (ra, dec) => {
    const r = (ra * Math.PI) / 180,
      d = (dec * Math.PI) / 180;
    const h = A.RotateVector(
      rot,
      new A.Vector(
        Math.cos(d) * Math.cos(r),
        Math.cos(d) * Math.sin(r),
        Math.sin(d),
        time,
      ),
    );
    return [-h.y, h.z, -h.x];
  };
}
