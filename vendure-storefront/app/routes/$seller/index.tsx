import { useLoaderData } from "@remix-run/react";
import { CollectionCard } from "~/components/collections/CollectionCard";
import { useTranslation } from "react-i18next";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSellerData, getCollectionsForSeller } from "~/provider/seller/seller";
import { getVendorNameFromUrl } from "~/utils";

export async function loader({ params, request }: LoaderArgs) {
  const vendureToken = getVendorNameFromUrl(request.url);
  
  // Fetch seller data using the vendureToken
  const sellerData = await getSellerData(vendureToken);
  
  // Fetch collections related to this seller
  const collections = await getCollectionsForSeller(vendureToken);

  return json({
    vendureToken,
    sellerData,
    collections,
  });
}

export default function Index() {
  const { collections, sellerData, vendureToken } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const headerImage = collections[0]?.featuredAsset?.preview;

  return (
    <>
      <div className="relative">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          {headerImage && (
            <img
              className="absolute inset-0 w-full"
              src={headerImage + '?w=800'}
              alt="header"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-400 to-black mix-blend-darken" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gray-900 opacity-50"
        />
        <div className="relative max-w-3xl mx-auto py-32 px-6 flex flex-col items-center text-center sm:py-64 lg:px-0">
          <div className="relative bg-zinc-800 bg-opacity-0 rounded-lg p-0">
            <h1 className="text-6xl text-transparent bg-clip-text font-extrabold tracking-normal lg:text-6xl bg-gradient-to-r from-yellow-600 via-red-500 to-blue-600">
              {t("seller.title")}
            </h1>
          </div>

          <p className="mt-4 text-2xl text-white">
            {t("seller.intro")}{" "}
            <a href="https://mercantia.app/millity" className="text-blue-300 hover:text-blue-500">
              Cartuchos
            </a>{" "}
            &{" "}
            <a href="~/routes/__cart/index" className="text-red-300 hover:text-red-500">
              Maquinas para Tattoo
            </a>
          </p>
          <p className="mt-4 text-gray-300 space-x-1">
            <BookOpenIcon className="w-5 h-5 inline" />
            <span>{t("seller.readMore")}</span>
            <a
              className="text-primary-200 hover:text-primary-400"
              href="https://www.vendure.io/blog/2022/05/lightning-fast-headless-commerce-with-vendure-and-remix"
            >
              {t("seller.link")}
            </a>
          </p>
        </div>
      </div>

      {/* Seller Details */}
      {sellerData && (
        <section aria-labelledby="seller-details" className="py-8">
          <h2 id="seller-details" className="text-2xl font-light tracking-tight text-gray-900">
            {t("seller.sellerDetails")}
          </h2>
          <div className="mt-4">
            <p><strong>CNPJ:</strong> {sellerData.customFields.cnpj}</p>
            <p><strong>Company Name:</strong> {sellerData.customFields.companyName}</p>
            <p><strong>Trading Name:</strong> {sellerData.customFields.tradingName}</p>
            <p><strong>State Registration:</strong> {sellerData.customFields.stateRegistration}</p>
            <p><strong>Municipal Registration:</strong> {sellerData.customFields.municipalRegistration}</p>
            <p><strong>Business Phone:</strong> {sellerData.customFields.businessPhone}</p>
            <p><strong>Responsible Person:</strong> {sellerData.customFields.responsiblePerson}</p>
          </div>
        </section>
      )}

      <section
        aria-labelledby="category-heading"
        className="pt-24 sm:pt-32 xl:max-w-7xl xl:mx-auto xl:px-8"
      >
        <div className="px-4 sm:px-6 lg:px-8 xl:px-0">
          <h2 id="category-heading" className="text-2xl font-light tracking-tight text-gray-900">
            {t("seller.shopByCategory")}
          </h2>
        </div>

        <div className="mt-4 flow-root">
          <div className="-my-2">
            <div className="box-content py-2 px-2 relative overflow-x-auto xl:overflow-visible">
              <div className="grid justify-items-center grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8 sm:px-6 lg:px-8 xl:relative xl:px-0 xl:space-x-0 xl:gap-x-8">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    vendureToken={vendureToken} // Pass the vendureToken prop here
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:hidden">
          <a
            href="~/routes/__cart/index#"
            className="block text-sm font-semibold text-primary-600 hover:text-primary-500"
          >
            {t("seller.browseCategories")}
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
