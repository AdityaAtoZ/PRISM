export const ADMIN_EMAILS = ["aditya@gmail.com"];

export const getRedirectPath = (email) => {
    if (ADMIN_EMAILS.includes(email)) {
        return "/dashboard";
    }
    return "/pay";
};

export const isAdmin = (email) => ADMIN_EMAILS.includes(email);
