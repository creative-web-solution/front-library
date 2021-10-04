namespace FLib {
    namespace Helpers {
        namespace Color {
            type RenderType =  'obj' | 'hex' | 'rgba';

            type Color = {
                r:  number;
                g:  number;
                b:  number;
                a:  number;
                hr: string;
                hg: string;
                hb: string;
                ha: string;
            }
        }

        namespace Cookie {
            type Options = {
                days:    number | null;
                /** Default value is true if the location protocol is https */
                secure:  boolean;
                /** Default: window.location.hostname */
                domain:  string;
                /** Default: / */
                path:    string;
            }
        }
    }
}
