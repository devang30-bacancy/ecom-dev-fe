import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../orders/order.service';
import { Order, OrderStatus } from '../../orders/models/order.model';

@Component({
    selector: 'app-shipper-order-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './shipper-order-detail.component.html',
    styleUrls: ['./shipper-order-detail.component.scss'],
})
export class ShipperOrderDetailComponent implements OnInit {
    order: Order | null = null;
    loading = false;
    updating = false;
    error = '';
    success = '';

    trackingNumber = '';
    shipperNotes = '';
    selectedStatus = '';

    // Quick action definitions
    readonly quickActions = [
        {
            value: OrderStatus.SHIPPED,
            label: 'Mark Shipped',
            icon: 'ship',
            color: 'amber',
            allowedFrom: [OrderStatus.CONFIRMED],
        },
        {
            value: OrderStatus.OUT_FOR_DELIVERY,
            label: 'Out for Delivery',
            icon: 'pin',
            color: 'purple',
            allowedFrom: [OrderStatus.SHIPPED],
        },
        {
            value: OrderStatus.DELIVERED,
            label: 'Mark Delivered',
            icon: 'check',
            color: 'green',
            allowedFrom: [OrderStatus.OUT_FOR_DELIVERY],
        },
    ];

    readonly timelineSteps = [
        { status: OrderStatus.PLACED, label: 'Placed', icon: '📋' },
        { status: OrderStatus.CONFIRMED, label: 'Confirmed', icon: '✅' },
        { status: OrderStatus.SHIPPED, label: 'Shipped', icon: '🚚' },
        { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: '📍' },
        { status: OrderStatus.DELIVERED, label: 'Delivered', icon: '🎉' },
    ];

    readonly statusOrder = [
        OrderStatus.PLACED,
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
    ];

    readonly OrderStatus = OrderStatus;

    constructor(
        private route: ActivatedRoute,
        private orderService: OrderService,
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.loadOrder(id);
    }

    loadOrder(id: string): void {
        this.loading = true;
        this.orderService.getShipperOrderById(id).subscribe({
            next: (order) => {
                this.order = order;
                this.trackingNumber = order.trackingNumber || '';
                this.shipperNotes = order.shipperNotes || '';
                this.loading = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Failed to load order';
                this.loading = false;
            },
        });
    }

    quickUpdate(status: OrderStatus): void {
        if (!this.order || this.updating) return;
        this.updating = true;
        this.error = '';
        this.success = '';

        this.orderService
            .updateShippingStatus(
                this.order.id,
                status,
                this.trackingNumber || undefined,
                this.shipperNotes || undefined,
            )
            .subscribe({
                next: (updated) => {
                    this.order = updated;
                    this.success = `Status updated to ${updated.status.replace('_', ' ')}`;
                    this.selectedStatus = '';
                    this.updating = false;
                    setTimeout(() => (this.success = ''), 4000);
                },
                error: (err) => {
                    this.error = err.error?.message || 'Failed to update status';
                    this.updating = false;
                },
            });
    }

    updateStatus(): void {
        if (!this.selectedStatus) return;
        this.quickUpdate(this.selectedStatus as OrderStatus);
    }

    isActionAllowed(action: { allowedFrom: OrderStatus[] }): boolean {
        return !!this.order && action.allowedFrom.includes(this.order.status);
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
