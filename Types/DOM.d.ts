namespace FLib {
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

        type Translate = {
            tx: number;
            ty: number;
            tz: number;
        }


        type Transform = {
            tx: number;
            ty: number;
            tz: number;
            rx: number;
            ry: number;
            rz: number;
        }


        type Matrix = {
            m11: number;
            m21: number;
            m31: number;
            m41: number;
            m12: number;
            m22: number;
            m32: number;
            m42: number;
            m13: number;
            m23: number;
            m33: number;
            m43: number;
            m14: number;
            m24: number;
            m34: number;
            m44: number;
        }
    }
}
