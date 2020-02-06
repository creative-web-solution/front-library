
function degToRad( angle ) {
    return Math.PI * angle / 180;
}

/**
 * Compute the distance (in km) between 2 coordinates
 *
 * @param {Number} latitude1
 * @param {Number} longitude1
 * @param {Number} latitude2
 * @param {Number} longitude2
 *
 * @return {Number}
 */
export function distance( latitude1, longitude1, latitude2, longitude2 ) {
    let dist;

    const THETHA = longitude1 - longitude2;

    dist = Math.sin( degToRad( latitude1 ) ) * Math.sin( degToRad( latitude2 ) ) + Math.cos( degToRad( latitude1 ) ) * Math.cos( degToRad( latitude2 ) ) * Math.cos( degToRad( THETHA ) );
    dist = Math.acos( dist );
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;

    if ( dist <= 0 ) {
        return 0;
    }

    return dist;
}
