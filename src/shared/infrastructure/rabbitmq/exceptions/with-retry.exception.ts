
export class WithRetryException extends Error {

    constructor(message) {
        super(message);
        this.name = "ErrorWithRetry"
    }
}