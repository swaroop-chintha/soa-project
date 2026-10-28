package com.aegis.claim.exception;

public class ServiceCommunicationException extends RuntimeException {

    private final String serviceName;

    public ServiceCommunicationException(String serviceName, String message) {
        super(message);
        this.serviceName = serviceName;
    }

    public ServiceCommunicationException(String serviceName, String message, Throwable cause) {
        super(message, cause);
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
