type ColorRenderType =  'obj' | 'hex' | 'rgba';

type ColorType = {
    r:  number;
    g:  number;
    b:  number;
    a:  number;
    hr: string;
    hg: string;
    hb: string;
    ha: string;
}


type CookieOptionsType = {
    days:    number | null;
    /** Default value is true if the location protocol is https */
    secure:  boolean;
    /** Default: window.location.hostname */
    domain:  string;
    /** Default: / */
    path:    string;
}
