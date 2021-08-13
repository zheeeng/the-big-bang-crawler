export const formatNumber = (input: number) => {
    if (input > 1000) {
        return Math.round(input / 1000).toLocaleString() + 'k'
    }

    return input.toLocaleString()
}

export const nonNull = <T>(item: T | undefined | null): item is T => item !== undefined && item !== null