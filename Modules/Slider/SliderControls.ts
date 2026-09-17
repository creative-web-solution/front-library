import { off, on, one } from "../../Events/EventsManager";
import { gesture, gestureOff } from "../../Events/Gesture";
import KeyboardHandler from "../../Events/KeyboardHandler";
import { extend } from "../../Helpers/Extend";
import { index } from "../../DOM/Index";
import Slider from "./Slider";

/**
 * Controls of a slider
 *
 * @see extra/modules/slider.md
 *
 * @example
 * ```ts
 * let controls = new SliderControls(
 *  slider,
 *  {
 *      "$btPrev": $previousButtton,
 *      "$btNext": $nextButton,
 *      "$btPause": $btPause,
 *      "$tabsList": $pagination,
 *      "tabsSelector": '.item',
 *      "autoslide": 10, // in second
 *      "swipe": false,
 *      "enableKeyboard": true,
 *      "gestureOptions": Object,
 *      "onAutoplayChange": () => {
 *      },
 *      "onPreviousButtonClick": () => {
 *      },
 *      "onNextButtonClick": () => {
 *      },
 *      "onPauseButtonClick": () => {
 *      },
 *      "onTabClick": () => {
 *      },
 *  }
 * );
 * ```
 */
export default class SliderControls {
    #slider: Slider;
    #autoslideTimeoutId: number = -1;
    #keyboardHandlers: KeyboardHandler[] = [];
    #$tabsList?: HTMLElement;
    #$tabs: NodeListOf<HTMLElement> | null = null;
    #$btPrevious?: HTMLElement;
    #$btNext?: HTMLElement;
    #$btPause?: HTMLElement;
    #isAutoslideEnabled = false;
    #options: FLib.Slider.ControlsOptions;
    #isPauseRequested: boolean = false;
    #hasHoverOnSlider: boolean = false;
    #hasFocusOnTabs: boolean = false;
    #hasFocusOnButtons: boolean = false;

    get slider(): Slider {
        return this.#slider;
    }

    get isAutoSlidePaused(): boolean {
        return (
            this.#isPauseRequested ||
            this.#hasFocusOnTabs ||
            this.#hasHoverOnSlider ||
            this.#hasFocusOnButtons
        );
    }

    get isPauseRequested(): boolean {
        return this.#isPauseRequested;
    }

    constructor(slider: Slider, options: FLib.Slider.ControlsOptions) {
        this.#slider = slider;
        this.#options = options;
        this.#isPauseRequested = !Boolean(options.autoslide);

        this.#initSlider();
        this.#initTabs();
        this.#initButtons();
        this.#initSwipe();
    }

