import { next } from "../../DOM/Traversing";

/**
 * Tab of an accordion
 */
export default class Tab {
    #isOpen: boolean;
    #originalOpenedState: boolean;
    #$TAB_PANNEL: HTMLElement | null;
    #options;
    #$TAB;

    get isOpen(): boolean {
        return this.#isOpen;
    }

    constructor($TAB: HTMLElement, options: FLib.Accordion.TabOptions) {
        this.#options = options;
        this.#$TAB = $TAB;

        const ID = $TAB.getAttribute("aria-controls");
        this.#$TAB_PANNEL = ID
            ? document.getElementById(ID)
            : (next($TAB) as HTMLElement);

        this.#isOpen = this.#originalOpenedState =
            $TAB.getAttribute("aria-expanded") === "true";

        if (this.#isOpen) {
            this.#openTab(true);
        }
    }

    #changeTabState = (): void => {
        this.#$TAB.setAttribute(
            "aria-expanded",
            this.#isOpen ? "true" : "false",
        );
    };

    #openTab = (isOpenAtStart?: boolean): void => {
        this.#options.animations
            .open(this.#$TAB, this.#$TAB_PANNEL)
            .then(() => {
                if (isOpenAtStart && this.#options.onOpenAtStart) {
                    this.#options.onOpenAtStart(this.#$TAB, this.#$TAB_PANNEL);
                } else if (!isOpenAtStart && this.#options.onOpen) {
                    this.#options.onOpen(this.#$TAB, this.#$TAB_PANNEL);
                }
            });

        this.#isOpen = true;
        this.#changeTabState();
    };

    #closeTab = (autoClose?: boolean): void => {
        this.#options.animations
            .close(this.#$TAB, this.#$TAB_PANNEL)
            .then(() => {
                this.#options.onClose?.(
                    this.#$TAB,
                    this.#$TAB_PANNEL,
                    autoClose,
                );
            });

        this.#isOpen = false;
        this.#changeTabState();
    };

    open(): this {
        if (!this.#isOpen) {
            this.#openTab(false);
        }
        return this;
    }

    close(autoClose?: boolean): this {
        if (this.#isOpen) {
            this.#closeTab(autoClose);
        }

        return this;
    }

    destroy(): this {
        this.#options.animations.destroy(this.#$TAB, this.#$TAB_PANNEL);

        this.#$TAB.setAttribute(
            "aria-expanded",
            this.#originalOpenedState ? "true" : "false",
        );

        return this;
    }
}
