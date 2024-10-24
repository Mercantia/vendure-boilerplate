import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import {
  addPaymentToOrder,
  createStripePaymentIntent,
  generateBraintreeClientToken,
  getEligiblePaymentMethods,
  getNextOrderStates,
  transitionOrderToState,
} from '~/providers/checkout/checkout';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { OutletContext } from '~/types';
import { CurrencyCode, ErrorCode, ErrorResult } from '~/generated/graphql';
import { StripePayments } from '~/components/checkout/stripe/StripePayments';
import { DummyPayments } from '~/components/checkout/DummyPayments';
import { BraintreeDropIn } from '~/components/checkout/braintree/BraintreePayments';
import { getActiveOrder } from '~/providers/orders/order';
import { getSessionStorage } from '~/sessions';
import { useTranslation } from 'react-i18next';

export default function CheckoutPayment() {
  const {
    eligiblePaymentMethods,
    stripePaymentIntent,
    stripePublishableKey,
    stripeError,
    brainTreeKey,
    brainTreeError,
    error,
    seller, // Receber o seller aqui
  } = useLoaderData<typeof loader>();
  const { activeOrderFetcher, activeOrder } = useOutletContext<OutletContext>();
  const { t } = useTranslation();

  const paymentError = getPaymentError(error);

  return (
    <div className="flex flex-col items-center divide-gray-200 divide-y">
      {eligiblePaymentMethods.map((paymentMethod) =>
        paymentMethod.code.includes('braintree') ? (
          <div className="py-3 w-full" key={paymentMethod.id}>
            {brainTreeError ? (
              <div>
                <p className="text-red-700 font-bold">
                  {t('checkout.braintreeError')}
                </p>
                <p className="text-sm">{brainTreeError}</p>
              </div>
            ) : (
              <BraintreeDropIn
                fullAmount={activeOrder?.totalWithTax ?? 0}
                currencyCode={
                  activeOrder?.currencyCode ?? ('USD' as CurrencyCode)
                }
                show={true}
                authorization={brainTreeKey!}
              />
            )}
          </div>
        ) : paymentMethod.code.includes('stripe') ? (
          <div className="py-12" key={paymentMethod.id}>
            {stripeError ? (
              <div>
                <p className="text-red-700 font-bold">
                  {t('checkout.stripeError')}
                </p>
                <p className="text-sm">{stripeError}</p>
              </div>
            ) : (
              <StripePayments
                orderCode={activeOrder?.code ?? ''}
                clientSecret={stripePaymentIntent!}
                publishableKey={stripePublishableKey!}
              ></StripePayments>
            )}
          </div>
        ) : (
          <div className="py-12" key={paymentMethod.id}>
            <DummyPayments
              paymentMethod={paymentMethod}
              paymentError={paymentError}
            />
          </div>
        ),
      )}
    </div>
  );
}

function getPaymentError(error?: ErrorResult): string | undefined {
  if (!error || !error.errorCode) {
    return undefined;
  }
  switch (error.errorCode) {
    case ErrorCode.OrderPaymentStateError:
    case ErrorCode.IneligiblePaymentMethodError:
    case ErrorCode.PaymentFailedError:
    case ErrorCode.PaymentDeclinedError:
    case ErrorCode.OrderStateTransitionError:
    case ErrorCode.NoActiveOrderError:
      return error.message;
  }
}
