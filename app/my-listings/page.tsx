import Link from "next/link";
import { ListingStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { EmptyState } from "@/components/empty-state";
import { UserListingCard } from "@/components/user-listing-card";
import { getLocale, getTranslations } from "@/lib/i18n";
import { getListingsForUser } from "@/lib/listings";
import { getUserSession } from "@/lib/user-session";

export const dynamic = "force-dynamic";

type MyListingsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function countByStatus(statuses: ListingStatus[], status: ListingStatus) {
  return statuses.filter((value) => value === status).length;
}

export default async function MyListingsPage({ searchParams = {} }: MyListingsPageProps) {
  const locale = getLocale();
  const t = getTranslations(locale);
  const session = await getUserSession();

  if (!session) {
    redirect("/login?next=/my-listings");
  }

  const listings = await getListingsForUser(session.userId);
  const statuses = listings.map((listing) => listing.status);
  const inactiveCount = listings.filter(
    (listing) => listing.availabilityStatus !== "ACTIVE"
  ).length;
  const statusNotice = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;
  const notice =
    statusNotice === "updated"
      ? t.myListings.updated
      : statusNotice === "deleted"
        ? t.myListings.deleted
        : statusNotice === "status-updated"
          ? t.myListings.statusUpdated
          : null;

  return (
    <div className="shell space-y-8">
      {notice ? (
        <div className="panel border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel p-6 sm:p-8">
          <span className="pill border-accent/25 bg-accent/5 text-accent">
            {t.myListings.pill}
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-ink">
            {t.myListings.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70">{t.myListings.intro}</p>
          <div className="mt-6">
            <Link href="/add-listing" className="btn-primary">
              {t.myListings.submitAnother}
            </Link>
          </div>
        </div>

        <div className="panel grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.myListings.total}</p>
            <p className="mt-2 font-display text-4xl font-semibold text-ink">{listings.length}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.myListings.pending}</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {countByStatus(statuses, "PENDING")}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.myListings.approved}</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {countByStatus(statuses, "APPROVED")}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{t.myListings.inactive}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{inactiveCount}</p>
          </div>
        </div>
      </section>

      {listings.length === 0 ? (
        <EmptyState
          eyebrow={t.common.noResults}
          title={t.myListings.emptyTitle}
          description={t.myListings.emptyDescription}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <UserListingCard key={listing.id} locale={locale} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
