type GlobalStateOptionsType = {
    alwaysDispatch?: boolean;
    dispatchEvents?: boolean;
};
type GlobalStateCallbackType = ( value: any, properyName: string, storeName: string ) => void;
