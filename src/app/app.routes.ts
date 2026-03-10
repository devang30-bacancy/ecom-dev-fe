import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { GoogleCallbackComponent } from './auth/google-callback/google-callback.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { SellerProductsComponent } from './seller/seller-products/seller-products.component';
import { ProductFormComponent } from './seller/product-form/product-form.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { ProductApprovalComponent } from './admin/product-approval/product-approval.component';
import { CartPageComponent } from './cart/cart-page/cart-page.component';
import { CheckoutPageComponent } from './checkout/checkout-page/checkout-page.component';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { OrderDetailComponent } from './orders/order-detail/order-detail.component';
import { ShipperDashboardComponent } from './shipper/shipper-dashboard/shipper-dashboard.component';
import { ShipperOrderDetailComponent } from './shipper/shipper-order-detail/shipper-order-detail.component';
import { SellerOrdersComponent } from './seller/seller-orders/seller-orders.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'auth/google/callback', component: GoogleCallbackComponent },

  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  // Cart (CUSTOMER)
  {
    path: 'cart',
    component: CartPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CUSTOMER'] },
  },

  // Checkout (CUSTOMER)
  {
    path: 'checkout',
    component: CheckoutPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CUSTOMER'] },
  },

  // Orders (CUSTOMER)
  {
    path: 'orders',
    component: OrderListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CUSTOMER'] },
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CUSTOMER'] },
  },

  // Seller
  {
    path: 'seller/products',
    component: SellerProductsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER', 'ADMIN'] },
  },
  {
    path: 'seller/products/new',
    component: ProductFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER', 'ADMIN'] },
  },
  {
    path: 'seller/products/:id/edit',
    component: ProductFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER', 'ADMIN'] },
  },
  {
    path: 'seller/orders',
    component: SellerOrdersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SELLER', 'ADMIN'] },
  },

  // Shipper
  {
    path: 'shipper/orders',
    component: ShipperDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SHIPPER'] },
  },
  {
    path: 'shipper/orders/:id',
    component: ShipperOrderDetailComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SHIPPER'] },
  },

  // Admin
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/categories',
    component: CategoriesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/products',
    component: ProductApprovalComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/orders',
    component: AdminOrdersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
  },

  { path: '**', redirectTo: '/products' },
];
