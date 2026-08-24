import { Info } from "lucide-react";
import { createEventAction } from "@/app/actions";

export const metadata = { title: "Create event" };

export default async function NewEventPage({ searchParams }: PageProps<"/dashboard/events/new">) {
  const error = (await searchParams).error;
  return (
    <main className="dashboard-content">
      <div className="dashboard-page-title"><div><h2>Create a voting event</h2><p>Start with the essentials. You&apos;ll add categories and contestants next.</p></div></div>
      <div className="wizard">
        <aside className="wizard-steps">
          <div className="active"><i>1</i><span><b>Event details</b><small>Name, artwork and dates</small></span></div>
          <div><i>2</i><span><b>Categories</b><small>Set up the races</small></span></div>
          <div><i>3</i><span><b>Contestants</b><small>Add the nominees</small></span></div>
          <div><i>4</i><span><b>Review & publish</b><small>Share with your audience</small></span></div>
        </aside>
        <form action={createEventAction} className="wizard-form">
          <h3>Tell us about your event</h3><p>These details appear on the public voting page.</p>
          {error && <p className="form-error">{String(error)}</p>}
          <div className="form-grid">
            <label className="form-field"><span>Event name</span><input name="name" required placeholder="e.g. Campus Icons Awards 2026" /></label>
            <label className="form-field"><span>Event URL</span><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="campus-icons-2026" /><small>Lowercase letters, numbers and hyphens only.</small></label>
            <label className="form-field span-2"><span>Description</span><textarea name="description" required minLength={20} placeholder="Tell voters what this event celebrates and why their vote matters." /></label>
            <div className="fee-disclosure span-2"><Info size={18} /><span>After saving, upload a secure 16:9 event cover directly from the categories step. Images are validated and stored in Cloudinary.</span></div>
            <label className="form-field"><span>Voting starts</span><input name="startAt" type="datetime-local" required /></label>
            <label className="form-field"><span>Voting ends</span><input name="endAt" type="datetime-local" required /></label>
            <label className="form-field"><span>Price per vote (₦)</span><input name="price" type="number" min="50" step="1" defaultValue="100" required /></label>
            <label className="form-field"><span>Visibility</span><select name="visibility"><option value="PUBLIC">Public — listed in Explore</option><option value="UNLISTED">Unlisted — link only</option></select></label>
            <label className="form-field"><span>Vote totals</span><select name="leaderboardVisibility"><option value="LIVE">Public during voting</option><option value="AFTER_END">Hidden until event ends</option></select></label>
            <label className="checkbox-field" style={{ alignSelf: "end", paddingBottom: 12 }}><input type="checkbox" name="publish" defaultChecked /><span>Publish as soon as setup is saved. Voting only opens at the scheduled start time.</span></label>
          </div>
          <div className="fee-disclosure"><Info size={18} /><span><strong>Transparent platform fee:</strong> E-voting deducts 5% from every successful vote transaction. You receive the remaining 95% after this event concludes.</span></div>
          <div className="form-actions"><button className="button button-primary button-lg">Save & add categories</button></div>
        </form>
      </div>
    </main>
  );
}
