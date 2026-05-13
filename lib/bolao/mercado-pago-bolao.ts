/**
 * URL do checkout/link Mercado Pago da inscrição no bolão.
 * Configure `NEXT_PUBLIC_BOLAO_MERCADO_PAGO_URL` no ambiente de deploy.
 *
 * Constante nomeada conforme placeholder do produto até o link real ser definido.
 */
export const LINK_MERCADO_PAGO_PLACEHOLDER =
  process.env.NEXT_PUBLIC_BOLAO_MERCADO_PAGO_URL?.trim() ||
  "https://www.mercadopago.com.br/";
