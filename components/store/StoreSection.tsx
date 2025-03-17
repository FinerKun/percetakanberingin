import { useFetchProducts } from "@/utils/api";
import { ProductItem } from "@/components/store/ProductItem";
import { Skeleton } from "../ui/skeleton";

export function StoreSection() {
  const products = useFetchProducts();

  return (
    <section className="bg-white py-8">
      <div className="mx-auto flex flex-wrap items-start px-2 pb-12 pt-4 sm:container">
        <nav id="store" className="top-0 z-20 w-full px-6 py-1">
          <div className="container mx-auto mt-0 flex w-full flex-wrap items-center justify-between px-2 py-3">
            <h1 className="text-xl font-bold uppercase tracking-wide text-[#892217]">
              STORE
            </h1>
            <div className="flex items-center" id="store-nav-content"></div>
          </div>
        </nav>
        {products.length === 0 ? (
          <SkeletonImagesProduct />
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex w-1/2 flex-col p-4 sm:w-1/2 md:w-1/3 md:p-6 xl:w-1/4"
            >
              <ProductItem {...product} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function SkeletonImagesProduct() {
  return (
    <>
      <div className="flex w-1/2 flex-col p-4 sm:w-1/2 md:w-1/3 md:p-6 xl:w-1/4">
        <Skeleton className="_IMAGE aspect-square w-full rounded-xl border bg-slate-200" />
        <Skeleton className="_H1 mt-3 h-6 w-3/4 bg-slate-200" />
      </div>
      <div className="flex w-1/2 flex-col p-4 sm:w-1/2 md:w-1/3 md:p-6 xl:w-1/4">
        <Skeleton className="_IMAGE aspect-square w-full rounded-xl border bg-slate-200" />
        <Skeleton className="_H1 mt-3 h-6 w-3/4 bg-slate-200" />
      </div>
      <div className="flex w-1/2 flex-col p-4 sm:w-1/2 md:w-1/3 md:p-6 xl:w-1/4">
        <Skeleton className="_IMAGE aspect-square w-full rounded-xl border bg-slate-200" />
        <Skeleton className="_H1 mt-3 h-6 w-3/4 bg-slate-200" />
      </div>
      <div className="flex w-1/2 flex-col p-4 sm:w-1/2 md:w-1/3 md:p-6 xl:w-1/4">
        <Skeleton className="_IMAGE aspect-square w-full rounded-xl border bg-slate-200" />
        <Skeleton className="_H1 mt-3 h-6 w-3/4 bg-slate-200" />
      </div>
    </>
  );
}
