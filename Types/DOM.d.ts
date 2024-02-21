declare namespace FLib {
    namespace DOM {
        type ClassInput = Element | Element[] | Node | NodeList;


        interface Offset {
            top:    number;
            y:      number;
            left:   number;
            x:      number;
            right:  number;
            bottom: number;
            width:  number;
            height: number;
        }


        type Size = {
            width:  number;
            height: number;
        }


        type Position = {
            left: number;
            top:  number;
        }
    }


    namespace Matrix {
        type Matrix3D = {
            a1: number;
            b1: number;
            c1: number;
            d1: number;
            a2: number;
            b2: number;
            c2: number;
            d2: number;
            a3: number;
            b3: number;
            c3: number;
            d3: number;
            a4: number;
            b4: number;
            c4: number;
            d4: number;
        }

        type Matrix2D = {
            a1: number;
            b1: number;
            c1: number;
            a2: number;
            b2: number;
            c2: number;
            a3: number;
            b3: number;
            c3: number;
        }

        type Translation = {
            tx: number;
            ty: number;
            tz: number;
        }

        type Rotation = {
            rx: number;
            ry: number;
            rz: number;
        }

        type Scale = {
            sx: number;
            sy: number;
            sz: number;
        }

        type Transform = {
            tx: number;
            ty: number;
            tz: number;
            rx: number;
            ry: number;
            rz: number;
            sx: number;
            sy: number;
            sz: number;
        }
    }
}
