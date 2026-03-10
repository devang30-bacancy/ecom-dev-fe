import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../order.service';
import { Order, OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error = '';

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load orders';
        this.loading = false;
      },
    });
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      [OrderStatus.PLACED]: 'status-placed',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.OUT_FOR_DELIVERY]: 'status-out-for-delivery',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
    };
    return map[status] || '';
  }

  getStatusIcon(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      [OrderStatus.PLACED]: '📋',
      [OrderStatus.CONFIRMED]: '✅',
      [OrderStatus.SHIPPED]: '🚚',
      [OrderStatus.OUT_FOR_DELIVERY]: '📍',
      [OrderStatus.DELIVERED]: '🎉',
      [OrderStatus.CANCELLED]: '❌',
    };
    return map[status] || '📦';
  }

  getTotalItems(order: Order): number {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }
}
