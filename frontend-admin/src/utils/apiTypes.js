export class ApiResponse {
    constructor(status, message, data, timestamp) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp || new Date().toISOString();
    }

    isSuccess() {
        return this.status >= 200 && this.status < 300;
    }

    getData() {
        return this.isSuccess() ? this.data : null;
    }
}

export class ValidationError {
    constructor(field, message) {
        this.field = field;
        this.message = message;
    }
}

export class ErrorResponse {
    constructor(status, error, message, details = [], path = '', timestamp) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.details = details; 
        this.path = path;
        this.timestamp = timestamp || new Date().toISOString();
    }

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

    getFieldErrors(fieldName) {
        return this.details.filter(detail => detail.field === fieldName);
    }

    hasFieldError(fieldName) {
        return this.getFieldErrors(fieldName).length > 0;
    }
}
