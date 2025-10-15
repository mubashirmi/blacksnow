export const baseResponse = (message, data) => {
    return {
        success: true,
        message: message || '',
        data: data || {},
    };
};

export const errorResponse = (message, data = null) => {
    return {
        success: false,
        message: message || '',
        data: data || {},
    };
};
