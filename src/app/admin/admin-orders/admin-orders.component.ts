import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../orders/order.service';
import { Order, OrderStatus } from '../../orders/models/order.model';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './admin-orders.component.html',
    styleUrls: ['./admin-orders.component.scss'],
})
export class AdminOrdersComponent implements OnInit {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading = false;
    error = '';
    success = '';
    activeFilter: string = 'ALL';

    readonly allStatuses = Object.values(OrderStatus);

    readonly filters = [
        { label: 'All', value: 'ALL' },
        { label: 'Placed', value: OrderStatus.PLACED },
        { label: 'Confirmed', value: OrderStatus.CONFIRMED },
        { label: 'Shipped', value: OrderStatus.SHIPPED },
        { label: 'Out for Delivery', value: OrderStatus.OUT_FOR_DELIVERY },
        { label: 'Delivered', value: OrderStatus.DELIVERED },
        { label: 'Cancelled', value: OrderStatus.CANCELLED },
    ];

    statusSelections: Record<string, string> = {};

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.orderService.getAllOrders().subscribe({
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

    getOrderCount(status: string): number {
        if (status === 'ALL') return this.orders.length;
        return this.orders.filter((o) => o.status === status).length;
    }

    updateStatus(orderId: string): void {
        const newStatus = this.statusSelections[orderId] as OrderStatus;
        if (!newStatus) return;

        this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
            next: (updated) => {
                const idx = this.orders.findIndex((o) => o.id === orderId);
                if (idx >= 0) this.orders[idx] = updated;
                this.applyFilter();
                this.success = `Order #${orderId.slice(0, 8)} updated to ${newStatus.replace('_', ' ')}`;
                this.statusSelections[orderId] = '';
                setTimeout(() => (this.success = ''), 3000);
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to update status';
            },
        });
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
}
