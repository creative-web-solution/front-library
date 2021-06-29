/// <reference path="AccordionTypes.d.ts"/>
/// <reference path="AutocompleteTypes.d.ts"/>
/// <reference path="DOMTypes.d.ts"/>
/// <reference path="DragSliderTypes.d.ts"/>
/// <reference path="EventsHelpersTypes.d.ts"/>
/// <reference path="GLImageTransition.d.ts"/>
/// <reference path="GlobalStateTypes.d.ts"/>
/// <reference path="HelpersTypes.d.ts"/>
/// <reference path="Notifications.d.ts"/>
/// <reference path="PopinTypes.d.ts"/>
/// <reference path="ScrollSnapTypes.d.ts"/>
/// <reference path="SkinCheckboxTypes.d.ts"/>
/// <reference path="SkinFileTypes.d.ts"/>
/// <reference path="SkinRadioTypes.d.ts"/>
/// <reference path="SkinSelectTypes.d.ts"/>
/// <reference path="SliderTypes.d.ts"/>
/// <reference path="TabsTypes.d.ts"/>
/// <reference path="ValidatorTypes.d.ts"/>
/// <reference path="YouTubePlayerTypes.d.ts"/>


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
