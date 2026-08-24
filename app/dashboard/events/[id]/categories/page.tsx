import { notFound, redirect } from "next/navigation";
import { createCategoryAction } from "@/app/actions";
import { ImageUploader } from "@/components/image-uploader";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveImageUrl } from "@/lib/image";
import { formatMoney } from "@/lib/money";

export default async function CategoriesPage({ params, searchParams }: PageProps<"/dashboard/events/[id]/categories">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const event = await db.event.findFirst({
    where: { id, ownerId: user.id },
    include: { coverImage: true, categories: { include: { contestants: true, imageAsset: true }, orderBy: { displayOrder: "asc" } } },
  });
  if (!event) notFound();
  return <>
    <section className="dashboard-card" style={{ marginBottom: 18 }}>
      <div className="card-heading"><div><h3>Event cover</h3><span>Landscape 16:9 works best across voting pages.</span></div></div>
      <ImageUploader entityType="event" entityId={event.id} label="Event cover" aspect="cover" currentImage={resolveImageUrl(event.coverImage, event.coverUrl, "cover", "")} />
    </section>
    <div className="dashboard-grid">
      <section className="dashboard-card">
        <div className="card-heading"><h3>Voting categories</h3><span>{event.categories.length} total</span></div>
        {query.created && <p className="fee-disclosure">Event saved. Add at least one category, then add contestants.</p>}
        {event.categories.length ? event.categories.map((category, index) => <div className="category-manager" key={category.id}>
          <div className="dash-event-row"><span className="category-number">0{index + 1}</span><span><b>{category.name}</b><small>{category.contestants.length} contestants · {category.priceOverrideMinor ? formatMoney(category.priceOverrideMinor) : "Inherits event price"}</small></span><strong>{category.status}</strong></div>
          <ImageUploader compact entityType="category" entityId={category.id} label={`${category.name} image`} aspect="cover" currentImage={resolveImageUrl(category.imageAsset, category.imageUrl, "cover", "")} />
        </div>) : <div className="empty-state"><h3>No categories yet</h3><p>Add the first race contestants can compete in.</p></div>}
      </section>
      <form action={createCategoryAction} className="dashboard-card form-stack">
        <div className="card-heading"><h3>Add category</h3></div><input type="hidden" name="eventId" value={event.id} />
        <label className="form-field"><span>Category name</span><input name="name" required placeholder="e.g. Best Dressed" /></label>
        <label className="form-field"><span>Description</span><textarea name="description" placeholder="What does this category celebrate?" /></label>
        <label className="form-field"><span>Price override (₦)</span><input name="priceOverride" type="number" min="50" placeholder="Leave blank to inherit event price" /></label>
        <button className="button button-primary">Add category</button>
      </form>
    </div>
  </>;
}
