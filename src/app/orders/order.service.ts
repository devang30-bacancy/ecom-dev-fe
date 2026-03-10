import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus } from './models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  checkout(): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/checkout`, {});
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/seller-orders`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin/all`);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/status`, {
      status,
    });
  }

  assignShipper(orderId: string, shipperId: string): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/orders/${orderId}/assign-shipper`,
      { shipperId },
    );
  }

  getShippers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/shippers`);
  }

  updateSellerOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/orders/${orderId}/seller-status`,
      { status },
    );
  }

  getShipperOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/shipper-orders`);
  }

  getShipperOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/shipper-orders/${id}`);
  }

  updateShippingStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    notes?: string,
  ): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/orders/${orderId}/shipping-status`,
      { status, trackingNumber, notes },
    );
  }
}
