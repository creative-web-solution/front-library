/**
 * Tab of an accordion
 */
export default class Tab {
    #isOpen: boolean = false;
    #originalOpenedState: boolean = false;
    #$panel!: HTMLElement;
    #options: FLib.Accordion.TabOptions;
    #$tab: HTMLElement;

    get isOpen(): boolean {
        return this.#isOpen;
    }

    constructor($tab: HTMLElement, options: FLib.Accordion.TabOptions) {
        this.#options = options;
        this.#$tab = $tab;
        this.#init();
    }

    #init(): void {
        const ID = this.#$tab.getAttribute("aria-controls");
        const $panel = ID
            ? document.getElementById(ID)
            : this.#$tab.nextElementSibling as HTMLElement;

        if (!$panel) {
            let idError = "";
            if (ID) {
                idError = ` with id "${ ID }"`;
            }
            throw `[TAB] Missing tab panel${ idError }.`;
        }

        this.#$panel = $panel;
        this.#isOpen = this.#originalOpenedState =
            this.#$tab.getAttribute("aria-expanded") === "true";

        this.#$panel.inert = true;

        if (this.#isOpen) {
            this.#openTab(true);
        }

    }

    #changeTabState = (): void => {
        this.#$tab.setAttribute(
            "aria-expanded",
            this.#isOpen ? "true" : "false",
        );
    };

    #openTab = (isOpenAtStart?: boolean): void => {
        this.#$panel.inert = false;
        this.#options.animations
            .open(this.#$tab, this.#$panel)
            .then(() => {
                if (isOpenAtStart && this.#options.onOpenAtStart) {
                    this.#options.onOpenAtStart(this.#$tab, this.#$panel);
                } else if (!isOpenAtStart && this.#options.onOpen) {
                    this.#options.onOpen(this.#$tab, this.#$panel);
                }
            });

        this.#isOpen = true;
        this.#changeTabState();
    };

    #closeTab = (autoClose?: boolean): void => {
        this.#$panel.inert = true;
        this.#options.animations
            .close(this.#$tab, this.#$panel)
            .then(() => {
                this.#options.onClose?.(
                    this.#$tab,
                    this.#$panel,
                    autoClose ?? false,
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
        this.#options.animations.destroy(this.#$tab, this.#$panel);

        this.#$tab.setAttribute(
            "aria-expanded",
            this.#originalOpenedState ? "true" : "false",
        );
        this.#$panel.inert = false;

        return this;
    }
}
