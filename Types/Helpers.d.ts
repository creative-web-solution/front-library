declare namespace FLib {
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

        interface UrlParser {
            absolute:       string;
            absolute2:      string;
            anchor:         string;
            authority:      string;
            directory:      string;
            file:           string;
            full:           string;
            full2:          string;
            host:           string;
            location;
            password:       string;
            path:           string;
            port:           string;
            protocol:       string;
            query:          string;
            queryKey:       Record<string, string>;
            relative:       string;
            relative2:      string;
            source:         string;
            user:           string;
            userInfo:       string;
            isAnchor:       boolean;
            isSameDomain:   boolean;

            init( url: string ): void;
            setAnchor( anchor: string ): this;
            getParam( key: string ): string;
            setParam( keys: string | Record<string, string>, value?: string ): this;
            removeParam( keys: string | string[] ): this
            removeAll(): this;
        }
    }
}
