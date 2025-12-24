export const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
    }
};

export const hapticFeedback = {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(40),
    success: () => vibrate([10, 50, 10]),
    error: () => vibrate([50, 30, 50]),
};
