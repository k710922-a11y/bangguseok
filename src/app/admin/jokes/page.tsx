import { revalidatePath } from "next/cache";
import { requireAdmin, str, ui } from "../_lib";

export const dynamic = "force-dynamic";

async function saveJoke(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const row = {
    question: str(formData, "question") ?? "",
    answer: str(formData, "answer") ?? "",
    wrong_answer: str(formData, "wrong_answer"),
    asker: str(formData, "asker") === "deokgu" ? "deokgu" : "chunsik",
    active: formData.get("active") === "on",
  };
  if (!row.question || !row.answer) return;
  if (id) await supabase.from("jokes").update(row).eq("id", id);
  else await supabase.from("jokes").insert(row);
  revalidatePath("/admin/jokes");
}

async function deleteJoke(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("jokes").delete().eq("id", id);
  revalidatePath("/admin/jokes");
}

type J = { id: string; question: string; answer: string; wrong_answer: string | null; asker: string; active: boolean };

function Row({ j }: { j?: J }) {
  return (
    <form action={saveJoke} className={`${ui.card} grid gap-3 md:grid-cols-[2fr_1.4fr_2fr_auto_auto] items-end`}>
      {j && <input type="hidden" name="id" value={j.id} />}
      <div className="flex flex-col gap-1">
        <label className={ui.label} htmlFor={`q-${j?.id ?? "new"}`}>문제</label>
        <input id={`q-${j?.id ?? "new"}`} name="question" defaultValue={j?.question} required className={ui.input} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={ui.label} htmlFor={`a-${j?.id ?? "new"}`}>정답</label>
        <input id={`a-${j?.id ?? "new"}`} name="answer" defaultValue={j?.answer} required className={ui.input} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={ui.label} htmlFor={`w-${j?.id ?? "new"}`}>상대의 오답</label>
        <input id={`w-${j?.id ?? "new"}`} name="wrong_answer" defaultValue={j?.wrong_answer ?? ""} className={ui.input} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={ui.label} htmlFor={`k-${j?.id ?? "new"}`}>출제</label>
        <select id={`k-${j?.id ?? "new"}`} name="asker" defaultValue={j?.asker ?? "chunsik"} className={ui.input}>
          <option value="chunsik">춘식</option>
          <option value="deokgu">덕구</option>
        </select>
      </div>
      <div className="flex items-center gap-2 h-11">
        <label className="inline-flex items-center gap-1.5 text-[13px]">
          <input type="checkbox" name="active" defaultChecked={j?.active ?? true} /> 사용
        </label>
        <button type="submit" className={j ? ui.ghost : ui.btn}>{j ? "저장" : "추가"}</button>
      </div>
    </form>
  );
}

export default async function JokesAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("jokes").select("*").order("created_at", { ascending: false });
  const jokes = (data ?? []) as J[];
  return (
    <div className="flex flex-col gap-4 max-w-[1200px]">
      <h1 className={ui.h1}>자판기 문제 <span className="font-sans text-[15px] text-muted">{jokes.length}개 · 매일 한 문제가 「오늘의 문제」로 나갑니다</span></h1>
      <Row />
      <div className="flex flex-col gap-3">
        {jokes.map((j) => (
          <div key={j.id} className="flex flex-col gap-1">
            <Row j={j} />
            <form action={deleteJoke} className="self-end">
              <input type="hidden" name="id" value={j.id} />
              <button type="submit" className="text-[12px] text-muted hover:text-accent min-h-8 px-2">삭제</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
