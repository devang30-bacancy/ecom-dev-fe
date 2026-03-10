import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../cart/cart.service';
import { PaymentService, PaymentIntentResponse } from '../../payments/payment.service';
import { Cart, CartItem } from '../../cart/models/cart.model';
import { Order } from '../../orders/models/order.model';
import { environment } from '../../../environments/environment';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent implements OnInit, AfterViewInit, OnDestroy {
  cart: Cart | null = null;
  loading = false;
  placing = false;
  error = '';
  successOrder: Order | null = null;

  // Stripe
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;
  paymentIntent: PaymentIntentResponse | null = null;
  cardReady = false;
  cardError = '';

  // Shipping address
  shippingAddress = '';
  shippingCity = '';
  shippingState = '';
  shippingZip = '';
  shippingCountry = 'US';

  // Steps
  currentStep = 1; // 1=shipping, 2=payment, 3=review

  @ViewChild('cardElementRef') cardElementRef!: ElementRef;

  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loadCart();
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  ngAfterViewInit(): void {
    // Card element mounted in step 2
  }

  ngOnDestroy(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
        if (!cart || !cart.items || cart.items.length === 0) {
          this.error = 'Your cart is empty. Add items before checking out.';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load cart';
        this.loading = false;
      },
    });
  }

  getSubtotal(item: CartItem): number {
    return Number(item.priceSnapshot) * item.quantity;
  }

  getCartTotal(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce(
      (sum, item) => sum + this.getSubtotal(item),
      0,
    );
  }

  getTotalItems(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  isShippingValid(): boolean {
    return !!(
      this.shippingAddress.trim() &&
      this.shippingCity.trim() &&
      this.shippingState.trim() &&
      this.shippingZip.trim()
    );
  }

  goToStep(step: number): void {
    if (step === 2 && !this.isShippingValid()) {
      return;
    }
    this.currentStep = step;
    if (step === 2) {
      setTimeout(() => this.mountCardElement(), 100);
    }
  }

  private mountCardElement(): void {
    if (!this.stripe || !this.cardElementRef || this.cardElement) return;

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#e2e8f0',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          '::placeholder': { color: '#64748b' },
        },
        invalid: { color: '#f87171' },
      },
    });
    this.cardElement.mount(this.cardElementRef.nativeElement);
    this.cardElement.on('change', (event: any) => {
      this.cardError = event.error ? event.error.message : '';
      this.cardReady = event.complete;
      this.cdr.detectChanges();
    });
  }

  async placeOrder(): Promise<void> {
    if (this.placing || !this.stripe || !this.cardElement) return;
    this.placing = true;
    this.error = '';

    // Step 1: Create payment intent on backend
    this.paymentService.createPaymentIntent().subscribe({
      next: async (intent) => {
        try {
          this.paymentIntent = intent;

          // Step 2: Confirm payment with Stripe
          const { error, paymentIntent } = await this.stripe!.confirmCardPayment(
            intent.clientSecret,
            {
              payment_method: {
                card: this.cardElement!,
              },
            },
          );

          if (error) {
            this.error = error.message || 'Payment failed';
            this.placing = false;
            this.cdr.detectChanges();
            return;
          }

          if (paymentIntent?.status === 'succeeded') {
            // Step 3: Confirm on backend and create order
            this.paymentService
              .confirmPayment({
                paymentIntentId: paymentIntent.id,
                shippingAddress: this.shippingAddress,
                shippingCity: this.shippingCity,
                shippingState: this.shippingState,
                shippingZip: this.shippingZip,
                shippingCountry: this.shippingCountry,
              })
              .subscribe({
                next: (order) => {
                  this.successOrder = order;
                  this.cartService.clearLocalCart();
                  this.placing = false;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.error =
                    err.error?.message ||
                    'Payment succeeded but order creation failed. Please contact support.';
                  this.placing = false;
                  this.cdr.detectChanges();
                },
              });
          }
        } catch (err: any) {
          this.error = err.message || 'An unexpected error occurred during payment processing.';
          this.placing = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error =
          err.error?.message || 'Failed to initialize payment. Please try again.';
        this.placing = false;
      },
    });
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
