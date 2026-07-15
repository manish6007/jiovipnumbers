import { createClient } from "@/lib/supabase/server";
import type { VipNumberWithRelations, Banner, Category } from "@/types/database";

const NUMBER_SELECT = `
  *,
  partner:partners!inner ( id, business_name, verification_status, rating, review_count, logo_url ),
  category:categories ( id, name, slug ),
  images:number_images ( id, url, sort_order )
`;

/** Only approved listings from approved partners that are live. */
function publicFilter<T>(q: T): T {
  // Applied by caller via .eq chains; kept here for documentation.
  return q;
}

export interface NumberSearchParams {
  q?: string;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  pattern?: string; // repeated | ascending | descending | mirror
  category?: string; // slug
  state?: string;
  circle?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "trending";
  page?: number;
  pageSize?: number;
}

export async function searchNumbers(params: NumberSearchParams): Promise<{
  data: VipNumberWithRelations[];
  count: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("numbers")
    .select(NUMBER_SELECT, { count: "exact" })
    .eq("listing_status", "approved")
    .neq("status", "paused")
    .eq("partner.verification_status", "approved");

  if (params.q) query = query.ilike("mobile_number", `%${params.q.replace(/\D/g, "")}%`);
  if (params.startsWith)
    query = query.ilike("mobile_number", `${params.startsWith.replace(/\D/g, "")}%`);
  if (params.endsWith)
    query = query.ilike("mobile_number", `%${params.endsWith.replace(/\D/g, "")}`);
  if (params.contains)
    query = query.ilike("mobile_number", `%${params.contains.replace(/\D/g, "")}%`);

  switch (params.pattern) {
    case "repeated":
      query = query.eq("has_repeated_digits", true);
      break;
    case "ascending":
      query = query.eq("is_ascending", true);
      break;
    case "descending":
      query = query.eq("is_descending", true);
      break;
    case "mirror":
      query = query.eq("is_mirror", true);
      break;
  }

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (params.state) query = query.eq("state", params.state);
  if (params.circle) query = query.eq("circle", params.circle);
  if (typeof params.minPrice === "number")
    query = query.gte("selling_price", params.minPrice);
  if (typeof params.maxPrice === "number")
    query = query.lte("selling_price", params.maxPrice);

  switch (params.sort) {
    case "price_asc":
      query = query.order("selling_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("selling_price", { ascending: false });
      break;
    case "trending":
      query = query.order("views", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("searchNumbers error", error.message);
    return { data: [], count: 0 };
  }
  return { data: (data as unknown as VipNumberWithRelations[]) ?? [], count: count ?? 0 };
}

async function fetchSection(
  column: "is_featured" | "is_trending" | "created_at",
  limit = 8,
): Promise<VipNumberWithRelations[]> {
  const supabase = await createClient();
  let query = supabase
    .from("numbers")
    .select(NUMBER_SELECT)
    .eq("listing_status", "approved")
    .eq("status", "available")
    .eq("partner.verification_status", "approved")
    .limit(limit);

  if (column === "created_at") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.eq(column, true).order("created_at", { ascending: false });
  }

  const { data } = await query;
  return (data as unknown as VipNumberWithRelations[]) ?? [];
}

export async function getHomeSections() {
  const supabase = await createClient();
  const [featured, trending, newest, business, lucky, bannersRes, categoriesRes] =
    await Promise.all([
      fetchSection("is_featured"),
      fetchSection("is_trending"),
      fetchSection("created_at"),
      getByCategory("business", 8),
      getByCategory("lucky", 8),
      supabase.from("banners").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    ]);

  return {
    featured,
    trending,
    newest,
    business,
    lucky,
    banners: (bannersRes.data as Banner[]) ?? [],
    categories: (categoriesRes.data as Category[]) ?? [],
  };
}

export async function getByCategory(
  slug: string,
  limit = 8,
): Promise<VipNumberWithRelations[]> {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!cat) return [];
  const { data } = await supabase
    .from("numbers")
    .select(NUMBER_SELECT)
    .eq("listing_status", "approved")
    .eq("status", "available")
    .eq("partner.verification_status", "approved")
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as VipNumberWithRelations[]) ?? [];
}

export async function getNumberBySlug(
  slug: string,
): Promise<VipNumberWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("numbers")
    .select(NUMBER_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as VipNumberWithRelations) ?? null;
}

export async function getRelatedNumbers(
  number: VipNumberWithRelations,
  limit = 4,
): Promise<VipNumberWithRelations[]> {
  const supabase = await createClient();
  let query = supabase
    .from("numbers")
    .select(NUMBER_SELECT)
    .eq("listing_status", "approved")
    .eq("status", "available")
    .eq("partner.verification_status", "approved")
    .neq("id", number.id)
    .limit(limit);
  if (number.category_id) query = query.eq("category_id", number.category_id);
  const { data } = await query;
  return (data as unknown as VipNumberWithRelations[]) ?? [];
}

export { publicFilter };
