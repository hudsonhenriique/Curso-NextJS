import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/invoices/table";
import { CreateInvoice } from "@/app/ui/invoices/buttons";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { fetchInvoicesPages } from "@/app/lib/data";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabeçalho com título e barra de pesquisa */}
      <div className="flex flex-col gap-4">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
        <Search placeholder="Search invoices..." />
      </div>

      {/* Botão de criar fatura e tabela */}
      <div className="flex flex-col gap-4">
        <CreateInvoice />
        <Suspense
          key={query + currentPage}
          fallback={<InvoicesTableSkeleton />}
        >
          <Table query={query} currentPage={currentPage} />
        </Suspense>
      </div>

      {/* Paginação na parte inferior */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
