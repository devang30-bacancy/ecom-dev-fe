import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../orders/order.service';
import { Order, OrderStatus } from '../../orders/models/order.model';

@Component({
    selector: 'app-shipper-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './shipper-dashboard.component.html',
    styleUrls: ['./shipper-dashboard.component.scss'],
})
export class ShipperDashboardComponent implements OnInit {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = false;
    error = '';
    activeFilter: string = 'ALL';

    readonly filters = [
        { label: 'All', value: 'ALL' },
        { label: 'Confirmed', value: OrderStatus.CONFIRMED },
        { label: 'Shipped', value: OrderStatus.SHIPPED },
        { label: 'Out for Delivery', value: OrderStatus.OUT_FOR_DELIVERY },
        { label: 'Delivered', value: OrderStatus.DELIVERED },
    ];

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.orderService.getShipperOrders().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.applyFilter();
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to load orders';
                this.loading = false;
            },
        });
    }

    applyFilter(): void {
        if (this.activeFilter === 'ALL') {
            this.filteredOrders = this.orders;
        } else {
            this.filteredOrders = this.orders.filter(
                (o) => o.status === this.activeFilter,
            );
        }
    }

    setFilter(filter: string): void {
        this.activeFilter = filter;
        this.applyFilter();
    }

    getStatusClass(status: OrderStatus): string {
        const map: Record<string, string> = {
            [OrderStatus.PLACED]: 'status-placed',
            [OrderStatus.CONFIRMED]: 'status-confirmed',
            [OrderStatus.SHIPPED]: 'status-shipped',
            [OrderStatus.OUT_FOR_DELIVERY]: 'status-out-for-delivery',
            [OrderStatus.DELIVERED]: 'status-delivered',
            [OrderStatus.CANCELLED]: 'status-cancelled',
        };
        return map[status] || '';
    }

    getTotalItems(order: Order): number {
        return order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    }

    getOrderCount(status: string): number {
        if (status === 'ALL') return this.orders.length;
        return this.orders.filter((o) => o.status === status).length;
    }
}
