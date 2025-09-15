/**
 * Simple error handling utilities
 * Provides consistent error handling without over-engineering
 */

export class ErrorHandler {
    /**
     * Handle and log errors consistently
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     * @param {boolean} showUserMessage - Whether to show user-friendly message
     */
    static handle(error, context, showUserMessage = true) {
        console.error(`Error in ${context}:`, error);
        
        if (showUserMessage) {
            this.showUserMessage(error, context);
        }
    }

    /**
     * Show user-friendly error message
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     */
    static showUserMessage(error, context) {
        let message = 'An unexpected error occurred.';
        
        if (error.message) {
            if (error.message.includes('Goal percentage must be between 0 and 100')) {
                message = 'Please enter a goal percentage between 0 and 100.';
            } else if (error.message.includes('localStorage')) {
                message = 'Unable to save data. Please check your browser storage settings.';
            } else if (error.message.includes('CSV')) {
                message = 'Invalid CSV file format. Please check your file and try again.';
            } else {
                message = error.message;
            }
        }
        
        // Show alert for now - could be replaced with a toast notification
        alert(message);
    }

    /**
     * Wrap async functions with error handling
     * @param {Function} fn - Async function to wrap
     * @param {string} context - Context for error reporting
     * @returns {Function} Wrapped function
     */
    static wrapAsync(fn, context) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error; // Re-throw to allow caller to handle if needed
            }
        };
    }

    /**
     * Wrap sync functions with error handling
     * @param {Function} fn - Function to wrap
     * @param {string} context - Context for error reporting
     * @returns {Function} Wrapped function
     */
    static wrapSync(fn, context) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error; // Re-throw to allow caller to handle if needed
            }
        };
    }
}
