type AriaAnnouncementHelperBaseOptions = {
    /** In words/minute. Average is between 150 and 200
     * @default 175
     */
    estimatedSpeechSpeed?: number;
};
type AriaAnnouncementHelperSelectorsOptions =
    AriaAnnouncementHelperBaseOptions & {
        assertiveAreaSelector: string;
        politeAreaSelector: string;
    };
type AriaAnnouncementHelperCssClassOptions =
    AriaAnnouncementHelperBaseOptions & {
        areaCssClass?: string;
    };
type AriaAnnouncementOptions = OneOf<
    [
        AriaAnnouncementHelperSelectorsOptions,
        AriaAnnouncementHelperCssClassOptions,
    ]
>;

type MessagePriority = "polite" | "assertive";

const PRIORITIES: Record<MessagePriority, MessagePriority> = {
    assertive: "assertive",
    polite: "polite",
} as const;

const ESTIMATED_WORDS_BY_MINUTES_SPEED = 175;

export default class AriaAnnouncementHelper {
    #$assertiveArea!: HTMLElement;
    #estimatedSpeechSpeed: number;
    #isSpeeching: boolean = false;
    #messages: {
        message: string;
        priority: MessagePriority;
    }[] = [];
    #options?: AriaAnnouncementOptions;
    #$politeArea!: HTMLElement;
    #rafId: number = -1;
    #timeoutId: number = -1;

    constructor(options?: AriaAnnouncementOptions) {
        this.#options = options;
        this.#estimatedSpeechSpeed =
            this.#options?.estimatedSpeechSpeed ??
            ESTIMATED_WORDS_BY_MINUTES_SPEED;
        this.#createElements();
    }

    #createElements(): void {
        this.#$politeArea = this.#createArea(
            PRIORITIES.polite,
            (this.#options as AriaAnnouncementHelperSelectorsOptions)
                ?.politeAreaSelector,
        );
        this.#$assertiveArea = this.#createArea(
            PRIORITIES.assertive,
            (this.#options as AriaAnnouncementHelperSelectorsOptions)
                ?.assertiveAreaSelector,
        );
    }

    #createArea(priority: MessagePriority, selector?: string): HTMLElement {
        let $element: HTMLElement | null = null;
        if (selector) {
            $element = document.querySelector<HTMLElement>(selector);
        }
        if (!$element) {
            $element = document.createElement("div");
            $element.id = `announcement-${priority}`;
            $element.setAttribute("aria-live", priority);
            $element.setAttribute("aria-atomic", "true");
            const areaCssClass = (
                this.#options as AriaAnnouncementHelperCssClassOptions
            )?.areaCssClass;
            if (areaCssClass) {
                $element.classList.add(areaCssClass);
            }
        }
        document.body.appendChild($element);

        return $element;
    }

    assertiveMessage(message: string): this {
        this.#addMessage(message, PRIORITIES.assertive);
        return this;
    }

    politeMessage(message: string): this {
        this.#addMessage(message, PRIORITIES.polite);
        return this;
    }

    #addMessage(message: string, priority: MessagePriority): void {
        this.#messages.push({ message, priority });
        this.#processMessages();
    }

    #processMessages(): void {
        if (this.#isSpeeching || this.#messages.length === 0) {
            return;
        }
        this.#isSpeeching = true;
        this.#clearZones();

        const { message, priority } = this.#messages.shift()!;

        this.#updateZone(
            message,
            priority === PRIORITIES.assertive
                ? this.#$assertiveArea
                : this.#$politeArea,
        );

        this.#timeoutId = setTimeout(() => {
            this.#isSpeeching = false;
            this.#processMessages();
        }, this.#timeEstimationInMs(message));
    }

    #updateZone(message: string, $element: HTMLElement): void {
        this.#rafId = requestAnimationFrame(() => {
            $element.textContent = message;
        });
    }

    #timeEstimationInMs(texte: string): number {
        const wordsCount = texte.split(" ").length;
        return (wordsCount / this.#estimatedSpeechSpeed) * 60 * 1000;
    }

    clearAll(): this {
        this.#messages.length = 0;
        clearTimeout(this.#timeoutId);
        cancelAnimationFrame(this.#rafId);
        this.#clearZones();
        return this;
    }

    #clearZones(): void {
        this.#$politeArea.textContent = "";
        this.#$assertiveArea.textContent = "";
    }
}
