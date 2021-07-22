type RequestIdleCallbackHandle  = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining:       ( () => number );
};

interface Window {
    MSPointerEvent: any;
    $$DEBUG$$: any;
    requestIdleCallback: (
        (
            callback: (( deadline: RequestIdleCallbackDeadline ) => void ),
            opts?: RequestIdleCallbackOptions,
        ) => RequestIdleCallbackHandle
    );
    cancelIdleCallback: (( handle: RequestIdleCallbackHandle ) => void );
}
