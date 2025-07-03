/**
 * Standard API Response format from backend
 * @template T - Type of the data field
 */
export class ApiResponse {
    constructor(status, message, data, timestamp) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp || new Date().toISOString();
    }

    /**
     * Check if the response indicates success
     * @returns {boolean}
     */
    isSuccess() {
        return this.status >= 200 && this.status < 300;
    }

    /**
     * Get data from response or null if unsuccessful
     * @returns {T|null}
     */
    getData() {
        return this.isSuccess() ? this.data : null;
    }
}

/**
 * Validation Error structure
 */
export class ValidationError {
    constructor(field, message) {
        this.field = field;
        this.message = message;
    }
}

/**
 * Error Response format from backend
 */
export class ErrorResponse {
    constructor(status, error, message, details = [], path = '', timestamp) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.details = details; // Array of ValidationError
        this.path = path;
        this.timestamp = timestamp || new Date().toISOString();
    }

    /**
     * Get formatted error message including validation details
     * @returns {string}
     */
    getFullErrorMessage() {
        let fullMessage = this.message;
        
        if (this.details && this.details.length > 0) {
            const validationMessages = this.details.map(detail => 
                `${detail.field}: ${detail.message}`
            ).join(', ');
            fullMessage += ` (${validationMessages})`;
        }
        
        return fullMessage;
    }

    /**
     * Get validation errors for a specific field
     * @param {string} fieldName 
     * @returns {ValidationError[]}
     */
    getFieldErrors(fieldName) {
        return this.details.filter(detail => detail.field === fieldName);
    }

    /**
     * Check if there are validation errors for a specific field
     * @param {string} fieldName 
     * @returns {boolean}
     */
    hasFieldError(fieldName) {
        return this.getFieldErrors(fieldName).length > 0;
    }
}
