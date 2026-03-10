import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, AddToCartDto, UpdateCartDto } from './models/cart.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  get cartItemCount(): number {
    return this.cartSubject.value?.items?.length ?? 0;
  }

  get cartTotal(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
      0,
    );
  }

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart`).pipe(
      tap((cart) => this.cartSubject.next(cart)),
    );
  }

  addToCart(dto: AddToCartDto): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/cart/add`, dto).pipe(
      tap((cart) => this.cartSubject.next(cart)),
    );
  }

  updateCartItem(dto: UpdateCartDto): Observable<Cart> {
    return this.http.patch<Cart>(`${this.apiUrl}/cart/update`, dto).pipe(
      tap((cart) => this.cartSubject.next(cart)),
    );
  }

  removeFromCart(productId: string): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.apiUrl}/cart/remove/${productId}`)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  clearCart(): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/cart/clear`)
      .pipe(tap(() => this.cartSubject.next(null)));
  }

  clearLocalCart(): void {
    this.cartSubject.next(null);
  }
}
