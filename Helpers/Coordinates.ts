function degToRad( angle: number ): number {
    return Math.PI * angle / 180;
}


/**
 * Compute the distance (in km) between 2 coordinates
 */
export function distance( latitude1: number, longitude1: number, latitude2: number, longitude2: number ): number {
    let dist: number;

    const THETHA: number = longitude1 - longitude2;

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