    #initSlider(): void {
        on(this.#slider, {
            eventsName: "before",
            callback: (data: FLib.Slider.CallbackParam) => {
                this.#updateTabs(data.targetSlide, data.currentSlide);
                if (this.#hasFocusOnTabs) {
                    this.#updateTabsFocus(data);
                }
            },
        });

        on(this.#slider, {
            eventsName: "start",
            callback: (data: FLib.Slider.CallbackParam) => {
                this.#updateTabs(data.currentSlide);
                if (this.#hasFocusOnTabs) {
                    this.#updateTabsFocus(data);
                }
            },
        });

        on(this.#slider.$slider, {
            eventsName: "mouseover",
            callback: this.#onMouseOver,
        });

        on(this.#slider.$slider, {
            eventsName: "mouseout",
            callback: this.#onMouseOut,
        });
    }

    #initTabs(): void {
        this.#$tabsList = this.#options.$tabsList;

        if (!this.#$tabsList || !this.#options.tabsSelector) {
            return;
        }

        this.#$tabsList.setAttribute("role", "tablist");

        on(this.#$tabsList, {
            eventsName: "focusin",
            callback: this.#onTabsListFocusIn,
        });

        on(this.#$tabsList, {
            eventsName: "focusout",
            callback: this.#onTabsListFocusOut,
        });

        this.#$tabs = this.#$tabsList.querySelectorAll(
            this.#options.tabsSelector,
        );

        if (!this.#$tabs.length) {
            return;
        }

        this.#$tabs.forEach(($tabs, index) => {
            const matchSlide = this.#slider.getSlide(index);

            $tabs.setAttribute("role", "tab");
            $tabs.setAttribute("aria-selected", "false");
            $tabs.setAttribute("tabindex", "-1");
            $tabs.setAttribute("aria-controls", matchSlide.id);
        });

        on(this.#$tabsList, {
            eventsName: "click",
            selector: this.#options.tabsSelector,
            callback: this.#onClickTabsHandler,
        });

        if (!this.#options.enableKeyboard) {
            return;
        }

        this.#keyboardHandlers.push(
            new KeyboardHandler(this.#$tabsList, {
                selector: this.#options.tabsSelector,
                onPrevious: this.#onTabsListKeyboardPreviousHandler,
                onNext: this.#onTabsListKeyboardNextHandler,
                onHome: this.#onTabsListKeyboardHomeHandler,
                onEnd: this.#onTabsListKeyboardEndHandler,
            }),
        );
    }

    #initButtons(): void {
        this.#$btPrevious = this.#options.$btPrev;
        this.#$btNext = this.#options.$btNext;
        this.#$btPause = this.#options.$btPause;

        if (this.#$btPrevious) {
            on(this.#$btPrevious, {
                eventsName: "click",
                callback: this.#onClickPreviousButtonHandler,
            });

            on(this.#$btPrevious, {
                eventsName: "focus",
                callback: this.#onButtonsFocusIn,
            });

            on(this.#$btPrevious, {
                eventsName: "blur",
                callback: this.#onButtonsFocusOut,
            });
        }

        if (this.#$btNext) {
            on(this.#$btNext, {
                eventsName: "click",
                callback: this.#onClickNextButtonHandler,
            });

            on(this.#$btNext, {
                eventsName: "focus",
                callback: this.#onButtonsFocusIn,
            });

            on(this.#$btNext, {
                eventsName: "blur",
                callback: this.#onButtonsFocusOut,
            });
        }

        if (this.#$btPause) {
            on(this.#$btPause, {
                eventsName: "click",
                callback: this.#onClickPauseButtonHandler,
            });
        }

        if (!this.#options.enableKeyboard) {
            return;
        }

        if (this.#$btNext) {
            this.#keyboardHandlers.push(
                new KeyboardHandler(this.#$btNext, {
                    onSelect: (e: Event) => {
                        this.#onClickNextButtonHandler(e, this.#$btNext);
                    },
                }),
            );
        }

        if (this.#$btPrevious) {
            this.#keyboardHandlers.push(
                new KeyboardHandler(this.#$btPrevious, {
                    onSelect: (e: Event) => {
                        this.#onClickPreviousButtonHandler(
                            e,
                            this.#$btPrevious,
                        );
                    },
                }),
            );
        }

        if (this.#$btPause) {
            this.#keyboardHandlers.push(
                new KeyboardHandler(this.#$btPause, {
                    onSelect: this.#onClickPauseButtonHandler,
                }),
            );
        }
    }

    #initSwipe(): void {
        if (this.#options.swipe) {
            return;
        }

        let gestureOptions = {
            preventStart: true,
            swipeLeft: () => {
                this.next();
            },
            swipeRight: () => {
                this.previous();
            },
        };

        if (this.#options.gestureOptions) {
            gestureOptions = extend(
                gestureOptions,
                this.#options.gestureOptions,
            );

            if (this.#options.gestureOptions.swipeLeft) {
                gestureOptions = extend(gestureOptions, {
                    swipeLeft: (
                        e: Event,
                        $target: HTMLElement,
                        type: string,
                    ) => {
                        this.next();
                        this.#options.gestureOptions?.swipeLeft?.call(
                            this,
                            e,
                            $target,
                            type,
                        );
                    },
                });
            }

            if (this.#options.gestureOptions.swipeRight) {
                gestureOptions = extend(gestureOptions, {
                    swipeRight: (
                        e: Event,
                        $target: HTMLElement,
                        type: string,
                    ) => {
                        this.previous();
                        this.#options.gestureOptions?.swipeRight?.call(
                            this,
                            e,
                            $target,
                            type,
                        );
                    },
                });
            }
        }

        gesture(this.#slider.$slider, "__sliderSwipe", gestureOptions);
    }

    #onClickPauseButtonHandler = (): void => {
        this.togglePause();
        const currentSlide = this.#slider.getCurrentSlide();
        this.#options.onPauseButtonClick?.(
            this.#isPauseRequested,
            this.#$btPause!,
            currentSlide,
        );
    };

    #onClickPreviousButtonHandler = (
        e?: Event,
        $target?: HTMLElement,
    ): void => {
        e?.preventDefault();
        this.previous($target);

        if ($target) {
            const currentSlide = this.#slider.getCurrentSlide();
            this.#options.onPreviousButtonClick?.($target, currentSlide);
        }
    };

    #onClickNextButtonHandler = (e?: Event, $target?: HTMLElement): void => {
        e?.preventDefault();

        this.next($target);

        if ($target) {
            const currentSlide = this.#slider.getCurrentSlide();
            this.#options.onNextButtonClick?.($target, currentSlide);
        }
    };

    #onClickTabsHandler = (e: Event, $target: HTMLElement): void => {
        e.preventDefault();

        this.goTo(index($target), $target);

        this.#onTabsListAction();
    };

    #onTabsListKeyboardPreviousHandler = (): void => {
        this.previous();
        this.#onTabsListAction();
    };

    #onTabsListKeyboardNextHandler = (): void => {
        this.next();
        this.#onTabsListAction();
    };

    #onTabsListKeyboardHomeHandler = (): void => {
        this.goTo(0);
        this.#onTabsListAction();
    };

    #onTabsListKeyboardEndHandler = (): void => {
        this.goTo(this.#slider.bulletCount - 1);
        this.#onTabsListAction();
    };

    #onTabsListAction(): void {
        if (!this.#$tabs?.length) {
            return;
        }

        const currentSlide = this.#slider.lastMoveData?.targetSlide;

        if (!currentSlide) {
            return;
        }

        this.#options.onTabClick?.(
            this.#$tabs[currentSlide.index],
            currentSlide,
        );
    }

    #onTabsListFocusIn = (): void => {
        this.#hasFocusOnTabs = true;
        this.#onAutoplayChange();
    };

    #onTabsListFocusOut = (): void => {
        this.#hasFocusOnTabs = false;
        this.#onAutoplayChange();
    };

    #onButtonsFocusIn = (): void => {
        this.#hasFocusOnButtons = true;
        this.#onAutoplayChange();
    };

    #onButtonsFocusOut = (): void => {
        this.#hasFocusOnButtons = false;
        this.#onAutoplayChange();
    };

    #onMouseOver = (): void => {
        this.#hasHoverOnSlider = true;
        this.#onAutoplayChange();
    };

    #onMouseOut = (): void => {
        this.#hasHoverOnSlider = false;
        this.#onAutoplayChange();
    };

    #onAutoplayChange(): void {
        this.#options.onAutoplayChange?.(!this.isAutoSlidePaused);
        this.#slider.$list.setAttribute(
            "aria-live",
            this.isAutoSlidePaused ? "live" : "off",
        );
    }

    /**
     * @param _$button - Internal use
     */
    next(_$button?: HTMLElement): Promise<void> {
        return this.#slider.next(_$button);
    }

    /**
     * @param _$button - Internal use
     */
    previous(_$button?: HTMLElement): Promise<void> {
        return this.#slider.previous(_$button);
    }

    /**
     * @param $button - Internal use
     */
    goTo(index: number, _$button?: HTMLElement): Promise<void> {
        return this.#slider.goTo(index, _$button);
    }

    isEnabled(): boolean {
        return this.#slider.isEnabled();
    }

    togglePause(): this {
        if (this.#isPauseRequested) {
            this.resume();
            return this;
        }

        this.pause();
        return this;
    }

    pause(): this {
        this.#isPauseRequested = true;
        this.#onAutoplayChange();

        return this;
    }

    resume(): this {
        this.#isPauseRequested = false;
        this.#onAutoplayChange();

        return this;
    }

    startAutoslide(): this {
        if (this.#options.autoslide) {
            this.#isAutoslideEnabled = true;
            this.#autoslideLoop();
            this.#onAutoplayChange();
        }

        return this;
    }

    stopAutoslide(): this {
        clearTimeout(this.#autoslideTimeoutId);
        this.#isAutoslideEnabled = false;
        this.#onAutoplayChange();

        return this;
    }

    #makeAutoslide = (): void => {
        if (this.isAutoSlidePaused) {
            this.#autoslideLoop();
            return;
        }
        this.#slider.next().then(() => {
            if (this.#isAutoslideEnabled) {
                this.#autoslideLoop();
            }
        });
    };

    #autoslideLoop = (): void => {
        clearTimeout(this.#autoslideTimeoutId);
        const currentSlide = this.#slider.getCurrentSlide();

        if (!currentSlide) {
            return;
        }

        const delay =
            ((currentSlide.delay as number) ||
                (this.#options.autoslide as number)) * 1000;

        if (this.isAutoSlidePaused) {
            this.#autoslideTimeoutId = setTimeout(this.#autoslideLoop, delay);
            return;
        }

        this.#autoslideTimeoutId = setTimeout(this.#makeAutoslide, delay);
    };

    #updateTabs = (
        targetSlide: FLib.Slider.SlideProperties,
        currentSlide?: FLib.Slider.SlideProperties,
    ): void => {
        if (!this.#$tabs?.length) {
            return;
        }

        const currentSlideIndex =
            (this.#slider.options.moveByPage
                ? currentSlide?.pageIndex
                : currentSlide?.index) ?? 0;

        if (currentSlide && this.#$tabs[currentSlideIndex]) {
            const $tab = this.#$tabs[currentSlideIndex] as HTMLElement;
            $tab.setAttribute("aria-selected", "false");
            $tab.setAttribute("tabindex", "-1");
        }

        const targetlideIndex =
            (this.#slider.options.moveByPage
                ? targetSlide?.pageIndex
                : targetSlide?.index) ?? 0;

        if (targetSlide && this.#$tabs[targetlideIndex]) {
            const $tab = this.#$tabs[targetlideIndex] as HTMLElement;
            $tab.setAttribute("aria-selected", "true");
            $tab.setAttribute("tabindex", "0");
        }
    };

    #updateTabsFocus = (data: {
        currentSlide: FLib.Slider.SlideProperties;
        targetSlide: FLib.Slider.SlideProperties;
    }): void => {
        if (!this.#$tabs?.length || !this.#$tabsList) {
            return;
        }

        const currentSlide = data.targetSlide;

        if (this.#$tabs[currentSlide.index]) {
            (this.#$tabs[currentSlide.index] as HTMLElement).focus();
        } else if (
            parseInt(this.#$tabsList.getAttribute("tabindex") || "-1", 10) > -1
        ) {
            this.#$tabsList.focus();
        }
    };

    destroy(): void {
        clearTimeout(this.#autoslideTimeoutId);
        this.#slider.destroy();

        on(this.#slider.$slider, {
            eventsName: "mouseover",
            callback: this.#onMouseOver,
        });
        on(this.#slider.$slider, {
            eventsName: "mouseout",
            callback: this.#onMouseOut,
        });

        if (this.#$tabsList) {
            off(this.#$tabsList, {
                eventsName: "focusin",
                callback: this.#onTabsListFocusIn,
            });

            off(this.#$tabsList, {
                eventsName: "focusout",
                callback: this.#onTabsListFocusOut,
            });
        }

        if (this.#options.$btPrev) {
            off(this.#options.$btPrev, {
                eventsName: "click",
                callback: this.#onClickPreviousButtonHandler,
            });

            off(this.#options.$btPrev, {
                eventsName: "focus",
                callback: this.#onTabsListFocusIn,
            });

            off(this.#options.$btPrev, {
                eventsName: "blur",
                callback: this.#onTabsListFocusOut,
            });
        }

        if (this.#options.$btNext) {
            off(this.#options.$btNext, {
                eventsName: "click",
                callback: this.#onClickNextButtonHandler,
            });

            off(this.#options.$btNext, {
                eventsName: "focus",
                callback: this.#onTabsListFocusIn,
            });

            off(this.#options.$btNext, {
                eventsName: "blur",
                callback: this.#onTabsListFocusOut,
            });
        }

        if (this.#$btPause) {
            off(this.#$btPause, {
                eventsName: "click",
                callback: this.#onClickPauseButtonHandler,
            });
        }

        this.#keyboardHandlers.forEach((handler) => handler.off());

        if (this.#$tabs?.length) {
            off(this.#$tabsList, {
                eventsName: "click",
                callback: this.#onClickTabsHandler,
            });
        }

        if (this.#options.swipe) {
            gestureOff(this.#slider.$slider, "__sliderSwipe");
        }
    }
}
