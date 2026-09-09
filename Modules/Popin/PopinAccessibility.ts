import { FOCUSABLE_ELEMENTS_SELECTOR } from "./Tools";

export default class PopinAccessibility {
    #$elements: HTMLElement[] | undefined;
    #$firstElement: HTMLElement | undefined;
    #$lastElement: HTMLElement | undefined;
    #$startSentinel: HTMLElement | null = null;
    #$endSentinel: HTMLElement | null = null;
    #$popin: HTMLElement;
    #isFocusBackHandled: boolean = false;

    constructor($popin: HTMLElement) {
        this.#$popin = $popin;

        this.refresh();
    }

    focusFirstElement(): void {
        if (!this.#$firstElement) {
            return;
        }
        this.#$firstElement.focus();
    }

    focusLastElement(): void {
        if (!this.#$lastElement) {
            return;
        }
        this.#$lastElement.focus();
    }

    handleBackwardTab(e: Event): void {
        if (document.activeElement === this.#$firstElement) {
            e.preventDefault();
            this.focusLastElement();
        }
    }

    handleForwardTab(e: Event): void {
        if (document.activeElement === this.#$lastElement) {
            e.preventDefault();
            this.focusFirstElement();
        }
    }

    refresh(): void {
        this.#addSentinels();
        this.#handleFocusBackInDocument();

        this.#$elements = Array.from(
            this.#$popin.querySelectorAll<HTMLElement>(
                FOCUSABLE_ELEMENTS_SELECTOR,
            ),
        ).filter(($element) => $element.offsetParent !== null);
        this.#$firstElement = this.#$elements[0] ?? this.#$popin;
        this.#$lastElement = this.#$elements[this.#$elements.length - 1];
    }

    #addSentinels(): void {
        if (this.#$startSentinel) {
            return;
        }
        this.#$startSentinel = document.createElement("div");
        this.#$endSentinel = document.createElement("div");
        [this.#$startSentinel, this.#$endSentinel].forEach(($sentinel) => {
            $sentinel.tabIndex = 0;
            $sentinel.setAttribute("aria-hidden", "true");
            $sentinel.style.cssText =
                "position:fixed;width:1px;height:1px;overflow:hidden;";
        });
        this.#$popin.prepend(this.#$startSentinel);
        this.#$popin.append(this.#$endSentinel);
        this.#$startSentinel.addEventListener("focus", () =>
            this.focusLastElement(),
        );
        this.#$endSentinel.addEventListener("focus", () =>
            this.focusFirstElement(),
        );
    }

    #handleFocusBackInDocument(): void {
        if (this.#isFocusBackHandled) {
            return;
        }
        this.#isFocusBackHandled = true;
        document.addEventListener("focusin", this.#onFocusBackInDocument);
    }

    #onFocusBackInDocument = (e: FocusEvent): void => {
        if (!this.#$popin.contains(e.target as Node)) {
            this.focusFirstElement();
        }
    };

    clean(): void {
        document.removeEventListener("focusin", this.#onFocusBackInDocument);
        this.#isFocusBackHandled = false;

        this.#$startSentinel?.remove();
        this.#$endSentinel?.remove();

        this.#$startSentinel = null;
        this.#$endSentinel = null;
    }
}
