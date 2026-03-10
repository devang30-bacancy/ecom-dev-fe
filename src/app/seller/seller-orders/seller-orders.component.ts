import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../orders/order.service';
import { Order, OrderStatus } from '../../orders/models/order.model';

@Component({
    selector: 'app-seller-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './seller-orders.component.html',
    styleUrls: ['./seller-orders.component.scss'],
})
export class SellerOrdersComponent implements OnInit {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    shippers: any[] = [];
    loading = false;
    error = '';
    success = '';
    activeFilter = 'ALL';
    selectedOrder: Order | null = null;
    selectedShippers: Record<string, string> = {};
    processingOrders = new Set<string>();

    readonly filters = [
        { label: 'All', value: 'ALL' },
        { label: 'Placed', value: OrderStatus.PLACED },
        { label: 'Confirmed', value: OrderStatus.CONFIRMED },
        { label: 'Shipped', value: OrderStatus.SHIPPED },
        { label: 'Out for Delivery', value: OrderStatus.OUT_FOR_DELIVERY },
        { label: 'Delivered', value: OrderStatus.DELIVERED },
        { label: 'Cancelled', value: OrderStatus.CANCELLED },
    ];

    readonly OrderStatus = OrderStatus;

    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.loadOrders();
        this.loadShippers();
    }

    loadOrders(): void {
        this.loading = true;
        this.orderService.getSellerOrders().subscribe({
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

    loadShippers(): void {
        this.orderService.getShippers().subscribe({
            next: (shippers) => (this.shippers = shippers),
            error: () => { },
        });
    }

    setFilter(value: string): void {
        this.activeFilter = value;
        this.applyFilter();
    }

    applyFilter(): void {
        if (this.activeFilter === 'ALL') {
            this.filteredOrders = this.orders;
        } else {
            this.filteredOrders = this.orders.filter((o) => o.status === this.activeFilter);
        }
    }

    getOrderCount(status: string): number {
        if (status === 'ALL') return this.orders.length;
        return this.orders.filter((o) => o.status === status).length;
    }

    openDetail(order: Order): void {
        this.selectedOrder = order;
    }

    closeDetail(): void {
        this.selectedOrder = null;
    }

    confirmOrder(orderId: string): void {
        if (this.processingOrders.has(orderId)) return;
        this.processingOrders.add(orderId);
        this.clearMessages();

        this.orderService.updateSellerOrderStatus(orderId, OrderStatus.CONFIRMED).subscribe({
            next: (updated) => {
                this.updateOrderInList(updated);
                this.success = `Order #${orderId.slice(0, 8)} confirmed successfully!`;
                this.processingOrders.delete(orderId);
                setTimeout(() => (this.success = ''), 4000);
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to confirm order';
                this.processingOrders.delete(orderId);
            },
        });
    }

    cancelOrder(orderId: string): void {
        const shortId = orderId.slice(0, 8);
        if (!confirm(`Cancel order #${shortId}? Stock will be restored automatically.`)) return;
        if (this.processingOrders.has(orderId)) return;
        this.processingOrders.add(orderId);
        this.clearMessages();

        this.orderService.updateSellerOrderStatus(orderId, OrderStatus.CANCELLED).subscribe({
            next: (updated) => {
                this.updateOrderInList(updated);
                if (this.selectedOrder?.id === orderId) {
                    this.selectedOrder = updated;
                }
                this.success = `Order #${shortId} cancelled. Stock has been restored.`;
                this.processingOrders.delete(orderId);
                setTimeout(() => (this.success = ''), 4000);
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to cancel order';
                this.processingOrders.delete(orderId);
            },
        });
    }

    assignShipper(orderId: string): void {
        const shipperId = this.selectedShippers[orderId];
        if (!shipperId) return;
        if (this.processingOrders.has(orderId)) return;
        this.processingOrders.add(orderId);
        this.clearMessages();

        this.orderService.assignShipper(orderId, shipperId).subscribe({
            next: (updated) => {
                this.updateOrderInList(updated);
                if (this.selectedOrder?.id === orderId) {
                    this.selectedOrder = updated;
                }
                this.success = `Shipper assigned to order #${orderId.slice(0, 8)}`;
                this.selectedShippers[orderId] = '';
                this.processingOrders.delete(orderId);
                setTimeout(() => (this.success = ''), 4000);
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to assign shipper';
                this.processingOrders.delete(orderId);
            },
        });
    }

    private updateOrderInList(updated: Order): void {
        const idx = this.orders.findIndex((o) => o.id === updated.id);
        if (idx >= 0) this.orders[idx] = updated;
        this.applyFilter();
    }

    private clearMessages(): void {
        this.error = '';
        this.success = '';
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

    canConfirm(order: Order): boolean {
        return order.status === OrderStatus.PLACED;
    }

    canCancel(order: Order): boolean {
        return order.status === OrderStatus.PLACED || order.status === OrderStatus.CONFIRMED;
    }

    getShippingAddress(order: Order): string {
        const parts = [
            order.shippingAddress,
            order.shippingCity,
            order.shippingState,
            order.shippingZip,
            order.shippingCountry,
        ].filter(Boolean);
        return parts.length ? parts.join(', ') : 'Not provided';
    }
}
