import { addValidator } from "./index";

/**
 * File size validation
 */
addValidator(
    "maxfilesize",
    "[data-max-file-size]",
    ($input, value, isLiveValidation) => {
        if (!($input as HTMLInputElement).files?.length) {
            return Promise.resolve({
                $input,
                value,
                isValid: true,
                label: "maxfilesize",
                isLiveValidation,
            });
        }

        const size = ($input as HTMLInputElement).files![0].size;
        const maxSize = Number(
            $input.getAttribute("data-max-file-size") ?? "0",
        );

        return Promise.resolve({
            $input,
            value,
            isValid:
                ($input as HTMLInputElement).files?.length === 0 ||
                size <= 0 ||
                maxSize <= 0 ||
                size <= maxSize,
            label: "maxfilesize",
            isLiveValidation,
        });
    },
);
