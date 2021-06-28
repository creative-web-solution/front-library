type ClassInputType = Element | Element[] | Node | NodeList;


interface OffsetType {
    top:    number;
    y:      number;
    left:   number;
    x:      number;
    right:  number;
    bottom: number;
    width:  number;
    height: number;
}


type DOMSizeType = {
    width:  number;
    height: number;
}


type DOMPositionType = {
    left: number;
    top:  number;
}


type MatrixTranslateType = {
    tx: number;
    ty: number;
    tz: number;
}


type MatrixTransformType = {
    tx: number;
    ty: number;
    tz: number;
    rx: number;
    ry: number;
    rz: number;
}


type MatrixMatrixType = {
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
