export const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol,
        checks: {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSymbol
        }
    };
};
