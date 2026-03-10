import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../order.service';
import { Order, OrderStatus } from '../models/order.model';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error = '';

  readonly timelineSteps: TimelineStep[] = [
    {
      status: OrderStatus.PLACED,
      label: 'Order Placed',
      icon: '📋',
      description: 'Your order has been received',
    },
    {
      status: OrderStatus.CONFIRMED,
      label: 'Confirmed',
      icon: '✅',
      description: 'Order confirmed & shipper assigned',
    },
    {
      status: OrderStatus.SHIPPED,
      label: 'Shipped',
      icon: '🚚',
      description: 'Package has been shipped',
    },
    {
      status: OrderStatus.OUT_FOR_DELIVERY,
      label: 'Out for Delivery',
      icon: '📍',
      description: 'Almost there!',
    },
    {
      status: OrderStatus.DELIVERED,
      label: 'Delivered',
      icon: '🎉',
      description: 'Successfully delivered',
    },
  ];

  readonly statusOrder = [
    OrderStatus.PLACED,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: string): void {
    this.loading = true;
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load order';
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

  isStepCompleted(stepStatus: OrderStatus): boolean {
    if (!this.order) return false;
    if (this.order.status === OrderStatus.CANCELLED) return false;
    const currentIdx = this.statusOrder.indexOf(this.order.status);
    const stepIdx = this.statusOrder.indexOf(stepStatus);
    return stepIdx <= currentIdx;
  }

  isStepActive(stepStatus: OrderStatus): boolean {
    return this.order?.status === stepStatus;
  }

  isCancelled(): boolean {
    return this.order?.status === OrderStatus.CANCELLED;
  }

  getTotal(): number {
    return this.order?.items?.reduce((sum, item) => sum + Number(item.subtotal), 0) ?? 0;
  }
}
