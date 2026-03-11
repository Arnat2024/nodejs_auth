import crypto from 'crypto';

/**
 * Хеширует пароль с использованием HMAC-SHA1
 * @param {string} password 
 * @returns {string}
 */
export const encrypt_pass = (password) => {
    return crypto
        .createHmac('sha1', 'abc')
        .update(password)
        .digest('hex');
};