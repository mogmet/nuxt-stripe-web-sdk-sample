import { getStripePayments } from '@stripe/firestore-stripe-payments'
import { app } from '~/firebase/firebase'

export const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "customers",
});
