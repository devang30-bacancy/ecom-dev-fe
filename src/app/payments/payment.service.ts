import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
}

export interface ConfirmPaymentRequest {
    paymentIntentId: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry?: string;
}

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    createPaymentIntent(): Observable<PaymentIntentResponse> {
        return this.http.post<PaymentIntentResponse>(
            `${this.apiUrl}/payments/create-intent`,
            {},
        );
    }

    confirmPayment(data: ConfirmPaymentRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/payments/confirm`, data);
    }
}
