'use client';

/**
 * Google Analytics Event Tracking Utility
 * Use this to track custom events across the app
 */

/**
 * Track a custom event in Google Analytics
 * @param {string} eventName - Name of the event (e.g., 'button_click', 'signup_start')
 * @param {object} params - Additional parameters for the event
 */
export const trackEvent = (eventName, params = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
            ...params,
            timestamp: new Date().toISOString(),
        });
    }
};

// Pre-defined event names for consistency
export const GA_EVENTS = {
    // Creators Page Events
    CREATORS_PAGE_VIEW: 'creators_page_view',

    // Username Check
    USERNAME_CHECK_START: 'username_check_start',
    USERNAME_CHECK_RESULT: 'username_check_result',

    // CTA Buttons
    GET_STARTED_CLICK: 'get_started_click',
    CREATE_PAGE_CLICK: 'create_page_click',
    SETUP_PAGE_CLICK: 'setup_page_click',
    RESERVE_USERNAME_CLICK: 'reserve_username_click',

    // Auth Events
    AUTH_MODAL_OPEN: 'auth_modal_open',
    GOOGLE_SIGNIN_CLICK: 'google_signin_click',
    EMAIL_LOGIN_START: 'email_login_start',
    EMAIL_LOGIN_SUCCESS: 'email_login_success',
    EMAIL_LOGIN_FAIL: 'email_login_fail',
    EMAIL_SIGNUP_START: 'email_signup_start',
    EMAIL_SIGNUP_OTP_SENT: 'email_signup_otp_sent',
    EMAIL_SIGNUP_OTP_VERIFY: 'email_signup_otp_verify',
    EMAIL_SIGNUP_SUCCESS: 'email_signup_success',
    EMAIL_SIGNUP_FAIL: 'email_signup_fail',

    // Forgot Password
    FORGOT_PASSWORD_START: 'forgot_password_start',
    FORGOT_PASSWORD_OTP_SENT: 'forgot_password_otp_sent',
    FORGOT_PASSWORD_OTP_VERIFY: 'forgot_password_otp_verify',
    FORGOT_PASSWORD_SUCCESS: 'forgot_password_success',

    // Setup Events
    SETUP_AVATAR_RANDOMIZE: 'setup_avatar_randomize',
    SETUP_AVATAR_UPLOAD: 'setup_avatar_upload',
    SETUP_USERNAME_CHECK: 'setup_username_check',
    SETUP_COMPLETE: 'setup_complete',

    // Navigation
    NAVBAR_LOGO_CLICK: 'navbar_logo_click',
    NAVBAR_GET_STARTED_CLICK: 'navbar_get_started_click',

    // Auth Toggle
    AUTH_SWITCH_TO_LOGIN: 'auth_switch_to_login',
    AUTH_SWITCH_TO_SIGNUP: 'auth_switch_to_signup',
    AUTH_MODAL_CLOSE: 'auth_modal_close',

    // Resend OTP
    RESEND_OTP_CLICK: 'resend_otp_click',
};

export default trackEvent;
