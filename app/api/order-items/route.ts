import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const tableName = "order-items";

export async function GET(request: Request) {
  let response;
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const uuid_transactions = searchParams.get("uuid_transactions") || "";

  response = await supabase
    .from(tableName)
    .select()
    .ilike("uuid_transactions", `%${uuid_transactions}%`);

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const data = await request.json();

  const response = await supabase.from(tableName).insert(data).select();

  return NextResponse.json(response);
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const data = await request.json();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const response = await supabase
    .from(tableName)
    .update(data)
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json(response);
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const data = await request.json();

  const response = await supabase.from(tableName).delete().eq("id", data.id);

  return NextResponse.json(response);
}
