declare namespace FLib {
    namespace GlobalState {
        type Options = {
            alwaysDispatch: boolean;
            dispatchEvents: boolean;
        };
        type Callback = ( value: any, properyName: string, storeName: string ) => void;
    }
}
