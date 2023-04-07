export const populationToRadius = population => {
    const baseRadius = 20; // This radius is for a population of 1
    const MIN_RADIUS = 14;
    const MAX_RADIUS = 90;

    /**
     * Use base population area to find proportional
     * area and radius for new population
     */
    const popMultiplier = Math.sqrt(population) * baseRadius;

    /**
     * Scale value so that min and max values are bounded.
     * Max cluster population is around ~950 with a max radius of ~150
     */
    const scaledValue = Math.floor(popMultiplier / 5 + 10);
    return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, scaledValue));
};

export const populationToSize = population => {
    const popToSize = {
        1: "sm",
        2: "sm",
        5: "md",
        10: "md",
        20: "lg",
        50: "lg",
        100: "lg",
        200: "xl",
        400: "xl",
        5000: "xxl"
    };

    // Find the first key that is greater than or equal to the original size
    const size = Object.keys(popToSize).filter(n => n >= population)[0];
    return popToSize[size];
};
