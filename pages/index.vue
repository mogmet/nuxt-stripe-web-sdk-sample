<template>
  <v-row>
    <!-- 課金済みは現在課金している情報を表示 -->
    <v-col v-if='this.subscriptions.length > 0'>
      <v-card v-for='subscript in subscriptions' :key='subscript.id'>
        <v-card-title>{{getProductTitle(subscript.product)}}</v-card-title>
        <v-card-text>{{subscript.current_period_start}} - {{subscript.current_period_end}}</v-card-text>
      </v-card>
    </v-col>
    <!-- 商品一覧を表示 -->
    <v-col v-for="product in products" v-else :key="product.id">
      <v-img :src='product.images[0]' height='240' aspect-ratio='3' />
      <v-card :loading='isLoading'>
        <v-card-title>{{product.name}}</v-card-title>
        <v-card-subtitle>{{product.description}}</v-card-subtitle>
        <v-card-text>
          <p>{{product.prices[0].unit_amount}}{{product.prices[0].currency}} / {{product.prices[0].interval_count}}{{product.prices[0].interval}}</p>
        </v-card-text>
        <v-card-actions><v-btn :loading='isLoading' @click='onClickPurchase(product.prices[0].id)'>購入</v-btn></v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang='ts'>

import {
  createCheckoutSession,
  getProducts,
  onCurrentUserSubscriptionUpdate,
  // eslint-disable-next-line import/named
  Product,
  // eslint-disable-next-line import/named
  Subscription
} from '@stripe/firestore-stripe-payments'
import Vue from 'vue'
import { signInAnonymously } from 'firebase/auth'
import { payments } from '~/stripe'
import { auth } from '~/firebase/firebase'
interface PageStripeData {
  products: Product[],
  subscriptions: Subscription[],
  isLoading: boolean
}
export default Vue.extend({
  name: 'Stripe',
  data(): PageStripeData {
    return {
      products: [] as Product[],
      subscriptions: [] as Subscription[],
      isLoading: false
    }
  },
  async created() {
    await signInAnonymously(auth)
    // 商品一覧を取得
    const products = await getProducts(payments, {
      includePrices: true,
      activeOnly: true,
    })
    this.products = products
    // 既に課金済みであればサブスク情報をセットする
    onCurrentUserSubscriptionUpdate(payments, snapshot => {
      this.subscriptions = snapshot.changes.map(value => value.subscription)
    })
  },
  methods: {
    /// サブスク購入処理
    async onClickPurchase(priceId: string): Promise<void> {
      this.isLoading = true
      try {
        const session = await createCheckoutSession(payments, {
          price: priceId,
          success_url: window.location.origin,
          cancel_url: window.location.origin
        })
        window.location.assign(session.url)
      } catch (error) {
        alert(error)
      } finally {
        this.isLoading = false
      }
    },
    /// 商品名を返す
    getProductTitle(productId: string): string {
      return this.products.find(product => product.id === productId)?.name ?? ''
    }
  }
})
</script>
