import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createContestantAction } from "@/app/actions";
import { ImageUploader } from "@/components/image-uploader";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveImageUrl } from "@/lib/image";

export default async function ContestantsPage({ params, searchParams }: PageProps<"/dashboard/events/[id]/contestants">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const query = await searchParams;
  const event = await db.event.findFirst({ where: { id, ownerId: user.id }, include: { categories: { include: { contestants: { include: { imageAsset: true } } }, orderBy: { displayOrder: "asc" } } } });
  if (!event) notFound();
  const contestants = event.categories.flatMap((category) => category.contestants.map((contestant) => ({ ...contestant, categoryName: category.name })));
  return <div className="dashboard-grid">
    <section className="dashboard-card">
      <div className="card-heading"><h3>Contestants</h3><span>{contestants.length} total</span></div>
      {query.added && <p className="fee-disclosure">Contestant saved. Add their portrait below.</p>}
      {contestants.length ? contestants.map((contestant) => <div className="contestant-manager" key={contestant.id}>
        <div className="dash-event-row"><Image src={resolveImageUrl(contestant.imageAsset, contestant.imageUrl, "thumb", "/person-placeholder.svg")} alt="" width={48} height={42} /><span><b>{contestant.name}</b><small>{contestant.categoryName} · {contestant.voteTotal.toLocaleString()} votes</small></span><strong>{contestant.status}</strong></div>
        <ImageUploader compact entityType="contestant" entityId={contestant.id} label={`${contestant.name} photo`} aspect="portrait" currentImage={resolveImageUrl(contestant.imageAsset, contestant.imageUrl, "thumb", "")} />
      </div>) : <div className="empty-state"><h3>No contestants yet</h3><p>Add nominees once you have created a category.</p></div>}
    </section>
    <form action={createContestantAction} className="dashboard-card form-stack">
      <div className="card-heading"><h3>Add contestant</h3></div><input type="hidden" name="eventId" value={event.id} />
      <label className="form-field"><span>Category</span><select name="categoryId" required><option value="">Select category</option>{event.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
      <label className="form-field"><span>Name</span><input name="name" required placeholder="Contestant full name" /></label>
      <label className="form-field"><span>Description</span><textarea name="description" placeholder="A short, compelling introduction" /></label>
      <label className="form-field"><span>Reference (optional)</span><input name="reference" placeholder="e.g. CON-012" /></label>
      <p className="field-help">After saving, upload a validated 4:5 portrait from the contestant list.</p>
      <button className="button button-primary" disabled={!event.categories.length}>Add contestant</button>
    </form>
  </div>;
}
